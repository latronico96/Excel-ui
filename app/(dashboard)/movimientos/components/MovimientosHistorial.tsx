"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Movement } from "@/shared/types";

interface MovimientosHistorialProps {
    movements: Movement[];
    loading: boolean;
}

export default function MovimientosHistorial({
    movements,
    loading,
}: MovimientosHistorialProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const formatDate = (date: string) => {
        const [year, month, day] = date.slice(0, 10).split("-");

        return `${day}/${month}/${year}`;
    };

    const formatMoney = (value: number) => {
        return value.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const toggleMovement = (id: string) => {
        setExpandedId((current) => {
            return current === id ? null : id;
        });
    };

    if (loading) {
        return (
            <div className="card">
                <h3>Historial de movimientos</h3>

                <div
                    style={{
                        padding: "2rem",
                        textAlign: "center",
                    }}
                >
                    Cargando movimientos...
                </div>
            </div>
        );
    }

    if (movements.length === 0) {
        return (
            <div className="card">
                <h3>Historial de movimientos</h3>

                <div
                    style={{
                        padding: "2rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                    }}
                >
                    No hay movimientos registrados.
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <h3>Historial de movimientos</h3>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                }}
            >
                {movements.map((movement) => {
                    const expanded = expandedId === movement.id;
                    const isIncome = movement.type === "INGRESO";

                    const totalCommission =
                        movement.payments?.reduce(
                            (total, payment) =>
                                total + payment.commissionAmount,
                            0
                        ) ?? 0;

                    const netIncome =
                        movement.payments?.reduce(
                            (total, payment) =>
                                total + payment.netAmount,
                            0
                        ) ?? movement.amount;

                    return (
                        <div
                            key={movement.id}
                            style={{
                                border: "1px solid var(--border, #ddd)",
                                borderRadius: "0.75rem",
                                overflow: "hidden",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    toggleMovement(movement.id)
                                }
                                style={{
                                    width: "100%",
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    padding: "0.9rem",
                                    display: "grid",
                                    gridTemplateColumns:
                                        "70px 1fr auto auto",
                                    gap: "0.75rem",
                                    alignItems: "center",
                                    textAlign: "left",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "0.85rem",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    {formatDate(movement.date)}
                                </span>

                                <span
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.2rem",
                                        minWidth: 0,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: 600,
                                        }}
                                    >
                                        <span
                                            style={{
                                                marginRight: "0.4rem",
                                            }}
                                        >
                                            {isIncome ? "↑" : "↓"}
                                        </span>

                                        {isIncome
                                            ? "Ingreso"
                                            : "Egreso"}
                                    </span>

                                    <span
                                        style={{
                                            fontSize: "0.85rem",
                                            color: "var(--text-muted)",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {movement.description ||
                                            "Sin descripción"}
                                    </span>

                                    {isIncome &&
                                        movement.payments &&
                                        movement.payments.length > 0 && (
                                            <span
                                                style={{
                                                    fontSize: "0.75rem",
                                                    color: "var(--text-muted)",
                                                    overflow: "hidden",
                                                    textOverflow:
                                                        "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {movement.payments
                                                    .map(
                                                        (payment) =>
                                                            `${payment.paymentMethodName} $${formatMoney(
                                                                payment.amount
                                                            )}`
                                                    )
                                                    .join(" · ")}
                                            </span>
                                        )}
                                </span>

                                <span
                                    style={{
                                        fontWeight: 600,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    ${formatMoney(movement.amount)}
                                </span>

                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    {expanded ? (
                                        <ChevronUp size={18} />
                                    ) : (
                                        <ChevronDown size={18} />
                                    )}
                                </span>
                            </button>

                            {expanded && (
                                <div
                                    style={{
                                        borderTop:
                                            "1px solid var(--border, #ddd)",
                                        padding: "1rem",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.75rem",
                                    }}
                                >
                                    <div>
                                        <strong>Fecha:</strong>{" "}
                                        {formatDate(movement.date)}
                                    </div>

                                    {movement.description && (
                                        <div>
                                            <strong>
                                                Descripción:
                                            </strong>{" "}
                                            {movement.description}
                                        </div>
                                    )}

                                    {movement.type === "EGRESO" && (
                                        <>
                                            {movement.expenseType && (
                                                <div>
                                                    <strong>
                                                        Tipo de gasto:
                                                    </strong>{" "}
                                                    {
                                                        movement
                                                            .expenseType
                                                            .name
                                                    }
                                                </div>
                                            )}

                                            {movement.paymentMethod && (
                                                <div>
                                                    <strong>
                                                        Medio de pago:
                                                    </strong>{" "}
                                                    {
                                                        movement
                                                            .paymentMethod
                                                            .name
                                                    }
                                                </div>
                                            )}

                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    paddingTop: "0.5rem",
                                                }}
                                            >
                                                <strong>Total</strong>

                                                <strong>
                                                    $
                                                    {formatMoney(
                                                        movement.amount
                                                    )}
                                                </strong>
                                            </div>
                                        </>
                                    )}

                                    {isIncome &&
                                        movement.payments &&
                                        movement.payments.length > 0 && (
                                            <>
                                                <div>
                                                    <strong>
                                                        Medios de pago
                                                    </strong>
                                                </div>

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection:
                                                            "column",
                                                        gap: "0.75rem",
                                                    }}
                                                >
                                                    {movement.payments.map(
                                                        (payment) => (
                                                            <div
                                                                key={`${movement.id}-${payment.paymentMethodId}`}
                                                                style={{
                                                                    padding: "0.75rem",
                                                                    border: "1px solid var(--border, #ddd)",
                                                                    borderRadius: "0.5rem",
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        justifyContent: "space-between",
                                                                        alignItems: "center",
                                                                        gap: "1rem",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    <span>{payment.paymentMethodName}</span>

                                                                    <span>
                                                                        ${formatMoney(payment.amount)}
                                                                    </span>
                                                                </div>

                                                                {payment.commissionPercentage > 0 && (
                                                                    <div
                                                                        style={{
                                                                            marginTop: "0.5rem",
                                                                            paddingTop: "0.5rem",
                                                                            borderTop: "1px solid var(--border, #eee)",
                                                                            display: "flex",
                                                                            flexDirection: "column",
                                                                            gap: "0.25rem",
                                                                            fontSize: "0.85rem",
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                display: "flex",
                                                                                justifyContent: "space-between",
                                                                                color: "var(--text-muted)",
                                                                            }}
                                                                        >
                                                                            <span>
                                                                                Comisión ({payment.commissionPercentage}%)
                                                                            </span>

                                                                            <span>
                                                                                -${formatMoney(payment.commissionAmount)}
                                                                            </span>
                                                                        </div>

                                                                        <div
                                                                            style={{
                                                                                display: "flex",
                                                                                justifyContent: "space-between",
                                                                            }}
                                                                        >
                                                                            <span>Neto</span>

                                                                            <strong>
                                                                                ${formatMoney(payment.netAmount)}
                                                                            </strong>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                <div
                                                    style={{
                                                        borderTop:
                                                            "1px solid var(--border, #ddd)",
                                                        paddingTop:
                                                            "0.75rem",
                                                        display:
                                                            "flex",
                                                        flexDirection:
                                                            "column",
                                                        gap: "0.4rem",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            justifyContent:
                                                                "space-between",
                                                        }}
                                                    >
                                                        <span>
                                                            Total bruto
                                                        </span>

                                                        <strong>
                                                            $
                                                            {formatMoney(
                                                                movement.amount
                                                            )}
                                                        </strong>
                                                    </div>

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            justifyContent:
                                                                "space-between",
                                                        }}
                                                    >
                                                        <span>
                                                            Comisiones
                                                        </span>

                                                        <strong>
                                                            -$
                                                            {formatMoney(
                                                                totalCommission
                                                            )}
                                                        </strong>
                                                    </div>

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            justifyContent:
                                                                "space-between",
                                                            fontSize:
                                                                "1.05rem",
                                                        }}
                                                    >
                                                        <strong>
                                                            Total neto
                                                        </strong>

                                                        <strong>
                                                            $
                                                            {formatMoney(
                                                                netIncome
                                                            )}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
