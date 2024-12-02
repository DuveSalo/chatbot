import { addKeyword, EVENTS } from '@builderbot/bot';
import { mongoAdapter } from '../db/index.js';
import { chatHistory, runDetermine } from '../services/openai/index.js';
import { generatePrompt } from '../services/openai/prompt.js';
import { flowPreguntasIniciales } from '../flow/presupuesto/sistema/inicio.js';
import asistencia from "../flow/presupuesto/asistencia.js";
import extintores from "../flow/presupuesto/extintores.js";
import ergonomicos from "../flow/presupuesto/ergonomicos.js";
import mediciones from "../flow/presupuesto/mediciones.js";
import servicio from "../flow/presupuesto/servicio.js";

export const mainFlow = addKeyword(EVENTS.WELCOME)
.addAnswer('Bienvenido al asistente virtual de la *Consultora Integral Excon*')
.addAction(async (ctx, ctxFn) => {
    const dbClient = await mongoAdapter.buscarClientePorNumero(ctx.from);

    if (!dbClient) {
        console.log("Error: Cliente no encontrado en la base de datos.");
        return;
    }

    // Obtenemos el historial para ambos casos
    const history = dbClient.historial || [];
    const limitedHistory = history.slice(-2).flatMap(item => ([
        { role: "user", content: item.pregunta },
        { role: "assistant", content: item.respuesta }
    ]));

    const currentMessage = { 
        role: "user", 
        content: ctx.body
    };

    // Usamos el mismo historial para determinar el tipo de servicio
    const messagesForDetermination = [...limitedHistory, currentMessage];
    const serviceResponse = await runDetermine(messagesForDetermination);
    
    console.log('Service Response:', serviceResponse?.trim().toUpperCase());

    // Si se identifica un servicio específico, redirigimos al flujo correspondiente
    const service = serviceResponse?.trim().toUpperCase();
    
    if (service === 'SISTEMA') {
        await ctxFn.gotoFlow(flowPreguntasIniciales);
    } else if (service === 'EXTINTORES') {
        await ctxFn.gotoFlow(extintores);
        return;
    } else if (service === 'SERVICIO') {
        await ctxFn.gotoFlow(servicio);
        return;
    } else if (service === 'ERGONOMICOS') {
        await ctxFn.gotoFlow(ergonomicos);
        return;
    } else if (service === 'MEDICIONES') {
        await ctxFn.gotoFlow(mediciones);
        return;
    } else if (service === 'ASISTENCIA') {
        await ctxFn.gotoFlow(asistencia);
        return;
    } else {
        // Si no es una solicitud de presupuesto, continuamos con el flujo normal de chat
        const messagesForAI = [...limitedHistory, currentMessage];
        const prompt = generatePrompt(ctx.pushName || 'Usuario');
        const response = await chatHistory(prompt, messagesForAI);
        const cleanedResponse = response.trim();
        const chunks = cleanedResponse.split(/(?<!\d)\.\s+/g);
        
        for (const chunk of chunks) {
            if (chunk.trim()) {
                await ctxFn.flowDynamic([{ body: chunk.trim() + '.' }]);
            }
        }

        const newEntry = {
            pregunta: ctx.body,
            respuesta: cleanedResponse,
            fecha: new Date(),
        };
        await mongoAdapter.agregarHistorial(ctx.from, newEntry);
    }
});
