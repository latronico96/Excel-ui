import { NextResponse } from "next/server";
import { getCurrentWorkspace } from "@/server/services/workspace.service";
import { prisma } from "@/prisma/prisma";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const current = await getCurrentWorkspace();

        if (!current) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const members = await prisma.workspaceMember.findMany({
            where: {
                workspaceId: current.workspaceId,
            },
            select: {
                id: true,
                role: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return NextResponse.json({
            workspaceId: current.workspaceId,
            currentUserId: current.userId,
            currentRole: current.role,
            members: members.map((member) => ({
                id: member.id,
                role: member.role,
                createdAt: member.createdAt,
                user: member.user,
            })),
        });
    } catch (error) {
        console.error("Error al listar miembros:", error);

        return NextResponse.json(
            { error: "No se pudieron obtener los miembros" },
            { status: 500 }
        );
    }
}
