export const ARGENTINA_TIMEZONE = "America/Argentina/Buenos_Aires";
export const ARGENTINA_OFFSET = "-03:00";

export function parseMovementDate(dateString: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        throw new Error("VALIDATION: Fecha inválida");
    }

    const [year, month, day] = dateString.split("-").map(Number);

    // Validar que la fecha exista realmente en el calendario.
    const validationDate = new Date(Date.UTC(year, month - 1, day));

    if (
        validationDate.getUTCFullYear() !== year ||
        validationDate.getUTCMonth() !== month - 1 ||
        validationDate.getUTCDate() !== day
    ) {
        throw new Error("VALIDATION: Fecha inválida");
    }

    return new Date(`${dateString}T00:00:00${ARGENTINA_OFFSET}`);
}

export function getArgentinaNow(): Date {
    return new Date();
}

export function getArgentinaDateString(date: Date = new Date()): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: ARGENTINA_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

export function getArgentinaStartOfDay(date: Date = new Date()): Date {
    const dateString = getArgentinaDateString(date);
    return new Date(`${dateString}T00:00:00-03:00`);
}
