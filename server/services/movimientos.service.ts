import { findOrCreateSheet } from '../google/drive';
import { appendMovement, getMovements, updateDailySummary } from '../google/sheets';
import { Movement } from '@/shared/types';

export class MovimientosService {
    private static async getSheetId() {
        const id = await findOrCreateSheet();
        if (!id) throw new Error('Could not find or create sheet');
        return id;
    }

    static async saveMovement(movement: Movement) {
        const sheetId = await this.getSheetId();
        await appendMovement(sheetId, movement);

        // Opcional: Actualizar el resumen después de cada inserción 
        // o hacerlo de forma asíncrona o bajo demanda.
        // Por simplicidad en este MVP, actualizamos el resumen después de obtener todos los movimientos.
        const allMovements = await getMovements(sheetId);
        await updateDailySummary(sheetId, allMovements);
    }

    static async fetchMovements() {
        const sheetId = await this.getSheetId();
        return await getMovements(sheetId);
    }

    static async fetchSummary() {
        const sheetId = await this.getSheetId();
        const movements = await getMovements(sheetId);

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

        return Object.entries(summaries).map(([date, data]) => ({
            date,
            totalIncome: data.income,
            totalExpenses: data.expenses,
            netDaily: data.income - data.expenses,
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
}
