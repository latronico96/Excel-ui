import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth-options";
import { prisma } from "@/prisma/prisma";

type RouteContext = {
    params: Promise<{ token: string }>;
};

export async function POST(
    request: Request,
    { params }: RouteContext
) {
    try {
        const session = await getServerSession(authOptions);
        const { token } = await params;

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Tenés que iniciar sesión para aceptar la invitación." },
                { status: 401 }
            );
        }

        if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
            return NextResponse.json(
                { error: "El enlace de invitación no es válido." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, email: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "No encontramos tu usuario. Volvé a iniciar sesión." },
                { status: 404 }
            );
        }

        if (user.email === "demo@excel-ui.demo") {
            return NextResponse.json(
                { error: "La cuenta demo no puede aceptar invitaciones." },
                { status: 403 }
            );
        }

        const tokenHash = createHash("sha256")
            .update(token)
            .digest("hex");

        const result = await prisma.$transaction(async (tx) => {
            const invitation = await tx.workspaceInvitation.findUnique({
                where: { tokenHash },
                select: {
                    id: true,
                    workspaceId: true,
                    role: true,
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
                throw new Error("INVITATION_NOT_FOUND");
            }

            if (invitation.revokedAt) {
                throw new Error("INVITATION_REVOKED");
            }

            if (invitation.acceptedAt) {
                throw new Error("INVITATION_USED");
            }

            if (invitation.expiresAt <= new Date()) {
                throw new Error("INVITATION_EXPIRED");
            }

            if (invitation.workspace.isDemo) {
                throw new Error("DEMO_WORKSPACE");
            }

            const existingMembership = await tx.workspaceMember.findFirst({
                where: {
                    userId: user.id,
                    workspaceId: invitation.workspaceId,
                },
                select: { id: true },
            });

            if (existingMembership) {
                throw new Error("ALREADY_MEMBER");
            }

            await tx.workspaceMember.create({
                data: {
                    userId: user.id,
                    workspaceId: invitation.workspaceId,
                    role: invitation.role,
                },
            });

            const updated = await tx.workspaceInvitation.updateMany({
                where: {
                    id: invitation.id,
                    acceptedAt: null,
                    revokedAt: null,
                    expiresAt: { gt: new Date() },
                },
                data: {
                    acceptedAt: new Date(),
                    acceptedByUserId: user.id,
                },
            });

            if (updated.count !== 1) {
                throw new Error("INVITATION_ALREADY_PROCESSED");
            }

            return { workspaceName: invitation.workspace.name };
        });

        return NextResponse.json({
            success: true,
            message: "Te uniste al espacio correctamente.",
            workspaceName: result.workspaceName,
        });
    } catch (error) {
        const errors: Record<string, { message: string; status: number }> = {
            INVITATION_NOT_FOUND: {
                message: "La invitación no existe o ya no está disponible.",
                status: 404,
            },
            INVITATION_REVOKED: {
                message: "Esta invitación fue revocada.",
                status: 410,
            },
            INVITATION_USED: {
                message: "Esta invitación ya fue utilizada.",
                status: 410,
            },
            INVITATION_EXPIRED: {
                message: "Esta invitación venció.",
                status: 410,
            },
            DEMO_WORKSPACE: {
                message: "No se puede aceptar una invitación al espacio demo.",
                status: 403,
            },
            ALREADY_MEMBER: {
                message: "Ya sos miembro de este espacio.",
                status: 409,
            },
            INVITATION_ALREADY_PROCESSED: {
                message: "La invitación ya fue procesada. Actualizá la página.",
                status: 409,
            },
        };

        if (error instanceof Error && errors[error.message]) {
            const knownError = errors[error.message];

            return NextResponse.json(
                { error: knownError.message },
                { status: knownError.status }
            );
        }

        console.error("Error al aceptar invitación:", error);

        return NextResponse.json(
            { error: "No se pudo aceptar la invitación. Intentá nuevamente." },
            { status: 500 }
        );
    }
}
