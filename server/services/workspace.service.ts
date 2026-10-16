
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth-options";
import { prisma } from "@/prisma/prisma";

export const ACTIVE_WORKSPACE_COOKIE = "excel-pro-workspace-id";
export const DEMO_EMAIL = "demo@excel-ui.demo";

export class WorkspaceServiceError extends Error {
    status: number;

    constructor(message: string, status = 400) {
        super(message);
        this.name = "WorkspaceServiceError";
        this.status = status;
    }
}

// Obtiene al usuario autenticado.
export async function getAuthenticatedWorkspaceUser() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        throw new WorkspaceServiceError("No autenticado", 401);
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });

    if (!user) {
        throw new WorkspaceServiceError("Usuario no encontrado", 404);
    }

    return user;
}

// Obtiene el rol del usuario dentro de un espacio.
export async function getWorkspaceMembership(
    userId: string,
    workspaceId: string
) {
    return prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId,
            },
        },
        select: {
            role: true,
            workspace: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
}

// Garantiza que cada usuario tenga un espacio inicial.
export async function getOrCreateWorkspaceForUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
    });

    if (!user) {
        throw new WorkspaceServiceError("Usuario no encontrado", 404);
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

    const isDemo = user.email === DEMO_EMAIL;

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

// Obtiene el espacio activo, validando que el usuario sea miembro.
export async function getCurrentWorkspace() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
    });

    if (!user) return null;

    const defaultWorkspace = await getOrCreateWorkspaceForUser(user.id);

    const cookieStore = cookies();
    const activeWorkspaceId = cookieStore.get(
        ACTIVE_WORKSPACE_COOKIE
    )?.value;

    if (!activeWorkspaceId) return defaultWorkspace;

    const membership = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: activeWorkspaceId,
                userId: user.id,
            },
        },
        include: { workspace: true },
    });

    if (!membership) return defaultWorkspace;

    return {
        userId: user.id,
        workspaceId: membership.workspaceId,
        role: membership.role,
        workspace: membership.workspace,
    };
}

// Lista los espacios a los que pertenece el usuario.
export async function listWorkspacesForUser(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
        where: { userId },
        include: {
            workspace: {
                select: { id: true, name: true },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    return memberships.map((membership) => ({
        id: membership.workspace.id,
        name: membership.workspace.name,
        role: membership.role,
    }));
}

// Crea un espacio y asigna al creador como OWNER.
export async function createWorkspace(userId: string, name: string) {
    const normalizedName = name.trim();

    if (normalizedName.length < 2 || normalizedName.length > 80) {
        throw new WorkspaceServiceError(
            "El nombre debe tener entre 2 y 80 caracteres"
        );
    }

    const workspace = await prisma.workspace.create({
        data: {
            name: normalizedName,
            members: {
                create: {
                    userId,
                    role: "OWNER",
                },
            },
        },
        select: { id: true, name: true },
    });

    return { ...workspace, role: "OWNER" as const };
}

// Cambia el nombre del espacio. Solo OWNER y ADMIN pueden hacerlo.
export async function renameWorkspace(
    userId: string,
    workspaceId: string,
    name: string
) {
    const normalizedName = name.trim();

    if (!workspaceId) {
        throw new WorkspaceServiceError("Falta el ID del espacio");
    }

    if (normalizedName.length < 2 || normalizedName.length > 80) {
        throw new WorkspaceServiceError(
            "El nombre debe tener entre 2 y 80 caracteres"
        );
    }

    const membership = await getWorkspaceMembership(userId, workspaceId);

    if (!membership) {
        throw new WorkspaceServiceError(
            "No tenés acceso a este espacio",
            403
        );
    }

    if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
        throw new WorkspaceServiceError(
            "No tenés permisos para editar este espacio",
            403
        );
    }

    const workspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: { name: normalizedName },
        select: { id: true, name: true },
    });

    return { ...workspace, role: membership.role };
}

// Elimina espacios vacíos para evitar borrar movimientos o configuraciones.
export async function deleteWorkspace(
    userId: string,
    workspaceId: string
) {
    if (!workspaceId) {
        throw new WorkspaceServiceError("Falta el ID del espacio");
    }

    const membership = await getWorkspaceMembership(userId, workspaceId);

    if (!membership) {
        throw new WorkspaceServiceError(
            "No tenés acceso a este espacio",
            403
        );
    }

    if (membership.role !== "OWNER") {
        throw new WorkspaceServiceError(
            "Solo el propietario puede eliminar el espacio",
            403
        );
    }

    const membershipsCount = await prisma.workspaceMember.count({
        where: { userId },
    });

    if (membershipsCount <= 1) {
        throw new WorkspaceServiceError(
            "No podés eliminar tu único espacio de trabajo"
        );
    }

    const otherMembersCount = await prisma.workspaceMember.count({
        where: {
            workspaceId,
            userId: { not: userId },
        },
    });

    if (otherMembersCount > 0) {
        throw new WorkspaceServiceError(
            "No podés eliminar un espacio que tiene otros miembros"
        );
    }

    const [
        movements,
        expenseTypes,
        paymentMethods,
        recurringExpenses,
        invitations,
    ] = await Promise.all([
        prisma.movement.count({ where: { workspaceId } }),
        prisma.expenseType.count({ where: { workspaceId } }),
        prisma.paymentMethod.count({ where: { workspaceId } }),
        prisma.recurringExpense.count({ where: { workspaceId } }),
        prisma.workspaceInvitation.count({ where: { workspaceId } }),
    ]);

    if (
        movements > 0 ||
        expenseTypes > 0 ||
        paymentMethods > 0 ||
        recurringExpenses > 0 ||
        invitations > 0
    ) {
        throw new WorkspaceServiceError(
            "Solo podés eliminar espacios vacíos. Este espacio todavía tiene datos o configuraciones."
        );
    }

    await prisma.workspace.delete({
        where: { id: workspaceId },
    });

    return { success: true };
}
