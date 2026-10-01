export const ARGENTINA_TIMEZONE = "America/Argentina/Buenos_Aires";
export const ARGENTINA_OFFSET = "-03:00";

export function parseMovementDate(dateString: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        throw new Error("VALIDATION: Fecha inválida");
    }

    const date = new Date(`${dateString}T00:00:00${ARGENTINA_OFFSET}`);

    if (Number.isNaN(date.getTime())) {
        throw new Error("VALIDATION: Fecha inválida");
    }

    return date;
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