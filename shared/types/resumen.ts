export type SummaryPeriod = "week" | "month" | "year";

export interface SummaryBreakdown {
    date: string;
    totalIncome: number;
    totalExpenses: number;
    commissions: number;
    netIncome: number;
    investment: number;
    netDaily: number;
}

export interface SummaryTotals {
    income: number;
    expenses: number;
    balance: number;
    commissions: number;
    netIncome: number;
    investment: number;
}

export interface SummaryResponse {
    period: SummaryPeriod;
    totals: SummaryTotals;
    breakdown: SummaryBreakdown[];
}