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

        it("GET devuelve los ingresos con pagos y comisiones formateados", async () => {
            mocks.fetchMovements.mockResolvedValue([
                {
                    id: "income-1",
                    type: "INGRESO",
                    date: new Date("2026-10-19T03:00:00.000Z"),
                    amount: { toString: () => "10000" },
                    description: "Sueldo",
                    income: {
                        investmentPercentage: { toString: () => "50" },
                        payments: [
                            {
                                paymentMethodId: "payment-1",
                                paymentMethod: {
                                    name: "Transferencia",
                                },
                                amount: { toString: () => "10000" },
                                commissionPercentage: { toString: () => "0" },
                                commissionAmount: { toString: () => "0" },
                                netAmount: { toString: () => "10000" },
                            },
                        ],
                    },
                    expense: null,
                },
            ]);

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toHaveLength(1);
            expect(data[0]).toMatchObject({
                id: "income-1",
                type: "INGRESO",
                amount: 10000,
                description: "Sueldo",
                investmentPercentage: 50,
                payments: [
                    {
                        paymentMethodId: "payment-1",
                        paymentMethodName: "Transferencia",
                        amount: 10000,
                        commissionPercentage: 0,
                        commissionAmount: 0,
                        netAmount: 10000,
                    },
                ],
            });
        });

        it("GET devuelve los egresos con tipo de gasto y medio de pago", async () => {
            mocks.fetchMovements.mockResolvedValue([
                {
                    id: "expense-1",
                    type: "EGRESO",
                    date: new Date("2026-10-19T03:00:00.000Z"),
                    amount: { toString: () => "2500" },
                    description: "Supermercado",
                    income: null,
                    expense: {
                        expenseType: {
                            id: "type-1",
                            name: "Alimentos",
                        },
                        paymentMethod: {
                            id: "payment-1",
                            name: "Débito",
                        },
                    },
                },
            ]);

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toHaveLength(1);
            expect(data[0]).toMatchObject({
                id: "expense-1",
                type: "EGRESO",
                amount: 2500,
                description: "Supermercado",
                expenseType: {
                    id: "type-1",
                    name: "Alimentos",
                },
                paymentMethod: {
                    id: "payment-1",
                    name: "Débito",
                },
            });
        });

        it("GET devuelve el movimiento base si faltan sus detalles", async () => {
            mocks.fetchMovements.mockResolvedValue([
                {
                    id: "movement-1",
                    type: "INGRESO",
                    date: new Date("2026-10-19T03:00:00.000Z"),
                    amount: { toString: () => "5000" },
                    description: "Ingreso sin detalles",
                    income: null,
                    expense: null,
                },
            ]);

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data[0]).toEqual({
                id: "movement-1",
                type: "INGRESO",
                date: "2026-10-19T03:00:00.000Z",
                amount: 5000,
                description: "Ingreso sin detalles",
            });
        });

        it("GET devuelve 500 si falla la consulta", async () => {
            const consoleError = vi
                .spyOn(console, "error")
                .mockImplementation(() => { });

            try {
                mocks.fetchMovements.mockRejectedValue(
                    new Error("Database error"),
                );

                const response = await GET();
                const data = await response.json();

                expect(response.status).toBe(500);
                expect(data).toEqual({
                    error: "Error interno del servidor",
                });
            } finally {
                consoleError.mockRestore();
            }
        });

        it("POST devuelve 400 cuando saveMovement lanza un error de validación", async () => {
            mocks.saveMovement.mockRejectedValue(
                new Error("VALIDATION: Fecha inválida"),
            );

            const consoleError = vi
                .spyOn(console, "error")
                .mockImplementation(() => { });

            try {
                const response = await POST(
                    jsonRequest("POST", { description: "Prueba" }),
                );

                expect(response.status).toBe(400);
                expect(await response.json()).toEqual({
                    error: "Fecha inválida",
                });
            } finally {
                consoleError.mockRestore();
            }

        });

        it("POST devuelve 500 cuando ocurre un error inesperado", async () => {
            mocks.saveMovement.mockRejectedValue(new Error("Database error"));

            const consoleError = vi
                .spyOn(console, "error")
                .mockImplementation(() => { });

            try {
                const response = await POST(
                    jsonRequest("POST", { description: "Prueba" }),
                );

                expect(response.status).toBe(500);
                expect(await response.json()).toEqual({
                    error: "Error interno del servidor",
                });
            } finally {
                consoleError.mockRestore();
            }

        });

        it("PUT devuelve 400 cuando updateMovement lanza un error de validación", async () => {
            mocks.updateMovement.mockRejectedValue(
                new Error("VALIDATION: Importe inválido"),
            );

            const consoleError = vi
                .spyOn(console, "error")
                .mockImplementation(() => { });

            try {
                const response = await PUT(
                    jsonRequest("PUT", {
                        id: "movement-1",
                        amount: -100,
                    }),
                );

                expect(response.status).toBe(400);
                expect(await response.json()).toEqual({
                    error: "Importe inválido",
                });
            } finally {
                consoleError.mockRestore();
            }

        });

        it("PUT devuelve 500 cuando ocurre un error inesperado", async () => {
            mocks.updateMovement.mockRejectedValue(new Error("Database error"));

            const consoleError = vi
                .spyOn(console, "error")
                .mockImplementation(() => { });

            try {
                const response = await PUT(
                    jsonRequest("PUT", {
                        id: "movement-1",
                        description: "Prueba",
                    }),
                );

                expect(response.status).toBe(500);
                expect(await response.json()).toEqual({
                    error: "Error interno del servidor",
                });
            } finally {
                consoleError.mockRestore();
            }

        });

        it("DELETE devuelve 400 cuando deleteMovement lanza un error de validación", async () => {
            mocks.deleteMovement.mockRejectedValue(
                new Error("VALIDATION: Movimiento inválido"),
            );

            const consoleError = vi
                .spyOn(console, "error")
                .mockImplementation(() => { });

            try {
                const request = new NextRequest(
                    "http://localhost:8080/api/movimientos?id=movement-1",
                    { method: "DELETE" },
                );

                const response = await DELETE(request);

                expect(response.status).toBe(400);
                expect(await response.json()).toEqual({
                    error: "Movimiento inválido",
                });
            } finally {
                consoleError.mockRestore();
            }

        });

        it("DELETE devuelve 500 cuando ocurre un error inesperado", async () => {
            mocks.deleteMovement.mockRejectedValue(new Error("Database error"));
            const consoleError = vi
                .spyOn(console, "error")
                .mockImplementation(() => { });

            try {
                const request = new NextRequest(
                    "http://localhost:8080/api/movimientos?id=movement-1",
                    { method: "DELETE" },
                );

                const response = await DELETE(request);

                expect(response.status).toBe(500);
                expect(await response.json()).toEqual({
                    error: "Error interno del servidor",
                });
            } finally {
                consoleError.mockRestore();
            }

        });
    });
});
