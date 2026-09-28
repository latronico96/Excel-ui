export type MovementType = "INGRESO" | "EGRESO";

export interface PaymentMethodOption {
    id: string;
    name: string;
    defaultCommissionPercentage: number;
}

export interface ExpenseTypeOption {
    id: string;
    name: string;
}

export interface IncomePayment {
    paymentMethodId: string;
    paymentMethodName: string;
    amount: number;
    commissionPercentage: number;
    commissionAmount: number;
    netAmount: number;
}

export interface Movement {
    id: string;
    type: MovementType;
    date: string;
    amount: number;
    description: string | null;

    investmentPercentage?: number;

    expenseType?: {
        id: string;
        name: string;
    };

    paymentMethod?: {
        id: string;
        name: string;
    };

    payments?: IncomePayment[];
}

export interface DailySummary {
    date: string;
    totalIncome: number;
    totalExpenses: number;
    netDaily: number;
}

export type MovementInput =
    | {
        type: "INGRESO";
        date: string;
        investmentPercentage: number;
        payments: {
            paymentMethodId: string;
            amount: number;
            commissionPercentage?: number;
        }[];
        description?: string | null;
    }
    | {
        type: "EGRESO";
        date: string;
        amount: number;
        expenseTypeId: string;
        paymentMethodId: string;
        description?: string | null;
    };