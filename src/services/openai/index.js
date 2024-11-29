import OpenAI from "openai";
import { config } from "../../config/index.js";
import { generatePrompt, generatePromptDetermine } from "./prompt.js";

const openai = new OpenAI({
    apiKey: config.openai_apikey,
});

const run = async (history) => {
    const prompt = generatePrompt()
    const response = await openai.chat.completions.create({
        model: config.model,
        messages: [
            {
                "role": "system",
                "content": prompt
            },
            ...history
        ],
        temperature: 1,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.choices[0].message.content
}

const runDetermine = async (history) => {
  try {
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
        temperature: 1,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    const aiResponse = response.choices[0].message.content.trim();
    console.log(`Respuesta de AI para determinar flujo: ${aiResponse}`);
    return aiResponse;
  } catch (error) {
    console.error('Error in runDetermine:', error);
    throw error;
  }
};

const chatHistory = async (prompt, messages) => {
  try {
      const openai = new OpenAI({
          apiKey: config.openai_apikey,
      });

      const completion = await openai.chat.completions.create({
          model: config.model,
          messages: [
              { role: "system", content: prompt },
              ...messages,
          ],
      });

      return completion.choices[0].message.content;
  } catch (err) {
      console.error("Error al conectar con OpenAI:", err);
      return "ERROR";
  }
};
export { run, runDetermine, chatHistory }


