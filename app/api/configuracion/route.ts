import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/auth-options";
import { prisma } from "@/prisma/prisma";

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
                },
            });

        return NextResponse.json({
            defaultInvestmentPercentage: Number(
                updatedUser.defaultInvestmentPercentage
            ),
            onboardingCompleted:
                updatedUser.onboardingCompleted,
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
