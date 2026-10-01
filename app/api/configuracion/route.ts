import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/auth-options";
import { prisma } from "@/prisma/prisma";

const VALID_TITHE_BASES = [
    "NET_INCOME",
    "AFTER_INVESTMENT",
] as const;

type TitheBase = (typeof VALID_TITHE_BASES)[number];

export async function GET() {
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
                defaultInvestmentPercentage: true,
                onboardingCompleted: true,
                titheEnabled: true,
                tithePercentage: true,
                titheBase: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Usuario no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            defaultInvestmentPercentage: Number(
                user.defaultInvestmentPercentage
            ),
            onboardingCompleted:
                user.onboardingCompleted,
            titheEnabled: user.titheEnabled,
            tithePercentage: Number(
                user.tithePercentage
            ),
            titheBase: user.titheBase,
        });
    } catch (error) {
        console.error(
            "GET /api/configuracion:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "No se pudo cargar la configuración",
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

        const data: {
            defaultInvestmentPercentage?: number;
            onboardingCompleted?: boolean;
            titheEnabled?: boolean;
            tithePercentage?: number;
            titheBase?: TitheBase;
        } = {};

        /*
         * Porcentaje de inversión
         */
        if (
            body.defaultInvestmentPercentage !==
            undefined
        ) {
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

            data.defaultInvestmentPercentage =
                percentage;
        }

        /*
         * Estado del onboarding
         */
        if (
            body.onboardingCompleted !== undefined
        ) {
            if (
                typeof body.onboardingCompleted !==
                "boolean"
            ) {
                return NextResponse.json(
                    {
                        error:
                            "onboardingCompleted debe ser boolean",
                    },
                    { status: 400 }
                );
            }

            data.onboardingCompleted =
                body.onboardingCompleted;
        }

        /*
         * Activar / desactivar diezmo
         */
        if (body.titheEnabled !== undefined) {
            if (
                typeof body.titheEnabled !==
                "boolean"
            ) {
                return NextResponse.json(
                    {
                        error:
                            "titheEnabled debe ser boolean",
                    },
                    { status: 400 }
                );
            }

            data.titheEnabled = body.titheEnabled;
        }

        /*
         * Porcentaje de diezmo
         */
        if (
            body.tithePercentage !== undefined
        ) {
            const percentage = Number(
                body.tithePercentage
            );

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
                !VALID_TITHE_BASES.includes(
                    body.titheBase
                )
            ) {
                return NextResponse.json(
                    {
                        error:
                            "La base del diezmo no es válida",
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

        const updatedUser =
            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data,
                select: {
                    defaultInvestmentPercentage: true,
                    onboardingCompleted: true,
                    titheEnabled: true,
                    tithePercentage: true,
                    titheBase: true,
                },
            });

        return NextResponse.json({
            defaultInvestmentPercentage: Number(
                updatedUser.defaultInvestmentPercentage
            ),
            onboardingCompleted:
                updatedUser.onboardingCompleted,
            titheEnabled:
                updatedUser.titheEnabled,
            tithePercentage: Number(
                updatedUser.tithePercentage
            ),
            titheBase: updatedUser.titheBase,
        });
    } catch (error) {
        console.error(
            "PATCH /api/configuracion:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "No se pudo actualizar la configuración",
            },
            { status: 500 }
        );
    }
}
