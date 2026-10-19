
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

describe("API /api/movimientos — seguridad", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getCurrentWorkspace.mockResolvedValue(null);
    });

    it("GET: devuelve 401 si no hay espacio autenticado", async () => {
        const response = await GET();

        expect(response.status).toBe(401);
        expect(mocks.fetchMovements).not.toHaveBeenCalled();
    });

    it("POST: devuelve 401 si no hay espacio autenticado", async () => {
        const request = new NextRequest(
            "http://localhost:8080/api/movimientos",
            {
                method: "POST",
                body: JSON.stringify({ description: "Prueba" }),
                headers: { "content-type": "application/json" },
            },
        );

        const response = await POST(request);

        expect(response.status).toBe(401);
        expect(mocks.saveMovement).not.toHaveBeenCalled();
    });

    it("PUT: devuelve 401 si no hay espacio autenticado", async () => {
        const request = new NextRequest(
            "http://localhost:8080/api/movimientos",
            {
                method: "PUT",
                body: JSON.stringify({ id: "movement-1" }),
                headers: { "content-type": "application/json" },
            },
        );

        const response = await PUT(request);

        expect(response.status).toBe(401);
        expect(mocks.updateMovement).not.toHaveBeenCalled();
    });

    it("DELETE: devuelve 401 si no hay espacio autenticado", async () => {
        const request = new NextRequest(
            "http://localhost:8080/api/movimientos?id=movement-1",
                { method: "DELETE" },
        );

        const response = await DELETE(request);

        expect(response.status).toBe(401);
        expect(mocks.deleteMovement).not.toHaveBeenCalled();
    });

    it("GET: usa el espacio actual para consultar movimientos", async () => {
        mocks.getCurrentWorkspace.mockResolvedValue({
            workspaceId: "workspace-A",
            userId: "user-A",
        });
        mocks.fetchMovements.mockResolvedValue([]);

        const response = await GET();

        expect(response.status).toBe(200);
        expect(mocks.fetchMovements).toHaveBeenCalledWith(
            "workspace-A",
        );
    });

    it("POST: usa el espacio y usuario actuales, no IDs del body", async () => {
        mocks.getCurrentWorkspace.mockResolvedValue({
            workspaceId: "workspace-A",
            userId: "user-A",
        });
        mocks.saveMovement.mockResolvedValue({ id: "movement-1" });

        const body = {
            workspaceId: "workspace-B",
            userId: "user-B",
            description: "Prueba",
        };

        const request = new NextRequest(
            "http://localhost:8080/api/movimientos",
            {
                method: "POST",
                body: JSON.stringify(body),
                headers: { "content-type": "application/json" },
            },
        );

        const response = await POST(request);

        expect(response.status).toBe(201);
        expect(mocks.saveMovement).toHaveBeenCalledWith(
            "workspace-A",
            "user-A",
            body,
        );
    });
});
