import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { getCurrentWorkspace } from "@/server/services/workspace.service";
import { requireWorkspaceOwner } from "@/server/services/workspace-permissions";
export const dynamic = "force-dynamic";

const VALID_TITHE_BASES = [
    "NET_INCOME",
    "AFTER_INVESTMENT",
] as const;

type TitheBase = (typeof VALID_TITHE_BASES)[number];

export async function GET() {
    try {
        const current = await getCurrentWorkspace();

        if (!current) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const workspace = await prisma.workspace.findUnique({
            where: {
                id: current.workspaceId,
            },
            select: {
                name: true,
                defaultInvestmentPercentage: true,
                onboardingCompleted: true,
                titheEnabled: true,
                tithePercentage: true,
                titheBase: true,
            },
        });

        if (!workspace) {
            return NextResponse.json(
                { error: "Espacio de trabajo no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            name: workspace.name,
            defaultInvestmentPercentage: Number(
                workspace.defaultInvestmentPercentage
            ),
            onboardingCompleted: workspace.onboardingCompleted,
            titheEnabled: workspace.titheEnabled,
            tithePercentage: Number(workspace.tithePercentage),
            titheBase: workspace.titheBase,
        });
    } catch (error) {
        console.error("GET /api/configuracion:", error);

        return NextResponse.json(
            { error: "No se pudo cargar la configuración" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const permission = await requireWorkspaceOwner();

        if (!permission.ok) {
            return NextResponse.json(
                { error: permission.error },
                { status: permission.status }
            );
        }

        const current = permission.current;

        if (!current) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const data: {
            name?: string;
            defaultInvestmentPercentage?: number;
            onboardingCompleted?: boolean;
            titheEnabled?: boolean;
            tithePercentage?: number;
            titheBase?: TitheBase;
        } = {};
        /*
        * Workspace Name
        */
        if (body.name !== undefined) {
            if (typeof body.name !== "string") {
                return NextResponse.json(
                    { error: "El nombre debe ser un texto" },
                    { status: 400 }
                );
            }

            const name = body.name.trim();

            if (name.length < 2 || name.length > 80) {
                return NextResponse.json(
                    { error: "El nombre debe tener entre 2 y 80 caracteres" },
                    { status: 400 }
                );
            }

            data.name = name;
        }
        /*
         * Porcentaje de inversión
         */
        if (body.defaultInvestmentPercentage !== undefined) {
            const percentage = Number(
                body.defaultInvestmentPercentage
            );

            if (
                !Number.isFinite(percentage) ||
                percentage < 0 ||
                percentage > 100
            ) {
                return NextResponse.json(
                    {
                        error:
                            "El porcentaje de inversión debe estar entre 0 y 100",
                    },
                    { status: 400 }
                );
            }

            data.defaultInvestmentPercentage = percentage;
        }

        /*
         * Estado del onboarding
         */
        if (body.onboardingCompleted !== undefined) {
            if (typeof body.onboardingCompleted !== "boolean") {
                return NextResponse.json(
                    {
                        error:
                            "onboardingCompleted debe ser boolean",
                    },
                    { status: 400 }
                );
            }

            data.onboardingCompleted = body.onboardingCompleted;
        }

        /*
         * Activar / desactivar diezmo
         */
        if (body.titheEnabled !== undefined) {
            if (typeof body.titheEnabled !== "boolean") {
                return NextResponse.json(
                    {
                        error: "titheEnabled debe ser boolean",
                    },
                    { status: 400 }
                );
            }

            data.titheEnabled = body.titheEnabled;
        }

        /*
         * Porcentaje de diezmo
         */
        if (body.tithePercentage !== undefined) {
            const percentage = Number(body.tithePercentage);

            if (
                !Number.isFinite(percentage) ||
                percentage < 0 ||
                percentage > 100
            ) {
                return NextResponse.json(
                    {
                        error:
                            "El porcentaje de diezmo debe estar entre 0 y 100",
                    },
                    { status: 400 }
                );
            }

            data.tithePercentage = percentage;
        }

        /*
         * Base del cálculo del diezmo
         */
        if (body.titheBase !== undefined) {
            if (
                typeof body.titheBase !== "string" ||
                !VALID_TITHE_BASES.some(
                    (base) => base === body.titheBase
                )
            ) {
                return NextResponse.json(
                    {
                        error: "La base del diezmo no es válida",
                    },
                    { status: 400 }
                );
            }

            data.titheBase = body.titheBase;
        }

        if (Object.keys(data).length === 0) {
            return NextResponse.json(
                {
                    error:
                        "No se proporcionó ninguna configuración para actualizar",
                },
                { status: 400 }
            );
        }

        const updatedWorkspace = await prisma.workspace.update({
            where: {
                id: current.workspaceId,
            },
            data,
            select: {
                name: true,
                defaultInvestmentPercentage: true,
                onboardingCompleted: true,
                titheEnabled: true,
                tithePercentage: true,
                titheBase: true,
            },
        });

        return NextResponse.json({
            name: updatedWorkspace.name,
            defaultInvestmentPercentage: Number(
                updatedWorkspace.defaultInvestmentPercentage
            ),
            onboardingCompleted: updatedWorkspace.onboardingCompleted,
            titheEnabled: updatedWorkspace.titheEnabled,
            tithePercentage: Number(
                updatedWorkspace.tithePercentage
            ),
            titheBase: updatedWorkspace.titheBase,
        });
    } catch (error) {
        console.error("PATCH /api/configuracion:", error);

        return NextResponse.json(
            { error: "No se pudo actualizar la configuración" },
            { status: 500 }
        );
    }
}
