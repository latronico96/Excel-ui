
import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { getCurrentWorkspace } from "@/server/services/workspace.service";
import { prisma } from "@/prisma/prisma";

export async function POST() {
    try {
        const current = await getCurrentWorkspace();

        if (!current) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        // Solo OWNER y ADMIN pueden invitar.
        if (current.role !== "OWNER" && current.role !== "ADMIN") {
            return NextResponse.json(
                { error: "No tenés permisos para invitar miembros" },
                { status: 403 }
            );
        }

        /*/ Los espacios demo no generan invitaciones reales.
        if (false && current.workspace.isDemo) {
            return NextResponse.json(
                { error: "Las invitaciones no están disponibles en el espacio demo" },
                { status: 403 }
            );
        }// */

        // El token original solo se entrega al usuario una vez.
        const token = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256")
            .update(token)
            .digest("hex");

        const expiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await prisma.workspaceInvitation.create({
            data: {
                workspaceId: current.workspaceId,
                invitedByUserId: current.userId,
                tokenHash,
                role: "MEMBER",
                expiresAt,
            },
        });

        const baseUrl = process.env.NEXTAUTH_URL;

        if (!baseUrl) {
            return NextResponse.json(
                { error: "Falta configurar NEXTAUTH_URL" },
                { status: 500 }
            );
        }

        const inviteUrl = new URL(
            `/invitacion/${token}`,
            baseUrl
        ).toString();

        return NextResponse.json({
            inviteUrl,
            expiresAt,
        });
    } catch (error) {
        console.error("Error al crear invitación:", error);

        return NextResponse.json(
            { error: "No se pudo generar la invitación" },
            { status: 500 }
        );
    }
}
