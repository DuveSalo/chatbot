import { addKeyword, EVENTS } from '@builderbot/bot';
import { mongoAdapter } from '../db/index.js';
import { chatHistory, runDetermine } from '../services/openai/index.js';
import { generatePrompt } from '../services/openai/prompt.js';
import { createMessageQueue } from '../utils/fast-entires.js';
import { flowPreguntasIniciales } from '../flow/presupuesto/sistema/inicio.js';
import asistencia from "../flow/presupuesto/asistencia.js";
import extintores from "../flow/presupuesto/extintores.js";
import ergonomicos from "../flow/presupuesto/ergonomicos.js";
import mediciones from "../flow/presupuesto/mediciones.js";
import servicio from "../flow/presupuesto/servicio.js";
import { isSameDay } from 'date-fns';

const queueConfig = { gapMilliseconds: 5000 };
const enqueueMessage = createMessageQueue(queueConfig);

const handleDbError = (ctx) => {
    console.error("Error: Cliente no encontrado en la base de datos para:", ctx.from);
    // Considerar enviar un mensaje al usuario informando del error.
    return null; // Importante retornar null para que el flujo se detenga.
};

export const mainFlow = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { state }) => {
        const dbClient = await mongoAdapter.buscarClientePorNumero(ctx.from);
        if (!dbClient) return handleDbError(ctx);

        const limitedHistory = dbClient.historial?.slice(-2).reduce((acc, item) => {
            acc.push({ role: "user", content: item.pregunta });
            acc.push({ role: "assistant", content: item.respuesta });
            return acc;
        }, []) || [];

        await state.update({ dbClient, limitedHistory }); // Guardar dbClient en el estado
    })
    .addAction(async (ctx, { state, gotoFlow, flowDynamic }) => {
        try {
            enqueueMessage(ctx, async (body) => {
                const dbClient = await state.get('dbClient');
                if (!dbClient) return handleDbError(ctx);

                const history = dbClient.historial || [];
                const isFirstMessage = !history.length || !isSameDay(new Date(history[history.length - 1].fecha), new Date());

                if (isFirstMessage) {
                    const saludo = ctx.from.sexo === 'F' ? 'Bienvenida' : 'Bienvenido';
                    await flowDynamic([{ body: `¡Hola, ${ctx.pushName}! ${saludo} al asistente virtual de la Consultora Integral Excon 😃` }]);
                }

                const combinedMessage = { role: "user", content: body };
                const limitedHistory = await state.get('limitedHistory');
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

                if (flowMap[service]) {
                    return gotoFlow(flowMap[service]);
                } else if (service === 'CONSULTA') {
                    const response = await chatHistory(generatePrompt(ctx.pushName || 'Usuario'), messagesForDetermination);
                    const cleanedResponse = response.trim();
                    const chunks = cleanedResponse.split(/(?<!\d)\.\s+/g); // Revisar si es necesaria esta división

                    for (const chunk of chunks) {
                        if (chunk.trim()) {
                            await flowDynamic([{ body: chunk.trim() + '.' }]);
                        }
                    }

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
            // Manejo de errores más robusto aquí
        }
    });