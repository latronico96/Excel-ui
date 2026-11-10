
import { describe, expect, it } from "vitest";
import {
    calculateCommission,
    calculateInvestment,
    calculateTithe,
    calculateAvailable,
} from "../server/utils/finance";

describe("Cálculos financieros", () => {
    it("calcula una comisión del 23%", () => {
        expect(calculateCommission(10000, 23)).toEqual({
            commissionAmount: 2300,
            netAmount: 7700,
        });
    });

    it("calcula correctamente una comisión con centavos", () => {
        expect(calculateCommission(1000, 2.5)).toEqual({
            commissionAmount: 25,
            netAmount: 975,
        });
    });

    it("permite invertir el 0% o el 100%", () => {
        expect(calculateInvestment(1000, 0)).toBe(0);
        expect(calculateInvestment(1000, 100)).toBe(1000);
    });

    it("calcula la inversión predeterminada del 50%", () => {
        expect(calculateInvestment(7700, 50)).toBe(3850);
    });

    it("calcula el diezmo sobre el ingreso neto", () => {
        expect(
            calculateTithe(7700, 3850, 10, "NET_INCOME", true)
        ).toBe(770);
    });

    it("calcula el diezmo después de la inversión", () => {
        expect(
            calculateTithe(
                7700, 3850, 10, "AFTER_INVESTMENT", true
            )
        ).toBe(385);
    });

    it("no calcula diezmo si está desactivado", () => {
        expect(
            calculateTithe(7700, 3850, 10, "NET_INCOME", false)
        ).toBe(0);
    });

    it("calcula el disponible después de inversión y diezmo", () => {
        expect(calculateAvailable(7700, 3850, 385)).toBe(3465);
    });

    it("rechaza porcentajes fuera del rango permitido", () => {
        expect(() => calculateInvestment(1000, -1)).toThrow();
        expect(() => calculateInvestment(1000, 101)).toThrow();
        expect(() => calculateCommission(1000, 101)).toThrow();
    });
});
