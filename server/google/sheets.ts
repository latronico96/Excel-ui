import { google } from 'googleapis';
import { getGoogleAuth } from './auth';
import { Movement } from '@/shared/types';

export async function appendMovement(spreadsheetId: string, movement: Movement) {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const values = [
        [
            movement.date,
            movement.type,
            movement.paymentMethod,
            movement.grossAmount,
            movement.commissionPercentage,
            movement.commissionAmount,
            movement.netAmount,
            movement.category,
            movement.observations,
        ],
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Movimientos!A2',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values,
        },
    });
}

export async function getMovements(spreadsheetId: string) {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Movimientos!A2:I',
    });

    const rows = response.data.values || [];
    return rows.map((row) => ({
        date: row[0],
        type: row[1],
        paymentMethod: row[2],
        grossAmount: parseFloat(row[3]),
        commissionPercentage: parseFloat(row[4]),
        commissionAmount: parseFloat(row[5]),
        netAmount: parseFloat(row[6]),
        category: row[7],
        observations: row[8],
    }));
}

export async function updateDailySummary(spreadsheetId: string, movements: Movement[]) {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Agrupar movimientos por fecha para el resumen
    const summaries: Record<string, { income: number; expenses: number }> = {};

    movements.forEach((m) => {
        if (!summaries[m.date]) {
            summaries[m.date] = { income: 0, expenses: 0 };
        }
        if (m.type === 'INGRESO') {
            summaries[m.date].income += m.netAmount;
        } else {
            summaries[m.date].expenses += m.netAmount;
        }
    });

    const values = Object.entries(summaries).map(([date, data]) => [
        date,
        data.income,
        data.expenses,
        data.income - data.expenses,
    ]);

    // Limpiar y actualizar la hoja de Resumen
    await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: 'Resumen Diario!A2:D',
    });

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Resumen Diario!A2',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values,
        },
    });
}
