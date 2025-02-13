import { addKeyword, EVENTS } from '@builderbot/bot';
import { mongoAdapter } from '../db/index.js';
import { chatHistory, runDetermine } from '../services/openai/index.js';
import { generatePrompt } from '../services/openai/prompt.js';
import { createMessageQueue } from '../utils/fast-entires.js';
import { flowPreguntasIniciales } from './presupuesto/sistema/inicio.js';
import asistencia from "./presupuesto/asistencia.js";
import extintores from "./presupuesto/extintores.js";
import ergonomicos from "./presupuesto/ergonomicos.js";
import mediciones from "./presupuesto/mediciones.js";
import servicio from "./presupuesto/servicio.js";
import { isSameDay } from 'date-fns';

const queueConfig = { gapMilliseconds: 5000 };
const enqueueMessage = createMessageQueue(queueConfig);

/**
 * Si el cliente no existe en la base de datos,
 * lo creamos en lugar de cortar el flujo.
 */
const handleDbError = async (ctx, state) => {
  console.warn("Cliente no encontrado, se creará uno nuevo para:", ctx.from);

  // Creamos un nuevo cliente “mínimo”.
  const newClientData = {
    nombre: ctx.pushName || 'UsuarioDesconocido',
    numero: ctx.from,
    historial: [],
    ultimaInteraccion: new Date()
  };

  // Guardamos al nuevo cliente en la base de datos
  const savedClient = await mongoAdapter.agregarOActualizarCliente(newClientData);

  // Lo guardamos en el estado para que el flujo continúe
  await state.update({
    dbClient: savedClient,
    limitedHistory: []
  });

  return savedClient;
};

export const mainFlow = addKeyword(EVENTS.WELCOME)
  .addAction(async (ctx, { state }) => {
    // Buscamos al cliente
    let dbClient = await mongoAdapter.buscarClientePorNumero(ctx.from);

    // Si no existe, lo creamos en la DB en lugar de cortar la comunicación
    if (!dbClient) {
      dbClient = await handleDbError(ctx, state);
    }

    // Tomamos los últimos 2 intercambios para usar como "historial limitado"
    const limitedHistory = dbClient.historial?.slice(-2).reduce((acc, item) => {
      acc.push({ role: "user", content: item.pregunta });
      acc.push({ role: "assistant", content: item.respuesta });
      return acc;
    }, []) || [];

    // Guardamos en el estado
    await state.update({ dbClient, limitedHistory });
  })
  .addAction(async (ctx, { state, gotoFlow, flowDynamic }) => {
    try {
      enqueueMessage(ctx, async (body) => {
        // Obtenemos el cliente
        let dbClient = await state.get('dbClient');
        if (!dbClient) {
          // Si no hay cliente en el estado, lo creamos
          dbClient = await handleDbError(ctx, state);
        }

        const history = dbClient.historial || [];
        const isFirstMessage = !history.length ||
          !isSameDay(new Date(history[history.length - 1].fecha), new Date());

        // Respondemos un saludo inicial sólo si es el primer mensaje del día
        if (isFirstMessage) {
          const saludo = ctx.from.sexo === 'F' ? 'Bienvenida' : 'Bienvenido';
          await flowDynamic([{ body: `¡Hola, ${ctx.pushName}! ${saludo} al asistente virtual de la Consultora Integral Excon 😃` }]);
        }

        // Construimos el mensaje para determinar el flujo (runDetermine)
        const combinedMessage = { role: "user", content: body };
        const limitedHistory = await state.get('limitedHistory');
        const messagesForDetermination = [...limitedHistory, combinedMessage];

        // Determinamos la intención
        const serviceResponse = await runDetermine(messagesForDetermination);
        const service = serviceResponse?.trim().toUpperCase();

        // Redireccionamos al flujo si matchea alguna categoría
        const flowMap = {
          'SISTEMA': flowPreguntasIniciales,
          'EXTINTORES': extintores,
          'SERVICIO': servicio,
          'ERGONOMICOS': ergonomicos,
          'MEDICIONES': mediciones,
          'ASISTENCIA': asistencia,
        };

        if (service === 'SALUDO') {
            // Respuesta de bienvenida para un saludo
            await flowDynamic([{ body: `¡Hola ${ctx.pushName}! Bienvenido a Consultora Integral Excon. ¿En qué puedo ayudarte hoy?` }]);
            return;
        } else if (flowMap[service]) {
            return gotoFlow(flowMap[service]);
        } else if (service === 'CONSULTA') {
            // Procesa la consulta general usando la BASE_DE_DATOS
            const response = await chatHistory(generatePrompt(ctx.pushName || 'Usuario'), messagesForDetermination);
            const cleanedResponse = response.trim();
            const chunks = cleanedResponse.split(/(?<!\d)\.\s+/g);
            
            for (const chunk of chunks) {
                if (chunk.trim()) {
                    await flowDynamic([{ body: chunk.trim() + '.' }]);
                }
            }

          // Guardamos en la base de datos
          const newEntry = {
            pregunta: body,
            respuesta: cleanedResponse,
            fecha: new Date(),
          };
          await mongoAdapter.agregarHistorial(ctx.from, newEntry);
        }
      });
    } catch (error) {
      console.error('Error en el flujo principal:', error);
      // Manejo de errores adicional...
    }
  });
