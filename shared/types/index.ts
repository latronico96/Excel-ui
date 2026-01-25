export type MovementType = 'INGRESO' | 'GASTO';
export type PaymentMethod = 'EFECTIVO' | 'DEBITO' | 'CREDITO' | 'TRANSFERENCIA';

export interface Movement {
  date: string;
  type: MovementType;
  paymentMethod: PaymentMethod;
  grossAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  netAmount: number;
  category: string;
  observations: string;
}

export interface DailySummary {
  date: string;
  totalIncome: number;
  totalExpenses: number;
  netDaily: number;
}
