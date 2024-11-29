import { google } from 'googleapis'
import { config } from '../../config/index.js'

const auth = new google.auth.GoogleAuth({
  keyFile: './google.json',  // La ruta al archivo google.json es correcta, ya que está en la misma carpeta
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const spreadsheetId = config.sheets_api;

async function appendToSheet(sheetName, values) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    
    const range = `${sheetName}`;  // Se refiere a la hoja completa.
    const valueInputOption = 'USER_ENTERED';

    const resource = { values: [values] };

    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      insertDataOption: 'INSERT_ROWS', // Asegura que se inserte en una nueva fila.
      requestBody: resource,
    });

    return appendResponse;
  } catch (error) {
    console.error('Error al guardar en Google Sheets:', error);
  }
}

async function readSheet(sheetName) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const range = `${sheetName}!A2:Z`; // Leer todos los datos a partir de la fila 2

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error al leer desde Google Sheets:', error);
  }
}

export { appendToSheet, readSheet };