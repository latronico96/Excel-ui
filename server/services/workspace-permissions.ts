
import { getCurrentWorkspace } from "@/server/services/workspace.service";

export async function requireWorkspaceOwner() {
    const current = await getCurrentWorkspace();

    if (!current) {
        return {
            ok: false as const,
            status: 401,
            error: "No autenticado",
        };
    }

    if (current.role !== "OWNER") {
        return {
            ok: false as const,
            status: 403,
            error: "Solo el propietario puede administrar este espacio",
        };
    }

    return { ok: true as const, current };
}

export async function requireWorkspaceAdmin() {
    const current = await getCurrentWorkspace();

    if (!current) {
        return {
            ok: false as const,
            status: 401,
            error: "No autenticado",
        };
    }

    if (!["OWNER", "ADMIN"].includes(current.role)) {
        return {
            ok: false as const,
            status: 403,
            error: "No tenés permisos para administrar este espacio",
        };
    }

    return { ok: true as const, current };
}
