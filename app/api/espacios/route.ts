
import { NextResponse } from "next/server";
import {
    createWorkspace,
    deleteWorkspace,
    getAuthenticatedWorkspaceUser,
    getCurrentWorkspace,
    listWorkspacesForUser,
    renameWorkspace,
    WorkspaceServiceError,
    DEMO_EMAIL,
} from "@/server/services/workspace.service";

function handleError(error: unknown, fallback: string) {
    if (error instanceof WorkspaceServiceError) {
        return NextResponse.json(
            { error: error.message },
            { status: error.status }
        );
    }

    console.error(fallback, error);

    return NextResponse.json(
        { error: fallback },
        { status: 500 }
    );
}

async function ensureCanManageWorkspaces() {
    const user = await getAuthenticatedWorkspaceUser();

    if (user.email === DEMO_EMAIL) {
        throw new WorkspaceServiceError(
            "La cuenta demo no puede administrar espacios",
            403
        );
    }

    return user;
}

// GET /api/espacios
export async function GET() {
    try {
        const user = await getAuthenticatedWorkspaceUser();
        const current = await getCurrentWorkspace();
        const workspaces = await listWorkspacesForUser(user.id);

        return NextResponse.json({
            activeWorkspaceId: current?.workspaceId ?? null,
            workspaces,
        });
    } catch (error) {
        return handleError(error, "No se pudieron cargar los espacios");
    }
}

// POST /api/espacios
export async function POST(request: Request) {
    try {
        const user = await ensureCanManageWorkspaces();

        let body: { name?: unknown };

        try {
            body = await request.json();
        } catch {
            throw new WorkspaceServiceError("El cuerpo JSON no es válido");
        }

        if (typeof body.name !== "string") {
            throw new WorkspaceServiceError("Ingresá un nombre válido");
        }

        const workspace = await createWorkspace(user.id, body.name);

        return NextResponse.json({ workspace }, { status: 201 });
    } catch (error) {
        return handleError(error, "No se pudo crear el espacio");
    }
}

// PATCH /api/espacios
export async function PATCH(request: Request) {
    try {
        const user = await ensureCanManageWorkspaces();

        let body: { id?: unknown; name?: unknown };

        try {
            body = await request.json();
        } catch {
            throw new WorkspaceServiceError("El cuerpo JSON no es válido");
        }

        if (
            typeof body.id !== "string" ||
            typeof body.name !== "string"
        ) {
            throw new WorkspaceServiceError(
                "El ID y el nombre del espacio son obligatorios"
            );
        }

        const workspace = await renameWorkspace(
            user.id,
            body.id,
            body.name
        );

        return NextResponse.json({ workspace });
    } catch (error) {
        return handleError(error, "No se pudo actualizar el espacio");
    }
}

// DELETE /api/espacios?id=ID
export async function DELETE(request: Request) {
    try {
        const user = await ensureCanManageWorkspaces();
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get("id");

        if (!workspaceId) {
            throw new WorkspaceServiceError(
                "Falta el ID del espacio"
            );
        }

        await deleteWorkspace(user.id, workspaceId);

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleError(error, "No se pudo eliminar el espacio");
    }
}
