import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  paymentMethodFindFirst: vi.fn(),
  expenseTypeFindFirst: vi.fn(),
  movementCreate: vi.fn(),
  movementFindFirst: vi.fn(),
  movementUpdateMany: vi.fn(),
  movementFindUnique: vi.fn(),
  movementDeleteMany: vi.fn(),
  incomeCreate: vi.fn(),
  incomeUpdate: vi.fn(),
  incomePaymentDeleteMany: vi.fn(),
  incomePaymentCreateMany: vi.fn(),
  expenseCreate: vi.fn(),
  expenseUpdate: vi.fn(),
}));

vi.mock("@/prisma/prisma", () => ({
  prisma: { $transaction: mocks.transaction },
}));

import { MovimientosService } from "@/server/services/movimientos.service";
import type { MovementInput } from "@/shared/types";

function createIncome(overrides: Record<string, unknown> = {}): MovementInput {
  return {
    type: "INGRESO",
    date: "2026-10-18",
    description: "Test",
    investmentPercentage: 50,
    payments: [],
    ...overrides,
  } as unknown as MovementInput;
}

function createExpense(overrides: Record<string, unknown> = {}): MovementInput {
  return {
    type: "EGRESO",
    date: "2026-10-18",
    description: "Gasto de prueba",
    amount: 500,
    paymentMethodId: "cash",
    expenseTypeId: "food",
    ...overrides,
  } as unknown as MovementInput;
}

function configureTransaction() {
  mocks.transaction.mockImplementation(async (callback: (tx: any) => unknown) =>
    callback({
      paymentMethod: { findFirst: mocks.paymentMethodFindFirst },
      expenseType: { findFirst: mocks.expenseTypeFindFirst },
      movement: {
        findFirst: mocks.movementFindFirst,
        create: mocks.movementCreate,
        updateMany: mocks.movementUpdateMany,
        findUnique: mocks.movementFindUnique,
        deleteMany: mocks.movementDeleteMany,
      },
      income: { create: mocks.incomeCreate, update: mocks.incomeUpdate },
      incomePayment: {
        deleteMany: mocks.incomePaymentDeleteMany,
        createMany: mocks.incomePaymentCreateMany,
      },
      expense: { create: mocks.expenseCreate, update: mocks.expenseUpdate },
    })
  );
}

describe("MovimientosService.deleteMovement", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configureTransaction();
  });

  it("rechaza eliminar un movimiento inexistente", async () => {
    mocks.movementFindFirst.mockResolvedValue(null);
    await expect(MovimientosService.deleteMovement(
      "workspace-test", "missing"
    )).rejects.toThrow("VALIDATION: Movimiento no encontrado");
    expect(mocks.movementDeleteMany).not.toHaveBeenCalled();
  });

  it("elimina el movimiento filtrando por ID y espacio", async () => {
    mocks.movementFindFirst.mockResolvedValue({
      id: "movement-test", workspaceId: "workspace-test",
    });
    mocks.movementDeleteMany.mockResolvedValue({ count: 1 });

    const result = await MovimientosService.deleteMovement(
      "workspace-test", "movement-test"
    );

    expect(result).toEqual({ id: "movement-test" });
    expect(mocks.movementFindFirst).toHaveBeenCalledWith({
      where: {
        id: "movement-test",
        workspaceId: "workspace-test"
      },
      select: {
        id: true,
      },
    });
    expect(mocks.movementDeleteMany).toHaveBeenCalledWith({
      where: { id: "movement-test", workspaceId: "workspace-test" },
    });
  });

  it("rechaza si no se elimina exactamente un movimiento", async () => {
    mocks.movementFindFirst.mockResolvedValue({
      id: "movement-test", workspaceId: "workspace-test",
    });
    mocks.movementDeleteMany.mockResolvedValue({ count: 0 });

    await expect(MovimientosService.deleteMovement(
      "workspace-test", "movement-test"
    )).rejects.toThrow("VALIDATION:");
  });
});
