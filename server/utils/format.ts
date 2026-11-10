import { getArgentinaDateString } from "@/shared/utils/dates";

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(amount);
};

export const formatDate = (date: string) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    const argentinaDate = getArgentinaDateString(parsed);

    const [year, month, day] = argentinaDate.split("-");

    return `${day}/${month}/${year}`;
};