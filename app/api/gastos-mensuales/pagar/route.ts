import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/auth-options";
import { prisma } from "@/prisma/prisma";

const expenseInclude = {
    expenseType: {
        select: {
            id: true,
            name: true,
        },
    },

    paymentMethod: {
        select: {
            id: true,
            name: true,
        },
    },

    payments: {
        orderBy: {
            paidAt: "desc" as const,
        },
        take: 1,
        select: {
            id: true,
            amount: true,
            paidAt: true,
            period: true,
        },
    },
};

const serializeExpense = (expense: any) => ({
    id: expense.id,
    name: expense.name,

    amount:
        expense.amount !== null
            ? Number(expense.amount)
            : null,

    dueDay: expense.dueDay,
    active: expense.active,

    expenseTypeId: expense.expenseTypeId,
    paymentMethodId: expense.paymentMethodId,

    expenseType: expense.expenseType,
    paymentMethod: expense.paymentMethod,

    lastPayment: expense.payments?.[0]
        ? {
              id: expense.payments[0].id,
              amount: Number(
                  expense.payments[0].amount
              ),
              paidAt:
                  expense.payments[0].paidAt,
              period:
                  expense.payments[0].period,
          }
        : null,
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(
            authOptions
        );

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            },
            select: {
                id: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Usuario no encontrado" },
                { status: 404 }
            );
        }

        const body = await request.json();

        const recurringExpenseId =
            typeof body.recurringExpenseId ===
            "string"
                ? body.recurringExpenseId
                : "";

        const period =
            typeof body.period === "string"
                ? body.period
                : "";

        const amount = Number(body.amount);

        const paidAt =
            typeof body.paidAt === "string"
                ? body.paidAt
                : "";

        const paymentMethodId =
            typeof body.paymentMethodId ===
            "string"
                ? body.paymentMethodId
                : "";

        const updateAmount =
            body.updateAmount === true;

        if (!recurringExpenseId) {
            return NextResponse.json(
                {
                    error:
                        "Gasto mensual obligatorio",
                },
                { status: 400 }
            );
        }

        if (
            !/^\d{4}-\d{2}$/.test(period)
        ) {
            return NextResponse.json(
                {
                    error:
                        "Período inválido",
                },
                { status: 400 }
            );
        }

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "El monto debe ser mayor a cero",
                },
                { status: 400 }
            );
        }

        if (!paidAt) {
            return NextResponse.json(
                {
                    error:
                        "La fecha de pago es obligatoria",
                },
                { status: 400 }
            );
        }

        const parsedPaidAt = new Date(
            `${paidAt}T12:00:00`
        );

        if (
            Number.isNaN(
                parsedPaidAt.getTime()
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Fecha de pago inválida",
                },
                { status: 400 }
            );
        }

        if (!paymentMethodId) {
            return NextResponse.json(
                {
                    error:
                        "Medio de pago obligatorio",
                },
                { status: 400 }
            );
        }

        const recurringExpense =
            await prisma.recurringExpense.findFirst(
                {
                    where: {
                        id: recurringExpenseId,
                        userId: user.id,
                        active: true,
                    },
                }
            );

        if (!recurringExpense) {
            return NextResponse.json(
                {
                    error:
                        "Gasto mensual no encontrado o inactivo",
                },
                { status: 404 }
            );
        }

        const paymentMethod =
            await prisma.paymentMethod.findFirst(
                {
                    where: {
                        id: paymentMethodId,
                        userId: user.id,
                        active: true,
                    },
                }
            );

        if (!paymentMethod) {
            return NextResponse.json(
                {
                    error:
                        "Medio de pago inválido",
                },
                { status: 400 }
            );
        }

        const expenseType =
            await prisma.expenseType.findFirst({
                where: {
                    id: recurringExpense.expenseTypeId,
                    userId: user.id,
                    active: true,
                },
            });

        if (!expenseType) {
            return NextResponse.json(
                {
                    error:
                        "Tipo de gasto inválido",
                },
                { status: 400 }
            );
        }

        /*
         * Todo ocurre dentro de una única transacción:
         *
         * 1. Crear Movement EGRESO
         * 2. Crear Expense asociado
         * 3. Crear RecurringExpensePayment
         * 4. Opcionalmente actualizar el monto habitual
         *
         * Si algo falla, Prisma revierte todo.
         */
        const result = await prisma.$transaction(
            async (tx) => {
                const movement =
                    await tx.movement.create({
                        data: {
                            userId: user.id,
                            type: "EGRESO",
                            date: parsedPaidAt,
                            amount,
                            description: `Pago: ${recurringExpense.name}`,

                            expense: {
                                create: {
                                    expenseTypeId:
                                        recurringExpense.expenseTypeId,
                                    paymentMethodId,
                                },
                            },
                        },
                    });

                await tx.recurringExpensePayment.create(
                    {
                        data: {
                            recurringExpenseId:
                                recurringExpense.id,
                            movementId:
                                movement.id,
                            period,
                            amount,
                            paidAt: parsedPaidAt,
                        },
                    }
                );

                if (updateAmount) {
                    await tx.recurringExpense.update(
                        {
                            where: {
                                id: recurringExpense.id,
                            },

                            data: {
                                amount,
                                paymentMethodId,
                            },
                        }
                    );
                }

                const updatedExpense =
                    await tx.recurringExpense.findUnique(
                        {
                            where: {
                                id: recurringExpense.id,
                            },

                            include: expenseInclude,
                        }
                    );

                return {
                    movement,
                    recurringExpense:
                        updatedExpense,
                };
            }
        );

        return NextResponse.json({
            movement: result.movement,

            recurringExpense:
                result.recurringExpense
                    ? serializeExpense(
                          result.recurringExpense
                      )
                    : null,
        });
    } catch (error: any) {
        console.error(
            "POST /api/gastos-mensuales/pagar:",
            error
        );

        if (error?.code === "P2002") {
            return NextResponse.json(
                {
                    error:
                        "Ya existe un pago registrado para ese período",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                error:
                    "No se pudo registrar el pago",
            },
            { status: 500 }
        );
    }
}
