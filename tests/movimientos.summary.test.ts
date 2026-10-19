import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    workspaceFindUnique: vi.fn(),
    movementFindMany: vi.fn(),
}));

vi.mock("@/prisma/prisma", () => ({
    prisma: {
        workspace: {
            findUnique: mocks.workspaceFindUnique,
        },
        movement: {
            findMany: mocks.movementFindMany,
        },
    },
}));

import { MovimientosService } from "@/server/services/movimientos.service";

describe("MovimientosService.fetchSummary", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        mocks.workspaceFindUnique.mockResolvedValue({
            titheEnabled: false,
            tithePercentage: 10,
            titheBase: "NET_INCOME",
        });

        mocks.movementFindMany.mockResolvedValue([]);
    });

    it("calcula los egresos y el balance", async () => {
        mocks.movementFindMany.mockResolvedValue([
            {
                type: "INGRESO",
                amount: 10000,
                date: new Date("2026-10-18T12:00:00Z"),
                income: {
                    investmentPercentage: 50,
                    payments: [
                        {
                            commissionAmount: 0,
                            netAmount: 10000,
                        },
                    ],
                },
            },
            {
                type: "EGRESO",
                amount: 2500,
                date: new Date("2026-10-18T15:00:00Z"),
                income: null,
            },
        ]);

        const result = await MovimientosService.fetchSummary(
            "workspace-A",
            "month",
        );

        expect(result.totals).toMatchObject({
            income: 10000,
            expenses: 2500,
            balance: 7500,
        });

        expect(mocks.movementFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    workspaceId: "workspace-A",
                    date: expect.objectContaining({
                        gte: expect.any(Date),
                        lte: expect.any(Date),
                    }),
                }),
            }),
        );
    });

    it("incluye los egresos en el desglose del día", async () => {
        mocks.movementFindMany.mockResolvedValue([
            {
                type: "EGRESO",
                amount: 1250,
                date: new Date("2026-10-18T15:00:00Z"),
                income: null,
            },
        ]);

        const result = await MovimientosService.fetchSummary(
            "workspace-A",
            "month",
        );

        const day = result.breakdown.find(
            (item: { date: string }) => item.date === "2026-10-18",
        );

        expect(day).toBeDefined();
        expect(day?.totalExpenses).toBe(1250);
        expect(day?.netDaily).toBe(-1250);
        expect(result.totals.expenses).toBe(1250);
        expect(result.totals.balance).toBe(-1250);
    });

    it("devuelve totales en cero cuando no hay movimientos", async () => {
        const result = await MovimientosService.fetchSummary(
            "workspace-A",
            "month",
        );

        expect(result.totals).toMatchObject({
            income: 0,
            expenses: 0,
            balance: 0,
            commissions: 0,
            netIncome: 0,
            investment: 0,
            tithe: 0,
            available: 0,
        });

        expect(result.breakdown).toEqual([]);
    });

    it.each(["day", "week", "month", "year"] as const)(
        "acepta el período %s",
        async (period) => {
            const result = await MovimientosService.fetchSummary(
                "workspace-A",
                period,
            );

            expect(result.period).toBe(period);
            expect(mocks.movementFindMany).toHaveBeenCalledOnce();
        },
    );

    it("consulta la configuración del workspace solicitado", async () => {
        await MovimientosService.fetchSummary(
            "workspace-B",
            "month",
        );

        expect(mocks.workspaceFindUnique).toHaveBeenCalledWith({
            where: {
                id: "workspace-B",
            },
            select: {
                titheEnabled: true,
                tithePercentage: true,
                titheBase: true,
            },
        });

        expect(mocks.movementFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    workspaceId: "workspace-B",
                }),
            }),
        );
    });
});
