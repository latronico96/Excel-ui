import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
    getCurrentWorkspace: vi.fn(),
    fetchMovements: vi.fn(),
    saveMovement: vi.fn(),
    updateMovement: vi.fn(),
    deleteMovement: vi.fn(),
}));

vi.mock("@/server/services/workspace.service", () => ({
    getCurrentWorkspace: mocks.getCurrentWorkspace,
}));

vi.mock("@/server/services/movimientos.service", () => ({
    MovimientosService: {
        fetchMovements: mocks.fetchMovements,
        saveMovement: mocks.saveMovement,
        updateMovement: mocks.updateMovement,
        deleteMovement: mocks.deleteMovement,
    },
}));

import {
    GET,
    POST,
    PUT,
    DELETE,
} from "@/app/api/movimientos/route";

const workspaceA = {
    workspaceId: "workspace-A",
    userId: "user-A",
};

function jsonRequest(method: string, body: unknown) {
    return new NextRequest(
        "http://localhost:8080/api/movimientos",
        {
            method,
            body: JSON.stringify(body),
            headers: { "content-type": "application/json" },
        },
    );
}

describe("API /api/movimientos - seguridad", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        mocks.getCurrentWorkspace.mockResolvedValue(null);
    });

    describe("sin espacio autenticado", () => {
        it("GET devuelve 401 y no consulta movimientos", async () => {
            const response = await GET();

            expect(response.status).toBe(401);
            expect(mocks.fetchMovements).not.toHaveBeenCalled();
        });

        it("POST devuelve 401 y no guarda movimientos", async () => {
            const response = await POST(
                jsonRequest("POST", { description: "Prueba" }),
            );

            expect(response.status).toBe(401);
            expect(mocks.saveMovement).not.toHaveBeenCalled();
        });

        it("PUT devuelve 401 y no actualiza movimientos", async () => {
            const response = await PUT(
                jsonRequest("PUT", { id: "movement-1" }),
            );

            expect(response.status).toBe(401);
            expect(mocks.updateMovement).not.toHaveBeenCalled();
        });

        it("DELETE devuelve 401 y no elimina movimientos", async () => {
            const request = new NextRequest(
                "http://localhost:8080/api/movimientos?id=movement-1",
                { method: "DELETE" },
            );

            const response = await DELETE(request);

            expect(response.status).toBe(401);
            expect(mocks.deleteMovement).not.toHaveBeenCalled();
        });
    });

    describe("con espacio autenticado", () => {
        beforeEach(() => {
            mocks.getCurrentWorkspace.mockResolvedValue(workspaceA);
        });

        it("GET consulta solamente el espacio actual", async () => {
            mocks.fetchMovements.mockResolvedValue([]);

            const response = await GET();

            expect(response.status).toBe(200);
            expect(mocks.fetchMovements).toHaveBeenCalledOnce();
            expect(mocks.fetchMovements).toHaveBeenCalledWith(
                "workspace-A",
            );
        });

        it("POST usa el espacio y usuario autenticados", async () => {
            mocks.saveMovement.mockResolvedValue({
                id: "movement-1",
            });

            const body = {
                workspaceId: "workspace-B",
                userId: "user-B",
                description: "Prueba",
            };

            const response = await POST(
                jsonRequest("POST", body),
            );

            expect(response.status).toBe(201);
            expect(mocks.saveMovement).toHaveBeenCalledOnce();
            expect(mocks.saveMovement).toHaveBeenCalledWith(
                "workspace-A",
                "user-A",
                body,
            );
        });

        it("PUT usa el espacio actual aunque el body incluya otros IDs", async () => {
            mocks.updateMovement.mockResolvedValue({
                id: "movement-1",
            });

            const body = {
                id: "movement-1",
                workspaceId: "workspace-B",
                userId: "user-B",
                description: "Intento de modificación",
            };

            const response = await PUT(
                jsonRequest("PUT", body),
            );

            expect(response.status).toBe(200);
            expect(mocks.updateMovement).toHaveBeenCalledOnce();

            const [workspaceId, userId, movementId] =
                mocks.updateMovement.mock.calls[0];

            expect(workspaceId).toBe("workspace-A");
            expect(userId).toBe("user-A");
            expect(movementId).toBe("movement-1");
        });

        it("PUT devuelve 400 si falta el ID", async () => {
            const response = await PUT(
                jsonRequest("PUT", {
                    description: "Sin ID",
                }),
            );

            expect(response.status).toBe(400);
            expect(mocks.updateMovement).not.toHaveBeenCalled();
        });

        it("DELETE elimina usando el espacio actual y el ID solicitado", async () => {
            mocks.deleteMovement.mockResolvedValue({
                id: "movement-1",
            });

            const request = new NextRequest(
                "http://localhost:8080/api/movimientos?id=movement-1",
                { method: "DELETE" },
            );

            const response = await DELETE(request);

            expect(response.status).toBe(200);
            expect(mocks.deleteMovement).toHaveBeenCalledOnce();
            expect(mocks.deleteMovement).toHaveBeenCalledWith(
                "workspace-A",
                "movement-1",
            );
        });

        it("DELETE devuelve 400 si falta el ID", async () => {
            const request = new NextRequest(
                "http://localhost:8080/api/movimientos",
                { method: "DELETE" },
            );

            const response = await DELETE(request);

            expect(response.status).toBe(400);
            expect(mocks.deleteMovement).not.toHaveBeenCalled();
        });
    });
});
