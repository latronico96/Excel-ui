import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import crypto from "crypto";
import { getOrCreateWorkspaceForUser } from "@/server/services/workspace.service";

const demoEmail = "demo@excel-ui.demo";

export async function POST() {
    try {
        const user = await prisma.user.upsert({
            where: { email: demoEmail },
            update: {},
            create: {
                name: "Demo Excel Pro",
                email: demoEmail,
            },
        });
        await getOrCreateWorkspaceForUser(user.id);

        const sessionToken = crypto.randomBytes(32).toString("hex");

        await prisma.session.create({
            data: {
                sessionToken,
                userId: user.id,
                expires: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                ),
            },
        });

        const response = NextResponse.json({ success: true });

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
            { error: "No se pudo iniciar la demo" },
            { status: 500 }
        );
    }
}
