"use client";

import React from "react";

interface MoneyInputProps {
    id?: string;
    name?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

function formatMoney(value: string) {
    if (!value) return "";

    const [integerPart, decimalPart] = value.split(".");

    const digits = integerPart.replace(/\D/g, "");

    if (!digits) {
        return decimalPart !== undefined ? "0," : "";
    }

    const formattedInteger = new Intl.NumberFormat("es-AR").format(
        Number(digits)
    );

    if (decimalPart !== undefined) {
        const decimals = decimalPart
            .replace(/\D/g, "")
            .slice(0, 2);

        return `${formattedInteger},${decimals}`;
    }

    return formattedInteger;
}

export default function MoneyInput({
    id,
    name,
    value,
    onChange,
    placeholder = "0",
    disabled = false,
    required = false,
    className = "input",
    style,
}: MoneyInputProps) {
    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        let inputValue = event.target.value;

        // Eliminar los puntos de miles que ya pueda tener el input
        inputValue = inputValue.replace(/\./g, "");

        // La coma es nuestro separador decimal
        inputValue = inputValue.replace(",", ".");

        // Solo números y un punto decimal
        inputValue = inputValue.replace(/[^\d.]/g, "");

        // Evitar más de un decimal
        const parts = inputValue.split(".");

        if (parts.length > 2) {
            inputValue = `${parts[0]}.${parts.slice(1).join("")}`;
        }

        // Máximo 2 decimales
        if (inputValue.includes(".")) {
            const [integerPart, decimalPart] = inputValue.split(".");

            inputValue = `${integerPart}.${decimalPart.slice(0, 2)}`;
        }

        onChange(inputValue);
    };

    return (
        <input
            id={id}
            name={name}
            className={className}
            style={{
                textAlign: "right",
                ...style,
            }}
            type="text"
            inputMode="decimal"
            value={formatMoney(value)}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
        />
    );
}
