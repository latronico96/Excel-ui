import { prisma } from "@/prisma/prisma";
import { Prisma } from "@prisma/client";
import { MovementInput } from "@/shared/types";

export class MovimientosService {
    static async saveMovement(userId: string, movement: MovementInput) {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            if (movement.type === "INGRESO") {
                const date = new Date(movement.date);

                if (Number.isNaN(date.getTime())) {
                    throw new Error("VALIDATION: Fecha inválida");
                }

                const investmentPercentage =
                    movement.investmentPercentage ?? 50;

                if (
                    !Number.isFinite(investmentPercentage) ||
                    investmentPercentage < 0 ||
                    investmentPercentage > 100
                ) {
                    throw new Error(
                        "VALIDATION: El porcentaje de inversión debe estar entre 0 y 100"
                    );
                }

                if (!Array.isArray(movement.payments)) {
                    throw new Error(
                        "VALIDATION: Los medios de pago son inválidos"
                    );
                }

                const paymentMethodIds = movement.payments.map(
                    (payment) => payment.paymentMethodId
                );

                if (
                    new Set(paymentMethodIds).size !==
                    paymentMethodIds.length
                ) {
                    throw new Error(
                        "VALIDATION: No se puede repetir un medio de pago en el mismo ingreso"
                    );
                }

                const validPayments = movement.payments.filter(
                    (payment) => payment.amount > 0
                );

                if (validPayments.length === 0) {
                    throw new Error(
                        "VALIDATION: El ingreso debe tener al menos un monto mayor a 0"
                    );
                }

                const total = validPayments.reduce(
                    (sum, payment) => sum + payment.amount,
                    0
                );

                const incomePayments = [];

                for (const payment of validPayments) {
                    if (
                        !Number.isFinite(payment.amount) ||
                        payment.amount <= 0
                    ) {
                        throw new Error(
                            "VALIDATION: Los montos de los medios de pago deben ser mayores a 0"
                        );
                    }

                    const paymentMethod =
                        await tx.paymentMethod.findFirst({
                            where: {
                                id: payment.paymentMethodId,
                                userId,
                                active: true,
                            },
                        });

                    if (!paymentMethod) {
                        throw new Error(
                            "VALIDATION: Medio de pago inválido"
                        );
                    }

                    const commissionPercentage =
                        payment.commissionPercentage ??
                        Number(
                            paymentMethod.defaultCommissionPercentage
                        );

                    if (
                        !Number.isFinite(commissionPercentage) ||
                        commissionPercentage < 0 ||
                        commissionPercentage > 100
                    ) {
                        throw new Error(
                            "VALIDATION: Porcentaje de comisión inválido"
                        );
                    }

                    const commissionAmount =
                        Math.round(
                            (payment.amount *
                                commissionPercentage /
                                100) *
                            100
                        ) / 100;

                    const netAmount =
                        Math.round(
                            (payment.amount - commissionAmount) *
                            100
                        ) / 100;

                    incomePayments.push({
                        paymentMethodId: payment.paymentMethodId,
                        amount: payment.amount,
                        commissionPercentage,
                        commissionAmount,
                        netAmount,
                    });
                }

                const movementRecord = await tx.movement.create({
                    data: {
                        userId,
                        type: "INGRESO",
                        amount: total,
                        date,
                        description: movement.description || null,
                    },
                });

                await tx.income.create({
                    data: {
                        movementId: movementRecord.id,
                        investmentPercentage,
                        payments: {
                            create: incomePayments,
                        },
                    },
                });

                return movementRecord;
            }

            // EGRESO

            const date = new Date(movement.date);

            if (Number.isNaN(date.getTime())) {
                throw new Error("VALIDATION: Fecha inválida");
            }

            if (
                !Number.isFinite(movement.amount) ||
                movement.amount <= 0
            ) {
                throw new Error(
                    "VALIDATION: El egreso debe tener un monto mayor a 0"
                );
            }

            if (!movement.paymentMethodId) {
                throw new Error(
                    "VALIDATION: Debe seleccionar un medio de pago"
                );
            }

            if (!movement.expenseTypeId) {
                throw new Error(
                    "VALIDATION: Debe seleccionar un tipo de gasto"
                );
            }

            const paymentMethod =
                await tx.paymentMethod.findFirst({
                    where: {
                        id: movement.paymentMethodId,
                        userId,
                        active: true,
                    },
                });

            if (!paymentMethod) {
                throw new Error(
                    "VALIDATION: Medio de pago inválido"
                );
            }

            const expenseType =
                await tx.expenseType.findFirst({
                    where: {
                        id: movement.expenseTypeId,
                        userId,
                        active: true,
                    },
                });

            if (!expenseType) {
                throw new Error(
                    "VALIDATION: Tipo de gasto inválido"
                );
            }

            const movementRecord = await tx.movement.create({
                data: {
                    userId,
                    type: "EGRESO",
                    amount: movement.amount,
                    date,
                    description: movement.description || null,
                },
            });

            await tx.expense.create({
                data: {
                    movementId: movementRecord.id,
                    expenseTypeId: expenseType.id,
                    paymentMethodId: paymentMethod.id,
                },
            });

            return movementRecord;
        });
    }

    static async updateMovement(
        userId: string,
        movementId: string,
        movement: MovementInput
    ) {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Primero verificamos que el movimiento exista
            // y pertenezca al usuario actual.
            const existingMovement =
                await tx.movement.findFirst({
                    where: {
                        id: movementId,
                        userId,
                    },
                    include: {
                        income: true,
                        expense: true,
                    },
                });

            if (!existingMovement) {
                throw new Error(
                    "VALIDATION: Movimiento no encontrado"
                );
            }

            // No permitimos cambiar INGRESO <-> EGRESO
            // durante una edición.
            if (existingMovement.type !== movement.type) {
                throw new Error(
                    "VALIDATION: No se puede cambiar el tipo de movimiento"
                );
            }

            // =========================================================
            // INGRESO
            // =========================================================

            if (movement.type === "INGRESO") {
                const date = new Date(movement.date);

                if (Number.isNaN(date.getTime())) {
                    throw new Error("VALIDATION: Fecha inválida");
                }

                const investmentPercentage =
                    movement.investmentPercentage ?? 50;

                if (
                    !Number.isFinite(investmentPercentage) ||
                    investmentPercentage < 0 ||
                    investmentPercentage > 100
                ) {
                    throw new Error(
                        "VALIDATION: El porcentaje de inversión debe estar entre 0 y 100"
                    );
                }

                if (!Array.isArray(movement.payments)) {
                    throw new Error(
                        "VALIDATION: Los medios de pago son inválidos"
                    );
                }

                const paymentMethodIds = movement.payments.map(
                    (payment) => payment.paymentMethodId
                );

                if (
                    new Set(paymentMethodIds).size !==
                    paymentMethodIds.length
                ) {
                    throw new Error(
                        "VALIDATION: No se puede repetir un medio de pago en el mismo ingreso"
                    );
                }

                const validPayments = movement.payments.filter(
                    (payment) => payment.amount > 0
                );

                if (validPayments.length === 0) {
                    throw new Error(
                        "VALIDATION: El ingreso debe tener al menos un monto mayor a 0"
                    );
                }

                const total = validPayments.reduce(
                    (sum, payment) => sum + payment.amount,
                    0
                );

                const incomePayments = [];

                for (const payment of validPayments) {
                    if (
                        !Number.isFinite(payment.amount) ||
                        payment.amount <= 0
                    ) {
                        throw new Error(
                            "VALIDATION: Los montos de los medios de pago deben ser mayores a 0"
                        );
                    }

                    const paymentMethod =
                        await tx.paymentMethod.findFirst({
                            where: {
                                id: payment.paymentMethodId,
                                userId,
                                active: true,
                            },
                        });

                    if (!paymentMethod) {
                        throw new Error(
                            "VALIDATION: Medio de pago inválido"
                        );
                    }

                    const commissionPercentage =
                        payment.commissionPercentage ??
                        Number(
                            paymentMethod.defaultCommissionPercentage
                        );

                    if (
                        !Number.isFinite(commissionPercentage) ||
                        commissionPercentage < 0 ||
                        commissionPercentage > 100
                    ) {
                        throw new Error(
                            "VALIDATION: Porcentaje de comisión inválido"
                        );
                    }

                    const commissionAmount =
                        Math.round(
                            (payment.amount *
                                commissionPercentage /
                                100) *
                            100
                        ) / 100;

                    const netAmount =
                        Math.round(
                            (payment.amount - commissionAmount) *
                            100
                        ) / 100;

                    incomePayments.push({
                        paymentMethodId: payment.paymentMethodId,
                        amount: payment.amount,
                        commissionPercentage,
                        commissionAmount,
                        netAmount,
                    });
                }

                // Actualizamos el movimiento principal.
                await tx.movement.update({
                    where: {
                        id: movementId,
                    },
                    data: {
                        amount: total,
                        date,
                        description: movement.description || null,
                    },
                });

                // El Income ya debería existir porque el movimiento
                // es de tipo INGRESO.
                if (!existingMovement.income) {
                    throw new Error(
                        "VALIDATION: El ingreso asociado al movimiento no existe"
                    );
                }

                await tx.income.update({
                    where: {
                        movementId,
                    },
                    data: {
                        investmentPercentage,
                    },
                });

                // Para el MVP reemplazamos todos los payments.
                // Está dentro de la misma transacción, por lo que
                // si algo falla no queda el movimiento a medias.
                await tx.incomePayment.deleteMany({
                    where: {
                        incomeId: movementId,
                    },
                });

                await tx.incomePayment.createMany({
                    data: incomePayments.map((payment) => ({
                        incomeId: movementId,
                        paymentMethodId: payment.paymentMethodId,
                        amount: payment.amount,
                        commissionPercentage:
                            payment.commissionPercentage,
                        commissionAmount:
                            payment.commissionAmount,
                        netAmount: payment.netAmount,
                    })),
                });

                return tx.movement.findUnique({
                    where: {
                        id: movementId,
                    },
                });
            }

            // =========================================================
            // EGRESO
            // =========================================================

            const date = new Date(movement.date);

            if (Number.isNaN(date.getTime())) {
                throw new Error("VALIDATION: Fecha inválida");
            }

            if (
                !Number.isFinite(movement.amount) ||
                movement.amount <= 0
            ) {
                throw new Error(
                    "VALIDATION: El egreso debe tener un monto mayor a 0"
                );
            }

            if (!movement.paymentMethodId) {
                throw new Error(
                    "VALIDATION: Debe seleccionar un medio de pago"
                );
            }

            if (!movement.expenseTypeId) {
                throw new Error(
                    "VALIDATION: Debe seleccionar un tipo de gasto"
                );
            }

            const paymentMethod =
                await tx.paymentMethod.findFirst({
                    where: {
                        id: movement.paymentMethodId,
                        userId,
                        active: true,
                    },
                });

            if (!paymentMethod) {
                throw new Error(
                    "VALIDATION: Medio de pago inválido"
                );
            }

            const expenseType =
                await tx.expenseType.findFirst({
                    where: {
                        id: movement.expenseTypeId,
                        userId,
                        active: true,
                    },
                });

            if (!expenseType) {
                throw new Error(
                    "VALIDATION: Tipo de gasto inválido"
                );
            }

            await tx.movement.update({
                where: {
                    id: movementId,
                },
                data: {
                    amount: movement.amount,
                    date,
                    description: movement.description || null,
                },
            });

            if (!existingMovement.expense) {
                throw new Error(
                    "VALIDATION: El egreso asociado al movimiento no existe"
                );
            }

            await tx.expense.update({
                where: {
                    movementId,
                },
                data: {
                    paymentMethodId: paymentMethod.id,
                    expenseTypeId: expenseType.id,
                },
            });

            return tx.movement.findUnique({
                where: {
                    id: movementId,
                },
            });
        });
    }

    static async deleteMovement(
        userId: string,
        movementId: string
    ) {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const movement = await tx.movement.findFirst({
                where: {
                    id: movementId,
                    userId,
                },
                select: {
                    id: true,
                },
            });

            if (!movement) {
                throw new Error(
                    "VALIDATION: Movimiento no encontrado"
                );
            }

            return tx.movement.delete({
                where: {
                    id: movementId,
                },
            });
        });
    }

    static async fetchMovements(userId: string) {
        return prisma.movement.findMany({
            where: {
                userId,
            },
            include: {
                expense: {
                    include: {
                        expenseType: true,
                        paymentMethod: true,
                    },
                },
                income: {
                    include: {
                        payments: {
                            include: {
                                paymentMethod: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        });
    }

    static async fetchSummary(
        userId: string,
        period: "week" | "month" | "year" = "month"
    ) {
        const now = new Date();

        const startDate = new Date(now);

        if (period === "week") {
            // Lunes de la semana actual
            const day = startDate.getDay();
            const diff = day === 0 ? -6 : 1 - day;

            startDate.setDate(startDate.getDate() + diff);
            startDate.setHours(0, 0, 0, 0);
        } else if (period === "month") {
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        } else {
            startDate.setMonth(0, 1);
            startDate.setHours(0, 0, 0, 0);
        }

        const movements = await prisma.movement.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: now,
                },
            },
            select: {
                type: true,
                amount: true,
                date: true,
                income: {
                    select: {
                        investmentPercentage: true,
                        payments: {
                            select: {
                                commissionAmount: true,
                                netAmount: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        });

        const totals = {
            income: 0,
            expenses: 0,
            balance: 0,
            commissions: 0,
            netIncome: 0,
            investment: 0,
        };

        const breakdown: Record<
            string,
            {
                income: number;
                expenses: number;
                commissions: number;
                netIncome: number;
                investment: number;
            }
        > = {};

        for (const movement of movements) {
            const movementDate = movement.date;

            let key: string;

            if (period === "week" || period === "month") {
                key = movementDate.toISOString().slice(0, 10);
            } else {
                // Para el año agrupamos por mes
                key = movementDate.toISOString().slice(0, 7);
            }

            if (!breakdown[key]) {
                breakdown[key] = {
                    income: 0,
                    expenses: 0,
                    commissions: 0,
                    netIncome: 0,
                    investment: 0,
                };
            }

            if (movement.type === "INGRESO") {
                const grossIncome = Number(movement.amount);

                const commissions =
                    movement.income?.payments.reduce(
                        (sum: number, payment: { commissionAmount: any }) =>
                            sum + Number(payment.commissionAmount),
                        0
                    ) ?? 0;

                const netIncome =
                    movement.income?.payments.reduce(
                        (sum: number, payment: { netAmount: any }) =>
                            sum + Number(payment.netAmount),
                        0
                    ) ?? 0;

                const investmentPercentage = Number(
                    movement.income?.investmentPercentage ?? 0
                );

                const investment =
                    Math.round(
                        ((netIncome * investmentPercentage) / 100) * 100
                    ) / 100;

                totals.income += grossIncome;
                totals.commissions += commissions;
                totals.netIncome += netIncome;
                totals.investment += investment;

                breakdown[key].income += grossIncome;
                breakdown[key].commissions += commissions;
                breakdown[key].netIncome += netIncome;
                breakdown[key].investment += investment;
            } else {
                const expense = Number(movement.amount);

                totals.expenses += expense;

                breakdown[key].expenses += expense;
            }
        }

        totals.balance = totals.income - totals.expenses;

        const result = Object.entries(breakdown)
            .map(([date, data]) => ({
                date,
                totalIncome: data.income,
                totalExpenses: data.expenses,
                commissions: data.commissions,
                netIncome: data.netIncome,
                investment: data.investment,
                netDaily: data.income - data.expenses,
            }))
            .sort(
                (a, b) =>
                    new Date(b.date).getTime() -
                    new Date(a.date).getTime()
            );

        return {
            period,
            totals,
            breakdown: result,
        };
    }
}
