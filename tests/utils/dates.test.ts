import { afterEach, describe, expect, it, vi } from "vitest";

import {
    ARGENTINA_OFFSET,
    ARGENTINA_TIMEZONE,
    getArgentinaDateString,
    getArgentinaNow,
    getArgentinaStartOfDay,
    parseMovementDate,
} from "@/shared/utils/dates";

describe("Argentina date utilities", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    describe("constants", () => {
        it("usa la zona horaria y el offset de Argentina", () => {
            expect(ARGENTINA_TIMEZONE).toBe("America/Argentina/Buenos_Aires");
            expect(ARGENTINA_OFFSET).toBe("-03:00");
        });
    });

    describe("parseMovementDate", () => {
        it("convierte una fecha al inicio del día en Argentina", () => {
            const result = parseMovementDate("2026-10-19");

            expect(result.toISOString()).toBe("2026-10-19T03:00:00.000Z");
        });

        it.each([
            "",
            "19-10-2026",
            "2026/10/19",
            "2026-1-09",
            "2026-10-9",
            "2026-10-19T00:00:00",
            "abc",
        ])("rechaza el formato inválido %s", (dateString) => {
            expect(() => parseMovementDate(dateString)).toThrow(
                "VALIDATION: Fecha inválida",
            );
        });

        it.each([
            "2026-02-30",
            "2026-13-01",
            "2026-00-10",
            "2026-10-32",
        ])("rechaza una fecha inexistente: %s", (dateString) => {
            // Nota: el código actual valida el formato, pero JavaScript
            // normaliza algunas fechas inexistentes automáticamente.
            // Este test documenta el comportamiento esperado.
            expect(() => parseMovementDate(dateString)).toThrow(
                "VALIDATION: Fecha inválida",
            );
        });
    });

    describe("getArgentinaNow", () => {
        it("devuelve la fecha y hora actuales", () => {
            const fixedDate = new Date("2026-10-19T15:30:00.000Z");
            vi.useFakeTimers();
            vi.setSystemTime(fixedDate);

            expect(getArgentinaNow().toISOString()).toBe(
                "2026-10-19T15:30:00.000Z",
            );
        });
    });

    describe("getArgentinaDateString", () => {
        it("devuelve la fecha actual en formato YYYY-MM-DD", () => {
            const fixedDate = new Date("2026-10-19T15:30:00.000Z");
            vi.useFakeTimers();
            vi.setSystemTime(fixedDate);

            expect(getArgentinaDateString()).toBe("2026-10-19");
        });

        it("usa el día argentino aunque UTC ya esté en el día siguiente", () => {
            const date = new Date("2026-10-20T01:00:00.000Z");

            expect(getArgentinaDateString(date)).toBe("2026-10-19");
        });

        it("acepta una fecha específica", () => {
            expect(
                getArgentinaDateString(
                    new Date("2026-05-15T15:00:00.000Z"),
                ),
            ).toBe("2026-05-15");
        });
    });

    describe("getArgentinaStartOfDay", () => {
        it("devuelve la medianoche argentina", () => {
            const date = new Date("2026-10-19T15:30:00.000Z");
            const result = getArgentinaStartOfDay(date);

            expect(result.toISOString()).toBe("2026-10-19T03:00:00.000Z");
            expect(getArgentinaDateString(result)).toBe("2026-10-19");
        });

        it("usa la fecha actual si no se pasa un argumento", () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date("2026-10-19T15:30:00.000Z"));

            expect(getArgentinaStartOfDay().toISOString()).toBe(
                "2026-10-19T03:00:00.000Z",
            );
        });

        it("maneja el cambio de día según Argentina", () => {
            const date = new Date("2026-10-20T01:00:00.000Z");
            const result = getArgentinaStartOfDay(date);

            expect(result.toISOString()).toBe("2026-10-19T03:00:00.000Z");
        });
    });
});
