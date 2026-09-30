import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/auth-options";
import { prisma } from "@/prisma/prisma";

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
              paidAt: expense.payments[0].paidAt,
              period: expense.payments[0].period,
          }
        : null,
});

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

export async function GET(request: Request) {
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

        const { searchParams } =
            new URL(request.url);

        const all =
            searchParams.get("all") === "true";

        const expenses =
            await prisma.recurringExpense.findMany({
                where: {
                    userId: user.id,
                    ...(all
                        ? {}
                        : {
                              active: true,
                          }),
                },

                include: expenseInclude,

                orderBy: {
                    name: "asc",
                },
            });

        return NextResponse.json(
            expenses.map(serializeExpense)
        );
    } catch (error) {
        console.error(
            "GET /api/gastos-mensuales:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "No se pudieron cargar los gastos mensuales",
            },
            { status: 500 }
        );
    }
}

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

        const name =
            typeof body.name === "string"
                ? body.name.trim()
                : "";

        const amount =
            body.amount === null ||
            body.amount === undefined ||
            body.amount === ""
                ? null
                : Number(body.amount);

        const dueDay =
            body.dueDay === null ||
            body.dueDay === undefined ||
            body.dueDay === ""
                ? null
                : Number(body.dueDay);

        const expenseTypeId =
            typeof body.expenseTypeId === "string"
                ? body.expenseTypeId
                : "";

        const paymentMethodId =
            typeof body.paymentMethodId ===
            "string"
                ? body.paymentMethodId
                : "";

        if (!name) {
            return NextResponse.json(
                {
                    error:
                        "El nombre es obligatorio",
                },
                { status: 400 }
            );
        }

        if (
            amount !== null &&
            (!Number.isFinite(amount) ||
                amount < 0)
        ) {
            return NextResponse.json(
                { error: "Monto inválido" },
                { status: 400 }
            );
        }

        if (
            dueDay !== null &&
            (!Number.isInteger(dueDay) ||
                dueDay < 1 ||
                dueDay > 31)
        ) {
            return NextResponse.json(
                {
                    error:
                        "El día de vencimiento debe estar entre 1 y 31",
                },
                { status: 400 }
            );
        }

        if (!expenseTypeId) {
            return NextResponse.json(
                {
                    error:
                        "El tipo de gasto es obligatorio",
                },
                { status: 400 }
            );
        }

        if (!paymentMethodId) {
            return NextResponse.json(
                {
                    error:
                        "El medio de pago es obligatorio",
                },
                { status: 400 }
            );
        }

        const [expenseType, paymentMethod] =
            await Promise.all([
                prisma.expenseType.findFirst({
                    where: {
                        id: expenseTypeId,
                        userId: user.id,
                        active: true,
                    },
                }),

                prisma.paymentMethod.findFirst({
                    where: {
                        id: paymentMethodId,
                        userId: user.id,
                        active: true,
                    },
                }),
            ]);

        if (!expenseType) {
            return NextResponse.json(
                {
                    error:
                        "Tipo de gasto inválido",
                },
                { status: 400 }
            );
        }

        if (!paymentMethod) {
            return NextResponse.json(
                {
                    error:
                        "Medio de pago inválido",
                },
                { status: 400 }
            );
        }

        const recurringExpense =
            await prisma.recurringExpense.create({
                data: {
                    userId: user.id,
                    name,
                    amount,
                    dueDay,
                    expenseTypeId,
                    paymentMethodId,
                },

                include: expenseInclude,
            });

        return NextResponse.json(
            serializeExpense(recurringExpense),
            { status: 201 }
        );
    } catch (error: any) {
        console.error(
            "POST /api/gastos-mensuales:",
            error
        );

        if (error?.code === "P2002") {
            return NextResponse.json(
                {
                    error:
                        "Ya existe un gasto mensual con ese nombre",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                error:
                    "No se pudo crear el gasto mensual",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
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

        const id =
            typeof body.id === "string"
                ? body.id
                : "";

        if (!id) {
            return NextResponse.json(
                { error: "ID obligatorio" },
                { status: 400 }
            );
        }

        const existing =
            await prisma.recurringExpense.findFirst({
                where: {
                    id,
                    userId: user.id,
                },
            });

        if (!existing) {
            return NextResponse.json(
                {
                    error:
                        "Gasto mensual no encontrado",
                },
                { status: 404 }
            );
        }

        // Activar / desactivar
        if (
            typeof body.active === "boolean" &&
            Object.keys(body).length === 2
        ) {
            const updated =
                await prisma.recurringExpense.update({
                    where: { id },
                    data: {
                        active: body.active,
                    },
                    include: expenseInclude,
                });

            return NextResponse.json(
                serializeExpense(updated)
            );
        }

        const name =
            typeof body.name === "string"
                ? body.name.trim()
                : existing.name;

        const amount =
            body.amount === null ||
            body.amount === undefined ||
            body.amount === ""
                ? null
                : Number(body.amount);

        const dueDay =
            body.dueDay === null ||
            body.dueDay === undefined ||
            body.dueDay === ""
                ? null
                : Number(body.dueDay);

        const expenseTypeId =
            body.expenseTypeId ??
            existing.expenseTypeId;

        const paymentMethodId =
            body.paymentMethodId ??
            existing.paymentMethodId;

        if (!name) {
            return NextResponse.json(
                {
                    error:
                        "El nombre es obligatorio",
                },
                { status: 400 }
            );
        }

        if (
            amount !== null &&
            (!Number.isFinite(amount) ||
                amount < 0)
        ) {
            return NextResponse.json(
                { error: "Monto inválido" },
                { status: 400 }
            );
        }

        if (
            dueDay !== null &&
            (!Number.isInteger(dueDay) ||
                dueDay < 1 ||
                dueDay > 31)
        ) {
            return NextResponse.json(
                {
                    error:
                        "El día de vencimiento debe estar entre 1 y 31",
                },
                { status: 400 }
            );
        }

        const updated =
            await prisma.recurringExpense.update({
                where: {
                    id,
                },

                data: {
                    name,
                    amount,
                    dueDay,
                    expenseTypeId,
                    paymentMethodId,
                },

                include: expenseInclude,
            });

        return NextResponse.json(
            serializeExpense(updated)
        );
    } catch (error: any) {
        console.error(
            "PATCH /api/gastos-mensuales:",
            error
        );

        if (error?.code === "P2002") {
            return NextResponse.json(
                {
                    error:
                        "Ya existe un gasto mensual con ese nombre",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                error:
                    "No se pudo actualizar el gasto mensual",
            },
            { status: 500 }
        );
    }
}
