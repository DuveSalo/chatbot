import OpenAI from "openai";
import { config } from "../../config/index.js";
import { generatePromptDetermine } from "./prompt.js";

const openai = new OpenAI({ apiKey: config.openai_apikey });
const assistant = config.assistant;
const cache = new Map();
const grupo = config.grupo;

const chat = async (question, threadId = null) => {
    try {
        const cacheKey = `${question}-${threadId || 'newThread'}`;
        const cachedResponse = cache.get(cacheKey);

        if (cachedResponse) {
            console.log("Respuesta de OpenAI en caché");
            return cachedResponse;
        }

        let thread;
        if (threadId) {
            thread = await openai.beta.threads.retrieve(threadId);
        } else {
            thread = await openai.beta.threads.create();
            threadId = thread.id;
        }

        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: question,
        });

        const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
            assistant_id: assistant,
        });

        if (run.status === "completed") {
            const messages = await openai.beta.threads.messages.list(run.thread_id);

            messages.data.reverse().forEach((message) => {
                console.log(
                    `Mensaje GS: ${message.role} > ${message.content[0].text.value}`
                );
            });

            const assistantResponse = messages.data
                .filter((message) => message.role === "assistant")
                .pop();

            let cleanAnswer = null;
            if (assistantResponse) {
                const answer = assistantResponse.content[0].text.value;
                cleanAnswer = answer.replace(/【\d+:\d+†[^】]+】/g, "");
            }

            const response = { threadId, response: cleanAnswer };
            cache.set(cacheKey, response);
            return response;
        }

        return { threadId: null, response: null };
    } catch (err) {
        console.error("Error al conectar con OpenAI:", err);
        return { threadId: null, response: "ERROR" };
    }
};

const runDetermine = async (history) => {
    try {
        const prompt = generatePromptDetermine();
        const response = await openai.chat.completions.create({
            model: config.model || "gpt-3.5-turbo",
            messages: [
                { role: "system", content: prompt },
                ...history,
            ],
            temperature: 0,
            max_tokens: 100,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        const aiResponse = response.choices[0].message.content.trim();
        console.log(`Respuesta de AI para determinar flujo: ${aiResponse}`);
        return aiResponse;
    } catch (error) {
        console.error("Error en runDetermine:", error);
        throw error;
    }
};

const DetermineGrupo = async (actividad, superficie, subsuelos, pisos) => {
    const datos = `
      Actividad: ${actividad}
      Superficie: ${superficie} m²
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
  
      // 3. Crear y hacer poll del run utilizando el thread.id
      const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: grupo,
      });
  
      // 4. Si se completa correctamente, listar los mensajes
      if (run.status === "completed") {
        const messages = await openai.beta.threads.messages.list(run.thread_id);
  
        // 5. Buscar la última respuesta del assistant
        const assistantResponse = messages.data
          .filter((message) => message.role === "assistant")
          .pop();
  
        if (assistantResponse && assistantResponse.content[0]) {
          // El texto se encuentra en assistantResponse.content[0].text.value
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
