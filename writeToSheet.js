const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheetId = "11wQhwJKxnljDCpUMMz6ibTF-_rFmr4WK2aKZzTv9KpM";

async function writeToSheet(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Oquvchilar!A:E',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [data],
    },
  });
}

module.exports = writeToSheet;
