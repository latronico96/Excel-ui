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
                    throw new Error("VALIDATION: El porcentaje de inversión debe estar entre 0 y 100");
                }

                if (!Array.isArray(movement.payments)) {
                    throw new Error("VALIDATION: Los medios de pago son inválidos");
                }

                const paymentMethodIds = movement.payments.map(
                    (payment) => payment.paymentMethodId
                );

                if (
                    new Set(paymentMethodIds).size !==
                    paymentMethodIds.length
                ) {
                    throw new Error("VALIDATION: No se puede repetir un medio de pago en el mismo ingreso");
                }

                const validPayments = movement.payments.filter(
                    (payment) => payment.amount > 0
                );

                if (validPayments.length === 0) {
                    throw new Error("VALIDATION: El ingreso debe tener al menos un monto mayor a 0");
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
                        throw new Error("VALIDATION: Los montos de los medios de pago deben ser mayores a 0");
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
                        throw new Error("VALIDATION: Medio de pago inválido");
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
                        throw new Error("VALIDATION: Porcentaje de comisión inválido");
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
                            (payment.amount - commissionAmount) * 100
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
                throw new Error("VALIDATION: El egreso debe tener un monto mayor a 0");
            }

            if (!movement.paymentMethodId) {
                throw new Error("VALIDATION: Debe seleccionar un medio de pago");
            }

            if (!movement.expenseTypeId) {
                throw new Error("VALIDATION: Debe seleccionar un tipo de gasto");
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
                throw new Error("VALIDATION: Medio de pago inválido");
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
                throw new Error("VALIDATION: Tipo de gasto inválido");
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

    static async fetchSummary(userId: string) {
        const movements = await prisma.movement.findMany({
            where: {
                userId,
            },
            select: {
                type: true,
                amount: true,
                date: true,
            },
            orderBy: {
                date: "desc",
            },
        });

        const summaries: Record<
            string,
            {
                income: number;
                expenses: number;
            }
        > = {};

        for (const movement of movements) {
            const date = movement.date.toISOString().slice(0, 10);

            if (!summaries[date]) {
                summaries[date] = {
                    income: 0,
                    expenses: 0,
                };
            }

            if (movement.type === "INGRESO") {
                summaries[date].income += Number(movement.amount);
            } else {
                summaries[date].expenses += Number(movement.amount);
            }
        }

        return Object.entries(summaries)
            .map(([date, data]) => ({
                date,
                totalIncome: data.income,
                totalExpenses: data.expenses,
                netDaily: data.income - data.expenses,
            }))
            .sort(
                (a, b) =>
                    new Date(b.date).getTime() -
                    new Date(a.date).getTime()
            );
    }
}
