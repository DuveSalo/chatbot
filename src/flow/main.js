import { addKeyword, EVENTS } from '@builderbot/bot';
import { mongoAdapter } from '../db/index.js';
import { chat, runDetermine } from '../services/openai/index.js';
import { createMessageQueue } from '../utils/fast-entires.js';
import { flowPreguntasIniciales } from './presupuesto/sistema/inicio.js';
import asistencia from "./presupuesto/asistencia.js";
import extintores from "./presupuesto/extintores.js";
import ergonomicos from "./presupuesto/ergonomicos.js";
import mediciones from "./presupuesto/mediciones.js";
import servicio from "./presupuesto/servicio.js";
import { isSameDay } from 'date-fns';

const queueConfig = { gapMilliseconds: 7000 };
const enqueueMessage = createMessageQueue(queueConfig);

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
    const numero = ctx.from;
    // --- Verificar bloqueo ---
    if (await mongoAdapter.isUserBlocked(numero)) {
      await ctxFn.endFlow(
        "Pronto se pondrán en contacto contigo para brindarte más información acerca de tu solicitud de presupuesto."
      );
      return;
    }})
    .addAction(async (ctx, ctxFn) => {
        let dbClient = await mongoAdapter.buscarClientePorNumero(ctx.from);

        if (!dbClient) {
            dbClient = await handleDbError(ctx, ctxFn.state);
        }

        await ctxFn.state.update({ dbClient });
    })
    .addAction(async (ctx, ctxFn) => {
        try {
            enqueueMessage(ctx, async (body) => {
                try {
                    const state = await ctxFn.state.getMyState();
                    const dbClient = state.dbClient;

                    const isFirstMessage = !dbClient.historial.length || !isSameDay(dbClient.ultimaInteraccion, new Date());

                    if (isFirstMessage) {
                        await ctxFn.flowDynamic([{ body: `¡Hola, ${ctx.pushName}! Bienvenido/a al asistente virtual de la Consultora Integral Excon.` }]);
                    }

                    const combinedMessage = { role: "user", content: body };
                    const limitedHistory = dbClient.historial?.slice(-2).reduce((acc, item) => {
                        acc.push({ role: "user", content: item.pregunta });
                        acc.push({ role: "assistant", content: item.respuesta });
                        return acc;
                    }, []) || [];
                    const messagesForDetermination = [...limitedHistory, combinedMessage];

                    const serviceResponse = await runDetermine(messagesForDetermination);
                    const service = serviceResponse?.trim().toUpperCase();

                    const flowMap = {
                        'SISTEMA': flowPreguntasIniciales,
                        'EXTINTORES': extintores,
                        'SERVICIO': servicio,
                        'ERGONOMICOS': ergonomicos,
                        'MEDICIONES': mediciones,
                        'ASISTENCIA': asistencia,
                    };

                    // 1. Streamlined routing logic
                    const targetFlow = flowMap[service];

                    if (targetFlow) {
                        return ctxFn.gotoFlow(flowMap[service]);
                    }

                    // Default to 'CONSULTA' behavior if no specific flow is matched
                    const thread = state?.thread ?? null;
                    
                    await ctxFn.flowDynamic([{ body: "Por favor espera, estamos consultando la información..." }]);
                                                                    
                    const response = await chat(ctx.body, thread);
                    await ctxFn.state.update({ thread: response.thread });

                    const newEntry = {
                        pregunta: body,
                        respuesta: response.response,
                        fecha: new Date(),
                    };
                    await mongoAdapter.agregarHistorial(ctx.from, newEntry);
                    return ctxFn.endFlow(response.response);
                        
                } catch (error) {
                    console.error("Error en la lógica del mensaje:", error);
                    await ctxFn.endFlow("Ocurrió un error inesperado. Inténtalo de nuevo más tarde.");
                }
            });
        } catch (error) {
            console.error('Error en el flujo principal:', error);
        }
    });
