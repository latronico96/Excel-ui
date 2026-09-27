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

export async function GET(request: Request) {
    const user = await getUser();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const showAll = new URL(request.url).searchParams.get("all") === "true";
        const existingCount = await prisma.expenseType.count({
            where: {
                userId: user.id,
            },
        });

        if (existingCount === 0) {
            await prisma.expenseType.createMany({
                data: [
                    {
                        userId: user.id,
                        name: "Insumos",
                    },
                    {
                        userId: user.id,
                        name: "Servicios",
                    },
                    {
                        userId: user.id,
                        name: "Impuestos",
                    },
                    {
                        userId: user.id,
                        name: "Otros",
                    },
                ],
            });
        }

        const expenseTypes = await prisma.expenseType.findMany({
            where: {
                userId: user.id,
                ...(showAll ? {} : { active: true }),
            },
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(expenseTypes);
    } catch (error) {
        console.error("GET /api/tipos-gasto:", error);

        return NextResponse.json(
            { error: "Error fetching expense types" },
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

        if (!name) {
            return NextResponse.json(
                { error: "El nombre es obligatorio" },
                { status: 400 }
            );
        }

        const existing = await prisma.expenseType.findUnique({
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
                        "Ya existe un tipo de gasto con ese nombre",
                },
                { status: 400 }
            );
        }

        const expenseType = await prisma.expenseType.create({
            data: {
                userId: user.id,
                name,
            },
            select: {
                id: true,
                name: true,
                active: true,
            },
        });

        return NextResponse.json(
            expenseType,
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/tipos-gasto:", error);

        return NextResponse.json(
            { error: "Error creating expense type" },
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
                { error: "Falta el id del tipo de gasto" },
                { status: 400 }
            );
        }

        const existing = await prisma.expenseType.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Tipo de gasto no encontrado" },
                { status: 404 }
            );
        }

        const data: {
            name?: string;
            active?: boolean;
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

            const duplicate = await prisma.expenseType.findFirst({
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
                            "Ya existe otro tipo de gasto con ese nombre",
                    },
                    { status: 400 }
                );
            }

            data.name = name;
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

        const expenseType = await prisma.expenseType.update({
            where: {
                id,
            },
            data,
            select: {
                id: true,
                name: true,
                active: true,
            },
        });

        return NextResponse.json(expenseType);
    } catch (error) {
        console.error("PATCH /api/tipos-gasto:", error);

        return NextResponse.json(
            { error: "Error updating expense type" },
            { status: 500 }
        );
    }
}