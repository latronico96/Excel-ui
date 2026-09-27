import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/auth-options";
import { prisma } from "@/prisma/prisma";

async function getUser() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return null;
    }

    return prisma.user.findUnique({
        where: {
            email: session.user.email,
        },
        select: {
            id: true,
        },
    });
}

export async function GET() {
    const user = await getUser();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const existingCount = await prisma.paymentMethod.count({
            where: {
                userId: user.id,
            },
        });

        if (existingCount === 0) {
            await prisma.paymentMethod.createMany({
                data: [
                    {
                        userId: user.id,
                        name: "Efectivo",
                        defaultCommissionPercentage: 0,
                    },
                    {
                        userId: user.id,
                        name: "Débito",
                        defaultCommissionPercentage: 0,
                    },
                    {
                        userId: user.id,
                        name: "Crédito",
                        defaultCommissionPercentage: 23,
                    },
                    {
                        userId: user.id,
                        name: "Transferencia",
                        defaultCommissionPercentage: 0,
                    },
                ],
            });
        }

        const paymentMethods = await prisma.paymentMethod.findMany({
            where: {
                userId: user.id,
                active: true,
            },
            select: {
                id: true,
                name: true,
                defaultCommissionPercentage: true,
            },
            orderBy: {
                name: "asc",
            },
        });
        return NextResponse.json(
            paymentMethods.map(
                (method: {
                    id: string;
                    name: string;
                    defaultCommissionPercentage: unknown;
                }) => ({
                    id: method.id,
                    name: method.name,
                    defaultCommissionPercentage: Number(
                        method.defaultCommissionPercentage
                    ),
                })
            )
        );
    } catch (error) {
        console.error("GET /api/medios-pago:", error);

        return NextResponse.json(
            { error: "Error fetching payment methods" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const user = await getUser();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();

        const name =
            typeof body.name === "string"
                ? body.name.trim()
                : "";

        const commission = Number(
            body.defaultCommissionPercentage
        );

        if (!name) {
            return NextResponse.json(
                { error: "El nombre es obligatorio" },
                { status: 400 }
            );
        }

        if (
            !Number.isFinite(commission) ||
            commission < 0 ||
            commission > 100
        ) {
            return NextResponse.json(
                {
                    error:
                        "La comisión debe estar entre 0 y 100",
                },
                { status: 400 }
            );
        }

        const existing = await prisma.paymentMethod.findUnique({
            where: {
                userId_name: {
                    userId: user.id,
                    name,
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                {
                    error:
                        "Ya existe un medio de pago con ese nombre",
                },
                { status: 400 }
            );
        }

        const paymentMethod = await prisma.paymentMethod.create({
            data: {
                userId: user.id,
                name,
                defaultCommissionPercentage: commission,
            },
            select: {
                id: true,
                name: true,
                active: true,
                defaultCommissionPercentage: true,
            },
        });

        return NextResponse.json(
            {
                ...paymentMethod,
                defaultCommissionPercentage: Number(
                    paymentMethod.defaultCommissionPercentage
                ),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/medios-pago:", error);

        return NextResponse.json(
            { error: "Error creating payment method" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    const user = await getUser();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();

        const id =
            typeof body.id === "string"
                ? body.id
                : "";

        if (!id) {
            return NextResponse.json(
                { error: "Falta el id del medio de pago" },
                { status: 400 }
            );
        }

        const existing = await prisma.paymentMethod.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Medio de pago no encontrado" },
                { status: 404 }
            );
        }

        const data: {
            name?: string;
            active?: boolean;
            defaultCommissionPercentage?: number;
        } = {};

        if (body.name !== undefined) {
            const name =
                typeof body.name === "string"
                    ? body.name.trim()
                    : "";

            if (!name) {
                return NextResponse.json(
                    { error: "El nombre es obligatorio" },
                    { status: 400 }
                );
            }

            const duplicate =
                await prisma.paymentMethod.findFirst({
                    where: {
                        userId: user.id,
                        name,
                        id: {
                            not: id,
                        },
                    },
                });

            if (duplicate) {
                return NextResponse.json(
                    {
                        error:
                            "Ya existe otro medio de pago con ese nombre",
                    },
                    { status: 400 }
                );
            }

            data.name = name;
        }

        if (
            body.defaultCommissionPercentage !== undefined
        ) {
            const commission = Number(
                body.defaultCommissionPercentage
            );

            if (
                !Number.isFinite(commission) ||
                commission < 0 ||
                commission > 100
            ) {
                return NextResponse.json(
                    {
                        error:
                            "La comisión debe estar entre 0 y 100",
                    },
                    { status: 400 }
                );
            }

            data.defaultCommissionPercentage = commission;
        }

        if (body.active !== undefined) {
            if (typeof body.active !== "boolean") {
                return NextResponse.json(
                    { error: "El estado activo es inválido" },
                    { status: 400 }
                );
            }

            data.active = body.active;
        }

        const paymentMethod =
            await prisma.paymentMethod.update({
                where: {
                    id,
                },
                data,
                select: {
                    id: true,
                    name: true,
                    active: true,
                    defaultCommissionPercentage: true,
                },
            });

        return NextResponse.json({
            ...paymentMethod,
            defaultCommissionPercentage: Number(
                paymentMethod.defaultCommissionPercentage
            ),
        });
    } catch (error) {
        console.error("PATCH /api/medios-pago:", error);

        return NextResponse.json(
            { error: "Error updating payment method" },
            { status: 500 }
        );
    }
}