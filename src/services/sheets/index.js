import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import { config } from '../../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'google.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = config.sheets_api;

export async function appendToSheet(sheetName, values) {
  try {
    const range = `${sheetName}`;
    const valueInputOption = 'USER_ENTERED';
    const resource = { values: [values] };

    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      insertDataOption: 'INSERT_ROWS',
      requestBody: resource,
    });

    return appendResponse;
  } catch (error) {
    console.error('Error al guardar en Google Sheets:', error);
  }
}

export async function readSheet(sheetName) {
  try {
    const range = `${sheetName}!A2:Z`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return response.data.values || [];
  } catch (error) {
    console.error('Error al leer desde Google Sheets:', error);
  }
}
