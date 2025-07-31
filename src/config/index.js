import 'dotenv/config';

export const config = {
  // Variables de entorno
  PORT: process.env.PORT || 8080,
  provider: process.env.provider,
  // OpenAI
  openai_apikey: process.env.openai_apikey,
  model: process.env.model,
  assistant: process.env.ASSISTANT_ID,
  grupo: process.env.GRUPO_ID,
  intencion: process.env.INTENCION_ID,
  // MongoDB
  mongoDb_uri: process.env.mongoDb_uri,
  mongoDb_name: process.env.mongoDb_name,
  // Mail
  mail: process.env.mail,
  pass: process.env.password, 
};