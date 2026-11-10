
import { NextResponse } from "next/server";

import { prisma } from "@/prisma/prisma";
import { getCurrentWorkspace } from "@/server/services/workspace.service";

function isUniqueError(error: unknown) {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
    );
}

export async function GET(request: Request) {
    try {
        const current = await getCurrentWorkspace();

        if (!current) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { workspaceId } = current;

        const showAll =
            new URL(request.url).searchParams.get("all") === "true";

        const existingCount = await prisma.expenseType.count({
            where: {
                workspaceId,
            },
        });

        if (existingCount === 0) {
            await prisma.expenseType.createMany({
                data: [
                    { workspaceId, name: "Insumos" },
                    { workspaceId, name: "Servicios" },
                    { workspaceId, name: "Impuestos" },
                    { workspaceId, name: "Otros" },
                ],
            });
        }

        const expenseTypes = await prisma.expenseType.findMany({
            where: {
                workspaceId,
                ...(showAll ? {} : { active: true }),
            },
            select: {
                id: true,
                name: true,
                active: true,
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
    try {
        const current = await getCurrentWorkspace();

        if (!current) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { workspaceId } = current;
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

        const existing = await prisma.expenseType.findFirst({
            where: {
                workspaceId,
                name: {
                    equals: name,
                    mode: "insensitive",
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
                workspaceId,
                name,
            },
            select: {
                id: true,
                name: true,
                active: true,
            },
        });

        return NextResponse.json(expenseType, { status: 201 });
    } catch (error) {
        console.error("POST /api/tipos-gasto:", error);

        if (isUniqueError(error)) {
            return NextResponse.json(
                {
                    error:
                        "Ya existe un tipo de gasto con ese nombre",
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Error creating expense type" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const current = await getCurrentWorkspace();

        if (!current) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { workspaceId } = current;
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
                workspaceId,
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
                    workspaceId,
                    name: {
                        equals: name,
                        mode: "insensitive",
                    },
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

        const updated = await prisma.expenseType.updateMany({
            where: {
                id: existing.id,
                workspaceId,
            },
            data,
        });

        if (updated.count !== 1) {
            return NextResponse.json(
                { error: "Tipo de gasto no encontrado" },
                { status: 404 }
            );
        }

        const expenseType = await prisma.expenseType.findFirst({
            where: {
                id: existing.id,
                workspaceId,
            },
            select: {
                id: true,
                name: true,
                active: true,
            },
        });

        if (!expenseType) {
            return NextResponse.json(
                { error: "Tipo de gasto no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(expenseType);
    } catch (error) {
        console.error("PATCH /api/tipos-gasto:", error);

        if (isUniqueError(error)) {
            return NextResponse.json(
                {
                    error:
                        "Ya existe otro tipo de gasto con ese nombre",
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Error updating expense type" },
            { status: 500 }
        );
    }
}
