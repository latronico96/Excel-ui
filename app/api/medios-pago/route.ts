
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

        const existingCount = await prisma.paymentMethod.count({
            where: {
                workspaceId,
            },
        });

        if (existingCount === 0) {
            const defaults = [
                { name: "Efectivo", defaultCommissionPercentage: 0 },
                { name: "Débito", defaultCommissionPercentage: 0 },
                { name: "Crédito", defaultCommissionPercentage: 23 },
                { name: "Transferencia", defaultCommissionPercentage: 0 },
            ];

            const existingMethods = await prisma.paymentMethod.findMany({
                where: { workspaceId },
                select: { name: true },
            });

            const existingNames = new Set(
                existingMethods.map((method) => method.name)
            );

            const missingMethods = defaults
                .filter((method) => !existingNames.has(method.name))
                .map((method) => ({
                    ...method,
                    workspaceId,
                }));

            await prisma.paymentMethod.createMany({
                data: missingMethods,
            });
        }

        const paymentMethods = await prisma.paymentMethod.findMany({
            where: {
                workspaceId,
                ...(showAll ? {} : { active: true }),
            },
            select: {
                id: true,
                name: true,
                active: true,
                defaultCommissionPercentage: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(
            paymentMethods.map((method) => ({
                id: method.id,
                name: method.name,
                active: method.active,
                defaultCommissionPercentage: Number(
                    method.defaultCommissionPercentage
                ),
            }))
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
                    error: "La comisión debe estar entre 0 y 100",
                },
                { status: 400 }
            );
        }

        const existing = await prisma.paymentMethod.findFirst({
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
                        "Ya existe un medio de pago con ese nombre",
                },
                { status: 400 }
            );
        }

        const paymentMethod = await prisma.paymentMethod.create({
            data: {
                workspaceId,
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

        if (isUniqueError(error)) {
            return NextResponse.json(
                {
                    error:
                        "Ya existe un medio de pago con ese nombre",
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Error creating payment method" },
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
                { error: "Falta el id del medio de pago" },
                { status: 400 }
            );
        }

        const existing = await prisma.paymentMethod.findFirst({
            where: {
                id,
                workspaceId,
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
                            "Ya existe otro medio de pago con ese nombre",
                    },
                    { status: 400 }
                );
            }

            data.name = name;
        }

        if (body.defaultCommissionPercentage !== undefined) {
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
                        error: "La comisión debe estar entre 0 y 100",
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

        const updated = await prisma.paymentMethod.updateMany({
            where: {
                id: existing.id,
                workspaceId,
            },
            data,
        });

        if (updated.count !== 1) {
            return NextResponse.json(
                { error: "Medio de pago no encontrado" },
                { status: 404 }
            );
        }

        const paymentMethod = await prisma.paymentMethod.findFirst({
            where: {
                id: existing.id,
                workspaceId,
            },
            select: {
                id: true,
                name: true,
                active: true,
                defaultCommissionPercentage: true,
            },
        });

        if (!paymentMethod) {
            return NextResponse.json(
                { error: "Medio de pago no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ...paymentMethod,
            defaultCommissionPercentage: Number(
                paymentMethod.defaultCommissionPercentage
            ),
        });
    } catch (error) {
        console.error("PATCH /api/medios-pago:", error);

        if (isUniqueError(error)) {
            return NextResponse.json(
                {
                    error:
                        "Ya existe otro medio de pago con ese nombre",
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Error updating payment method" },
            { status: 500 }
        );
    }
}
