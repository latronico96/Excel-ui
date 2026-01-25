import { google } from 'googleapis';
import { getGoogleAuth } from './auth';
import { GOOGLE_SHEET_NAME } from '@/shared/constants';

export async function findOrCreateSheet() {
    const auth = await getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });

    // Buscar si ya existe el archivo
    const response = await drive.files.list({
        q: `name = '${GOOGLE_SHEET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
    }

    // Si no existe, crearlo
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
            properties: {
                title: GOOGLE_SHEET_NAME,
            },
            sheets: [
                {
                    properties: {
                        title: 'Movimientos',
                        gridProperties: {
                            frozenRowCount: 1,
                        },
                    },
                    data: [
                        {
                            startRow: 0,
                            startColumn: 0,
                            rowData: [
                                {
                                    values: [
                                        { userEnteredValue: { stringValue: 'Fecha' } },
                                        { userEnteredValue: { stringValue: 'Tipo' } },
                                        { userEnteredValue: { stringValue: 'Medio de pago' } },
                                        { userEnteredValue: { stringValue: 'Monto bruto' } },
                                        { userEnteredValue: { stringValue: 'Comisión %' } },
                                        { userEnteredValue: { stringValue: 'Comisión $' } },
                                        { userEnteredValue: { stringValue: 'Monto neto' } },
                                        { userEnteredValue: { stringValue: 'Categoría' } },
                                        { userEnteredValue: { stringValue: 'Observaciones' } },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    properties: {
                        title: 'Resumen Diario',
                        gridProperties: {
                            frozenRowCount: 1,
                        },
                    },
                    data: [
                        {
                            startRow: 0,
                            startColumn: 0,
                            rowData: [
                                {
                                    values: [
                                        { userEnteredValue: { stringValue: 'Fecha' } },
                                        { userEnteredValue: { stringValue: 'Total ingresos' } },
                                        { userEnteredValue: { stringValue: 'Total gastos' } },
                                        { userEnteredValue: { stringValue: 'Neto del día' } },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    });

    return spreadsheet.data.spreadsheetId;
}
