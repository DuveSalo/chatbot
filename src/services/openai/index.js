import OpenAI from "openai";
import { config } from "../../config/index.js";
import { generatePromptDetermine } from "./promptDetermine.js";

const openai = new OpenAI({ apiKey: config.openai_apikey });
const assistant = config.assistant;
const grupo = config.grupo;

const chat = async (question, thread = null) => {
  try {
      thread = thread || await openai.beta.threads.create();

      // Crear el mensaje del usuario en el hilo
      await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: question
      });

      // Crear y ejecutar la corrida del asistente
      const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
          assistant_id: assistant,
      });

      // Si la corrida se completa, obtén la lista de mensajes y la última respuesta del asistente
      if (run.status === 'completed') {
          const messages = await openai.beta.threads.messages.list(run.thread_id);
          for (const message of messages.data.reverse()) {
              console.log(`Mensaje GS: ${message.role} > ${message.content[0].text.value}`);
          }
          const assistantResponse = messages.data
              .filter(message => message.role === 'assistant')
              .pop(); // Obtiene el último mensaje del asistente

          // Devuelve el thread y la última respuesta del asistente (si existe)
          const answer = assistantResponse ? assistantResponse.content[0].text.value : null
          const cleanAnswer = answer.replace(/【\d+:\d+†.*?】/g, '');
          return {
              thread,
              response: cleanAnswer
          };
      }

      // Si el run no se completó, devolver solo el thread
      return { thread, response: null };

  } catch (err) {
      console.error("Error al conectar con OpenAI:", err);
      return { thread, response: "ERROR" };
  }
};

const runDetermine = async (history) => {
  try {
    console.log('[HISTORIAL]', history);
    const prompt = generatePromptDetermine()
    const response = await openai.chat.completions.create({
        model: config.model,
        messages: [
            {
                "role": "system",
                "content": prompt
            },
            ...history
        ],
        temperature: 0,
        max_tokens: 5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    let aiResponse = response.choices[0].message.content.trim().split(" ")[0];

    // 1. Add validation for the AI response to ensure it's a known intent.
    const VALID_INTENTS = ['CONSULTA', 'SISTEMA', 'EXTINTORES', 'SERVICIO', 'ERGONOMICOS', 'MEDICIONES', 'ASISTENCIA'];
    if (!VALID_INTENTS.includes(aiResponse)) {
      console.warn(`Respuesta inesperada de la IA: "${aiResponse}". Se usará "CONSULTA" por defecto.`);
      aiResponse = 'CONSULTA';
    }

    console.log(`Respuesta de AI para determinar flujo: ${aiResponse}`);
    return aiResponse;
  } catch (error) {
    console.error('Error in runDetermine:', error);
    throw error;
  }
};

const DetermineGrupo = async (actividad, superficie, subsuelos, pisos) => {
  const datos = `
      Actividad: ${actividad}
      Superficie: ${superficie}
      Subsuelos: ${subsuelos}
      Pisos: ${pisos}
    `;
  
  try {
    // 1. Crear un nuevo hilo (thread)
    const thread = await openai.beta.threads.create();
  
    // 2. Agregar el mensaje del usuario al hilo
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: datos,
    });
  
    // 3. Realizar polling con nuestra función optimizada
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, grupo);
  
    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(run.thread_id);
  
      // 4. Buscar la última respuesta del assistant
      const assistantResponse = messages.data
        .filter((message) => message.role === "assistant")
        .pop();
  
      if (assistantResponse && assistantResponse.content[0]) {
        const respuestaTexto = assistantResponse.content[0].text.value.trim();
        return respuestaTexto;
      } else {
        return "No se encontró respuesta del asistente.";
      }
    } else {
      return "El run no se completó correctamente.";
    }
  } catch (error) {
    console.error("Error en DetermineGrupo:", error);
    return "Error al determinar grupo.";
  }
};

export { chat, runDetermine, DetermineGrupo };
