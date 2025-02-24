import 'dotenv/config';

export const config = {
  // Variables de entorno
  PORT: process.env.PORT || 3008,
  provider: process.env.provider,
  // Meta
  jwtToken: process.env.jwtToken,
  numberId: process.env.numberId,
  verifyToken: process.env.verifyToken,
  version: "v20.0",
  // OpenAI
  openai_apikey: process.env.openai_apikey,
  model: process.env.model,
  assistant: process.env.ASSISTANT_ID,
  grupo: process.env.grupoSA_ID,
  // MongoDB
  mongoDb_uri: process.env.mongoDb_uri,
  mongoDb_name: process.env.mongoDb_name,
  // Sheets
  sheets_api: process.env.SPREADSHEETID,
  // Mail
  mail: process.env.mail,
  pass: process.env.password, 
};