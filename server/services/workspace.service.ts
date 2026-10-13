
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth-options";
import { prisma } from "@/prisma/prisma";

export async function getOrCreateWorkspaceForUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });

    if (!user) {
        throw new Error("Usuario no encontrado");
    }

    const membership = await prisma.workspaceMember.findFirst({
        where: { userId: user.id },
        include: { workspace: true },
        orderBy: { createdAt: "asc" },
    });

    if (membership) {
        return {
            userId: user.id,
            workspaceId: membership.workspaceId,
            role: membership.role,
            workspace: membership.workspace,
        };
    }

    const isDemo = user.email === "demo@excel-ui.demo";

    const workspace = await prisma.workspace.create({
        data: {
            name: isDemo
                ? "Espacio Demo"
                : `Espacio de ${user.name?.trim() || "Mi cuenta"}`,
            isDemo,
            onboardingCompleted: isDemo,
            members: {
                create: {
                    userId: user.id,
                    role: "OWNER",
                },
            },
        },
    });

    return {
        userId: user.id,
        workspaceId: workspace.id,
        role: "OWNER" as const,
        workspace,
    };
}

export async function getCurrentWorkspace() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
    });

    if (!user) {
        return null;
    }

    return getOrCreateWorkspaceForUser(user.id);
}
