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

describe("MovimientosService.saveMovement", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configureTransaction();
  });

  it("rechaza porcentajes de inversión fuera del rango 0–100", async () => {
    for (const investmentPercentage of [-1, 101]) {
      await expect(MovimientosService.saveMovement(
        "workspace-test", "user-test", createIncome({ investmentPercentage })
      )).rejects.toThrow("VALIDATION:");
    }
    expect(mocks.movementCreate).not.toHaveBeenCalled();
  });

  it("rechaza ingresos sin pagos o con una lista inválida", async () => {
    for (const payments of [[], null]) {
      await expect(MovimientosService.saveMovement(
        "workspace-test", "user-test", createIncome({ payments })
      )).rejects.toThrow("VALIDATION:");
    }
    expect(mocks.movementCreate).not.toHaveBeenCalled();
  });

  it("rechaza medios de pago duplicados", async () => {
    await expect(MovimientosService.saveMovement(
      "workspace-test", "user-test",
      createIncome({ payments: [
        { paymentMethodId: "cash", amount: 100 },
        { paymentMethodId: "cash", amount: 200 },
      ] })
    )).rejects.toThrow("VALIDATION:");
    expect(mocks.paymentMethodFindFirst).not.toHaveBeenCalled();
  });

  it("guarda un ingreso y calcula la comisión correctamente", async () => {
    mocks.paymentMethodFindFirst.mockResolvedValue({
      id: "cash", defaultCommissionPercentage: 23,
    });
    mocks.movementCreate.mockResolvedValue({ id: "movement-test" });
    mocks.incomeCreate.mockResolvedValue({ movementId: "movement-test" });

    const result = await MovimientosService.saveMovement(
      "workspace-test", "user-test",
      createIncome({ payments: [{ paymentMethodId: "cash", amount: 10000 }] })
    );

    expect(result).toEqual({ id: "movement-test" });
    expect(mocks.paymentMethodFindFirst).toHaveBeenCalledWith({
      where: { id: "cash", workspaceId: "workspace-test", active: true },
    });
    expect(mocks.movementCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workspaceId: "workspace-test", createdById: "user-test",
        type: "INGRESO", amount: 10000,
      }),
    });
    expect(mocks.incomeCreate).toHaveBeenCalledWith({
      data: {
        movementId: "movement-test",
        investmentPercentage: 50,
        payments: { create: [{
          paymentMethodId: "cash", amount: 10000,
          commissionPercentage: 23, commissionAmount: 2300, netAmount: 7700,
        }] },
      },
    });
  });

  it("rechaza un medio de pago inexistente o de otro espacio", async () => {
    mocks.paymentMethodFindFirst.mockResolvedValue(null);
    await expect(MovimientosService.saveMovement(
      "workspace-test", "user-test",
      createIncome({ payments: [{ paymentMethodId: "foreign-method", amount: 100 }] })
    )).rejects.toThrow("VALIDATION: Medio de pago inválido");
    expect(mocks.movementCreate).not.toHaveBeenCalled();
  });

  it("rechaza un porcentaje de comisión inválido", async () => {
    mocks.paymentMethodFindFirst.mockResolvedValue({
      id: "cash", defaultCommissionPercentage: 23,
    });
    await expect(MovimientosService.saveMovement(
      "workspace-test", "user-test",
      createIncome({ payments: [{
        paymentMethodId: "cash", amount: 10000, commissionPercentage: 101,
      }] })
    )).rejects.toThrow("VALIDATION: Porcentaje de comisión inválido");
    expect(mocks.movementCreate).not.toHaveBeenCalled();
  });
});
