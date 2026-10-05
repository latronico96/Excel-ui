import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import crypto from "crypto";

export async function POST() {
    try {
        const demoEmail = "demo@excelpro.local";

        // Buscar o crear usuario demo
        let user = await prisma.user.findUnique({
            where: {
                email: demoEmail,
            },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: "Demo Excel Pro",
                    email: demoEmail,
                    isDemo: true,
                    onboardingCompleted: true,
                    defaultInvestmentPercentage: 50,
                    titheEnabled: false,
                    tithePercentage: 10,
                    titheBase: "NET_INCOME",
                },
            });
        }

        // Crear sesión compatible con NextAuth database sessions
        const sessionToken = crypto.randomBytes(32).toString("hex");

        await prisma.session.create({
            data: {
                sessionToken,
                userId: user.id,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });

        const response = NextResponse.json({
            success: true,
        });

        // Cookie utilizada por NextAuth 4
        response.cookies.set(
            process.env.NODE_ENV === "production"
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token",
            sessionToken,
            {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 30 * 24 * 60 * 60,
            }
        );

        return response;
    } catch (error) {
        console.error("Error creando sesión demo:", error);

        return NextResponse.json(
            {
                error: "No se pudo iniciar la demo",
            },
            {
                status: 500,
            }
        );
    }
}
