
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth-options";
import { prisma } from "@/prisma/prisma";
import { ACTIVE_WORKSPACE_COOKIE } from "@/server/services/workspace.service";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const body = await request.json().catch(() => null);
        const workspaceId = body?.workspaceId;

        if (typeof workspaceId !== "string" || !workspaceId.trim()) {
            return NextResponse.json(
                { error: "Espacio inválido" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Usuario no encontrado" },
                { status: 404 }
            );
        }

        const membership = await prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: user.id,
                },
            },
            include: {
                workspace: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!membership) {
            return NextResponse.json(
                { error: "No tenés acceso a ese espacio" },
                { status: 403 }
            );
        }

        cookies().set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });

        return NextResponse.json({
            success: true,
            workspace: membership.workspace,
        });
    } catch (error) {
        console.error("POST /api/espacios/activo:", error);

        return NextResponse.json(
            { error: "No se pudo cambiar el espacio" },
            { status: 500 }
        );
    }
}
