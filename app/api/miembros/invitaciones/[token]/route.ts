
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/prisma/prisma";

type RouteContext = {
    params: {
        token: string;
    };
};

export async function GET(
    _request: Request,
    { params }: RouteContext
) {
    try {
        const token = params.token;

        if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
            return NextResponse.json(
                { valid: false, error: "El enlace no es válido." },
                { status: 400 }
            );
        }

        const tokenHash = createHash("sha256")
            .update(token)
            .digest("hex");

        const invitation = await prisma.workspaceInvitation.findUnique({
            where: { tokenHash },
            select: {
                expiresAt: true,
                acceptedAt: true,
                revokedAt: true,
                workspace: {
                    select: {
                        name: true,
                        isDemo: true,
                    },
                },
            },
        });

        if (!invitation) {
            return NextResponse.json({
                valid: false,
                error: "La invitación no existe o ya no está disponible.",
            });
        }

        if (invitation.revokedAt) {
            return NextResponse.json({
                valid: false,
                error: "Esta invitación fue revocada.",
            });
        }

        if (invitation.acceptedAt) {
            return NextResponse.json({
                valid: false,
                error: "Esta invitación ya fue utilizada.",
            });
        }

        if (invitation.expiresAt <= new Date()) {
            return NextResponse.json({
                valid: false,
                error: "Esta invitación venció.",
            });
        }

        return NextResponse.json({
            valid: true,
            workspaceName: invitation.workspace.name,
        });
    } catch (error) {
        console.error("Error al validar invitación:", error);

        return NextResponse.json(
            { valid: false, error: "No se pudo validar la invitación." },
            { status: 500 }
        );
    }
}
