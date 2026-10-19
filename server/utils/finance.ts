
export function roundMoney(amount: number): number {
    return Math.round(amount * 100) / 100;
}

export function calculateCommission(
    amount: number,
    percentage: number
) {
    if (
        !Number.isFinite(amount) ||
        amount < 0 ||
        !Number.isFinite(percentage) ||
        percentage < 0 ||
        percentage > 100
    ) {
        throw new Error("Importe o porcentaje inválido");
    }

    const commissionAmount = roundMoney(
        (amount * percentage) / 100
    );

    const netAmount = roundMoney(
        amount - commissionAmount
    );

    return { commissionAmount, netAmount };
}

export function calculateInvestment(
    netIncome: number,
    percentage: number
): number {
    if (
        !Number.isFinite(netIncome) ||
        netIncome < 0 ||
        !Number.isFinite(percentage) ||
        percentage < 0 ||
        percentage > 100
    ) {
        throw new Error("Importe o porcentaje inválido");
    }

    return roundMoney(
        (netIncome * percentage) / 100
    );
}

export function calculateTithe(
    netIncome: number,
    investment: number,
    percentage: number,
    base: "NET_INCOME" | "AFTER_INVESTMENT",
    enabled: boolean
): number {
    if (!enabled) return 0;

    if (
        !Number.isFinite(netIncome) ||
        netIncome < 0 ||
        !Number.isFinite(investment) ||
        investment < 0 ||
        !Number.isFinite(percentage) ||
        percentage < 0 ||
        percentage > 100
    ) {
        throw new Error("Importe o porcentaje inválido");
    }

    const titheBase =
        base === "AFTER_INVESTMENT"
            ? Math.max(0, netIncome - investment)
            : netIncome;

    return roundMoney(
        (titheBase * percentage) / 100
    );
}

export function calculateAvailable(
    netIncome: number,
    investment: number,
    tithe: number
): number {
    return roundMoney(
        netIncome - investment - tithe
    );
}
