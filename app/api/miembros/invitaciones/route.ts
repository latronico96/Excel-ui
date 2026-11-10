import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { requireWorkspaceAdmin } from "@/server/services/workspace-permissions";
import { prisma } from "@/prisma/prisma";

export async function POST() {
    try {
        const permission = await requireWorkspaceAdmin();

        if (!permission.ok) {
            return NextResponse.json(
                { error: permission.error },
                { status: permission.status }
            );
        }

        const current = permission.current;

        if (current.workspace.isDemo) {
            return NextResponse.json(
                {
                    error: "Las invitaciones no están disponibles en el espacio demo",
                },
                { status: 403 }
            );
        }

        const baseUrl = process.env.NEXTAUTH_URL;

        if (!baseUrl) {
            return NextResponse.json(
                { error: "Falta configurar NEXTAUTH_URL" },
                { status: 500 }
            );
        }

        const token = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256")
            .update(token)
            .digest("hex");

        const expiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        const invitation = await prisma.workspaceInvitation.create({
            data: {
                workspaceId: current.workspaceId,
                invitedByUserId: current.userId,
                tokenHash,
                role: "MEMBER",
                expiresAt,
            },
        });

        const inviteUrl = new URL(
            `/invitacion/${token}`,
            baseUrl
        ).toString();

        return NextResponse.json({
            inviteUrl,
            expiresAt: invitation.expiresAt,
        });
    } catch (error) {
        console.error("Error al crear invitación:", error);

        return NextResponse.json(
            { error: "No se pudo generar la invitación" },
            { status: 500 }
        );
    }
}
