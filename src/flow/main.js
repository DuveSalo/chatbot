// main.js
import { addKeyword, EVENTS } from '@builderbot/bot';
import { isSameDay } from 'date-fns';

// Importa la cola de mensajes (fast-entires.js)
import { createMessageQueue } from '../utils/fast-entires.js';

// Importa las funciones de OpenAI para clasificación y respuesta
import { runDetermine, chat } from './services/openai/index.js';

// Flujos secundarios (ajusta las rutas según tu proyecto)
import { flowPreguntasIniciales } from './flows/presupuesto/sistema/inicio.js';
import asistencia from './flows/presupuesto/asistencia.js';
import extintores from './flows/presupuesto/extintores.js';
import ergonomicos from './flows/presupuesto/ergonomicos.js';
import mediciones from './flows/presupuesto/mediciones.js';
import servicio from './flows/presupuesto/servicio.js';

// Importa la lógica de la base de datos
import { mongoAdapter } from './db/index.js';

// Configuración de la cola: ajusta gapMilliseconds según el tiempo que desees esperar para concatenar mensajes
const queueConfig = { gapMilliseconds: 15000 }; // Ejemplo: 15 segundos
const enqueueMessage = createMessageQueue(queueConfig);

// Función para manejar la ausencia de cliente en la DB
const handleDbError = async (ctx, state) => {
  console.warn("Cliente no encontrado, se creará uno nuevo para:", ctx.from);
  const newClientData = {
    nombre: ctx.pushName || 'UsuarioDesconocido',
    numero: ctx.from,
    historial: [],
    ultimaInteraccion: new Date()
  };
  const savedClient = await mongoAdapter.agregarOActualizarCliente(newClientData);
  await state.update({ dbClient: savedClient });
  return savedClient;
};

export const mainFlow = addKeyword(EVENTS.WELCOME)
  .addAction(async (ctx, ctxFn) => {
    // Buscar o crear cliente en la DB
    let dbClient = await mongoAdapter.buscarClientePorNumero(ctx.from);
    if (!dbClient) {
      dbClient = await handleDbError(ctx, ctxFn.state);
    }
    await ctxFn.state.update({ dbClient });
  })
  .addAction(async (ctx, ctxFn) => {
    try {
      // Utiliza la cola para agrupar mensajes del usuario en un lapso definido
      enqueueMessage(ctx, async (body) => {
        try {
          // Recupera el cliente de la DB
          let dbClient = await ctxFn.state.get('dbClient');

          // Si es la primera interacción del día, muestra un saludo
          const isFirstMessage =
            !dbClient.historial.length ||
            !isSameDay(dbClient.ultimaInteraccion, new Date());

          if (isFirstMessage) {
            const saludo = ctx.from.sexo === "F" ? "Bienvenida" : "Bienvenido";
            await ctxFn.flowDynamic([
              { body: `¡Hola, ${ctx.pushName}! ${saludo} al asistente virtual de la Consultora Integral Excon` }
            ]);
          }

          // Actualiza la última interacción del cliente
          dbClient.ultimaInteraccion = new Date();
          await mongoAdapter.agregarOActualizarCliente(dbClient);

          // Construye el historial completo para runDetermine
          // Se supone que dbClient.historial es un array con objetos { pregunta, respuesta, fecha }
          const completeHistory = [];
          for (const item of dbClient.historial) {
            completeHistory.push({ role: "user", content: item.pregunta });
            completeHistory.push({ role: "assistant", content: item.respuesta });
          }
          // Agrega el bloque concatenado de mensajes del usuario
          completeHistory.push({ role: "user", content: body });

          // Clasifica la intención usando todo el historial
          const service = await runDetermine(completeHistory);
          console.log("Respuesta de runDetermine:", service);

          // Mapeo de flujos según la intención
          const flowMap = {
            SISTEMA: flowPreguntasIniciales,
            EXTINTORES: extintores,
            SERVICIO: servicio,
            ERGONOMICOS: ergonomicos,
            MEDICIONES: mediciones,
            ASISTENCIA: asistencia,
          };

          // Si la intención coincide con un flujo específico, redirige
          if (flowMap[service]) {
            return ctxFn.gotoFlow(flowMap[service]);
          }

          // Si la intención es CONSULTA, se usa un thread nuevo para obtener una respuesta aislada
          if (service === "CONSULTA") {
            await ctxFn.flowDynamic([
              { body: "Por favor espera, estamos consultando la información..." }
            ]);

            // Aseguramos que el thread sea nuevo forzando su valor a null
            await ctxFn.state.update({ thread: null });

            // Agregamos log para verificar el texto que se le pasa a chat
            console.log("Texto que se le pasa a chat:", body);

            // Llamamos a chat únicamente con el bloque concatenado y forzando thread = null
            const responseData = await chat(body, null);

            // Log para confirmar el thread creado
            console.log("Thread creado en chat:", responseData.thread);

            // Guarda en el historial la pregunta y la respuesta obtenida
            const newEntry = {
              pregunta: body,
              respuesta: responseData.response,
              fecha: new Date()
            };
            await mongoAdapter.agregarHistorial(ctx.from, newEntry);

            // Envía la respuesta final al usuario y termina el flujo
            return ctxFn.endFlow(responseData.response);
          }

          // Si la intención no se reconoce, solicita reformular la consulta
          return ctxFn.endFlow("No se reconoció la intención. ¿Podrías reformular tu pregunta?");
        } catch (error) {
          console.error("Error en la lógica del mensaje:", error);
          return ctxFn.endFlow("Ocurrió un error inesperado. Inténtalo de nuevo más tarde.");
        }
      });
    } catch (error) {
      console.error('Error en el flujo principal:', error);
    }
  });
