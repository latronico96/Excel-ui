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

describe("MovimientosService.updateMovement", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configureTransaction();
  });

  it("rechaza actualizar un movimiento inexistente", async () => {
    mocks.movementFindFirst.mockResolvedValue(null);
    await expect(MovimientosService.updateMovement(
      "workspace-test", "user-test", "missing",
      createIncome({ payments: [{ paymentMethodId: "cash", amount: 100 }] })
    )).rejects.toThrow("VALIDATION: Movimiento no encontrado");
    expect(mocks.movementUpdateMany).not.toHaveBeenCalled();
  });

  it("rechaza cambiar el tipo de un movimiento", async () => {
    mocks.movementFindFirst.mockResolvedValue({
      id: "movement-test", type: "EGRESO",
      income: null, expense: { movementId: "movement-test" },
    });
    await expect(MovimientosService.updateMovement(
      "workspace-test", "user-test", "movement-test",
      createIncome({ payments: [{ paymentMethodId: "cash", amount: 100 }] })
    )).rejects.toThrow("VALIDATION: No se puede cambiar el tipo de movimiento");
    expect(mocks.movementUpdateMany).not.toHaveBeenCalled();
  });

  it("actualiza un ingreso y recalcula la comisión", async () => {
    mocks.movementFindFirst.mockResolvedValue({
      id: "movement-test", type: "INGRESO",
      income: { movementId: "movement-test" }, expense: null,
    });
    mocks.paymentMethodFindFirst.mockResolvedValue({
      id: "cash", defaultCommissionPercentage: 23,
    });
    mocks.movementUpdateMany.mockResolvedValue({ count: 1 });
    mocks.incomeUpdate.mockResolvedValue({});
    mocks.incomePaymentDeleteMany.mockResolvedValue({ count: 1 });
    mocks.incomePaymentCreateMany.mockResolvedValue({ count: 1 });
    mocks.movementFindUnique.mockResolvedValue({ id: "movement-test", type: "INGRESO" });

    const result = await MovimientosService.updateMovement(
      "workspace-test", "user-test", "movement-test",
      createIncome({
        description: "Ingreso actualizado", investmentPercentage: 40,
        payments: [{ paymentMethodId: "cash", amount: 10000 }],
      })
    );

    expect(result).toEqual({ id: "movement-test", type: "INGRESO" });
    expect(mocks.movementUpdateMany).toHaveBeenCalledWith({
      where: { id: "movement-test", workspaceId: "workspace-test" },
      data: expect.objectContaining({
        amount: 10000, description: "Ingreso actualizado", updatedById: "user-test",
      }),
    });
    expect(mocks.incomeUpdate).toHaveBeenCalledWith({
      where: { movementId: "movement-test" }, data: { investmentPercentage: 40 },
    });
    expect(mocks.incomePaymentDeleteMany).toHaveBeenCalledWith({
      where: { incomeId: "movement-test" },
    });
    expect(mocks.incomePaymentCreateMany).toHaveBeenCalledWith({
      data: [{
        incomeId: "movement-test", paymentMethodId: "cash", amount: 10000,
        commissionPercentage: 23, commissionAmount: 2300, netAmount: 7700,
      }],
    });
  });

  it("rechaza pagos duplicados", async () => {
    mocks.movementFindFirst.mockResolvedValue({
      id: "movement-test", type: "INGRESO",
      income: { movementId: "movement-test" }, expense: null,
    });
    await expect(MovimientosService.updateMovement(
      "workspace-test", "user-test", "movement-test",
      createIncome({ payments: [
        { paymentMethodId: "cash", amount: 100 },
        { paymentMethodId: "cash", amount: 200 },
      ] })
    )).rejects.toThrow("VALIDATION:");
    expect(mocks.movementUpdateMany).not.toHaveBeenCalled();
    expect(mocks.incomePaymentDeleteMany).not.toHaveBeenCalled();
  });

  // Regression test: con la implementación actual este caso podría fallar
  // porque filtra importes <= 0 antes de validar todos los pagos.
  it("rechaza un pago negativo aunque haya otro pago válido", async () => {
    mocks.movementFindFirst.mockResolvedValue({
      id: "movement-test", type: "INGRESO",
      income: { movementId: "movement-test" }, expense: null,
    });
    await expect(MovimientosService.updateMovement(
      "workspace-test", "user-test", "movement-test",
      createIncome({ payments: [
        { paymentMethodId: "cash", amount: 100 },
        { paymentMethodId: "card", amount: -10 },
      ] })
    )).rejects.toThrow("VALIDATION:");
    expect(mocks.movementUpdateMany).not.toHaveBeenCalled();
    expect(mocks.incomePaymentDeleteMany).not.toHaveBeenCalled();
  });

  it("actualiza un egreso con medio de pago y tipo validados", async () => {
    mocks.movementFindFirst.mockResolvedValue({
      id: "movement-test", type: "EGRESO",
      income: null, expense: { movementId: "movement-test" },
    });
    mocks.paymentMethodFindFirst.mockResolvedValue({ id: "cash" });
    mocks.expenseTypeFindFirst.mockResolvedValue({ id: "food" });
    mocks.movementUpdateMany.mockResolvedValue({ count: 1 });
    mocks.expenseUpdate.mockResolvedValue({});
    mocks.movementFindUnique.mockResolvedValue({ id: "movement-test", type: "EGRESO" });

    const result = await MovimientosService.updateMovement(
      "workspace-test", "user-test", "movement-test",
      createExpense({ amount: 750, description: "Compra actualizada" })
    );

    expect(result).toEqual({ id: "movement-test", type: "EGRESO" });
    expect(mocks.movementUpdateMany).toHaveBeenCalledWith({
      where: { id: "movement-test", workspaceId: "workspace-test" },
      data: expect.objectContaining({
        amount: 750, description: "Compra actualizada", updatedById: "user-test",
      }),
    });
    expect(mocks.expenseUpdate).toHaveBeenCalledWith({
      where: { movementId: "movement-test" },
      data: { paymentMethodId: "cash", expenseTypeId: "food" },
    });
  });
});
