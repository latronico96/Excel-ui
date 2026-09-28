"use client";

import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    Pencil,
    Trash2,
} from "lucide-react";
import { Movement } from "@/shared/types";

interface MovimientosHistorialProps {
    movements: Movement[];
    loading: boolean;
    onEdit: (movement: Movement) => void;
    onDelete: (movementId: string) => Promise<void>;
}

export default function MovimientosHistorial({
    movements,
    loading,
    onEdit,
    onDelete,
}: MovimientosHistorialProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

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

    const handleDelete = async (movement: Movement) => {
        const confirmed = window.confirm(
            `¿Eliminar este ${
                movement.type === "INGRESO" ? "ingreso" : "egreso"
            }?\n\n` +
                `$${formatMoney(movement.amount)}\n\n` +
                "Esta acción no se puede deshacer."
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(movement.id);
            await onDelete(movement.id);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="card">
                <h3 style={{ marginTop: 0 }}>
                    Historial de movimientos
                </h3>

                <div
                    style={{
                        padding: "1.5rem",
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
                <h3 style={{ marginTop: 0 }}>
                    Historial de movimientos
                </h3>

                <div
                    style={{
                        padding: "1.5rem",
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
            <h3 style={{ marginTop: 0 }}>
                Historial de movimientos
            </h3>

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
                    const isDeleting =
                        deletingId === movement.id;

                    const totalCommission =
                        movement.payments?.reduce(
                            (total, payment) =>
                                total +
                                payment.commissionAmount,
                            0
                        ) ?? 0;

                    const netIncome =
                        movement.payments?.reduce(
                            (total, payment) =>
                                total + payment.netAmount,
                            0
                        ) ?? movement.amount;

                    const investmentAmount =
                        isIncome &&
                        movement.investmentPercentage !==
                            undefined
                            ? netIncome *
                              (movement.investmentPercentage /
                                  100)
                            : 0;

                    return (
                        <div
                            key={movement.id}
                            style={{
                                border: "1px solid var(--border, #ddd)",
                                borderRadius: "0.75rem",
                                overflow: "hidden",
                            }}
                        >
                            {/* Movimiento principal */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "1fr auto auto auto",
                                    gap: "0.5rem",
                                    alignItems: "center",
                                    padding: "0.75rem",
                                }}
                            >
                                {/* Información */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        toggleMovement(
                                            movement.id
                                        )
                                    }
                                    style={{
                                        border: "none",
                                        background:
                                            "transparent",
                                        padding: 0,
                                        margin: 0,
                                        cursor: "pointer",
                                        textAlign: "left",
                                        minWidth: 0,
                                        display: "flex",
                                        flexDirection:
                                            "column",
                                        gap: "0.15rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems:
                                                "center",
                                            gap: "0.4rem",
                                            minWidth: 0,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize:
                                                    "0.8rem",
                                                color: "var(--text-muted)",
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {formatDate(
                                                movement.date
                                            )}
                                        </span>

                                        <span
                                            style={{
                                                fontWeight: 600,
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {isIncome
                                                ? "↑ Ingreso"
                                                : "↓ Egreso"}
                                        </span>
                                    </div>

                                    <span
                                        style={{
                                            fontSize:
                                                "0.85rem",
                                            color: "var(--text-muted)",
                                            overflow: "hidden",
                                            textOverflow:
                                                "ellipsis",
                                            whiteSpace:
                                                "nowrap",
                                            maxWidth: "100%",
                                        }}
                                    >
                                        {movement.description ||
                                            "Sin descripción"}
                                    </span>
                                </button>

                                {/* Monto */}
                                <span
                                    style={{
                                        fontWeight: 600,
                                        whiteSpace:
                                            "nowrap",
                                        fontSize:
                                            "0.95rem",
                                    }}
                                >
                                    $
                                    {formatMoney(
                                        movement.amount
                                    )}
                                </span>

                                {/* Editar */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        onEdit(movement)
                                    }
                                    aria-label="Editar movimiento"
                                    title="Editar"
                                    disabled={isDeleting}
                                    style={{
                                        width: "34px",
                                        height: "34px",
                                        border: "1px solid var(--border, #ddd)",
                                        borderRadius:
                                            "0.5rem",
                                        background:
                                            "var(--background, #fff)",
                                        color: "var(--text-muted)",
                                        cursor: isDeleting
                                            ? "not-allowed"
                                            : "pointer",
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        padding: 0,
                                        opacity: isDeleting
                                            ? 0.5
                                            : 1,
                                    }}
                                >
                                    <Pencil size={16} />
                                </button>

                                {/* Eliminar */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDelete(
                                            movement
                                        )
                                    }
                                    aria-label="Eliminar movimiento"
                                    title="Eliminar"
                                    disabled={isDeleting}
                                    style={{
                                        width: "34px",
                                        height: "34px",
                                        border: "1px solid #fecaca",
                                        borderRadius:
                                            "0.5rem",
                                        background:
                                            "#fff5f5",
                                        color: "#dc2626",
                                        cursor: isDeleting
                                            ? "not-allowed"
                                            : "pointer",
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        padding: 0,
                                        opacity: isDeleting
                                            ? 0.5
                                            : 1,
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>

                                {/* Expandir */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        toggleMovement(
                                            movement.id
                                        )
                                    }
                                    aria-label={
                                        expanded
                                            ? "Contraer movimiento"
                                            : "Expandir movimiento"
                                    }
                                    title={
                                        expanded
                                            ? "Contraer"
                                            : "Ver detalle"
                                    }
                                    style={{
                                        width: "30px",
                                        height: "34px",
                                        border: "none",
                                        background:
                                            "transparent",
                                        color: "var(--text-muted)",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        padding: 0,
                                    }}
                                >
                                    {expanded ? (
                                        <ChevronUp
                                            size={18}
                                        />
                                    ) : (
                                        <ChevronDown
                                            size={18}
                                        />
                                    )}
                                </button>
                            </div>

                            {/* Detalle */}
                            {expanded && (
                                <div
                                    style={{
                                        borderTop:
                                            "1px solid var(--border, #ddd)",
                                        padding: "0.85rem",
                                        display: "flex",
                                        flexDirection:
                                            "column",
                                        gap: "0.65rem",
                                    }}
                                >
                                    {/* Información general */}
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection:
                                                "column",
                                            gap: "0.35rem",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                gap: "1rem",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                Fecha
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    movement.date
                                                )}
                                            </strong>
                                        </div>

                                        {movement.description && (
                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    gap: "1rem",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        color: "var(--text-muted)",
                                                    }}
                                                >
                                                    Descripción
                                                </span>

                                                <span
                                                    style={{
                                                        textAlign:
                                                            "right",
                                                        overflowWrap:
                                                            "anywhere",
                                                    }}
                                                >
                                                    {
                                                        movement.description
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* EGRESO */}
                                    {!isIncome && (
                                        <>
                                            {(movement.expenseType ||
                                                movement.paymentMethod) && (
                                                <div
                                                    style={{
                                                        borderTop:
                                                            "1px solid var(--border, #eee)",
                                                        paddingTop:
                                                            "0.65rem",
                                                        display:
                                                            "flex",
                                                        flexDirection:
                                                            "column",
                                                        gap: "0.4rem",
                                                    }}
                                                >
                                                    {movement.expenseType && (
                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                justifyContent:
                                                                    "space-between",
                                                                gap: "1rem",
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    color: "var(--text-muted)",
                                                                }}
                                                            >
                                                                Tipo de gasto
                                                            </span>

                                                            <strong>
                                                                {
                                                                    movement
                                                                        .expenseType
                                                                        .name
                                                                }
                                                            </strong>
                                                        </div>
                                                    )}

                                                    {movement.paymentMethod && (
                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                justifyContent:
                                                                    "space-between",
                                                                gap: "1rem",
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    color: "var(--text-muted)",
                                                                }}
                                                            >
                                                                Medio de pago
                                                            </span>

                                                            <strong>
                                                                {
                                                                    movement
                                                                        .paymentMethod
                                                                        .name
                                                                }
                                                            </strong>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div
                                                style={{
                                                    borderTop:
                                                        "1px solid var(--border, #ddd)",
                                                    paddingTop:
                                                        "0.65rem",
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems:
                                                        "center",
                                                }}
                                            >
                                                <strong>
                                                    Total
                                                </strong>

                                                <strong>
                                                    $
                                                    {formatMoney(
                                                        movement.amount
                                                    )}
                                                </strong>
                                            </div>
                                        </>
                                    )}

                                    {/* INGRESO */}
                                    {isIncome && (
                                        <>
                                            {/* Inversión */}
                                            {movement.investmentPercentage !==
                                                undefined && (
                                                <div
                                                    style={{
                                                        borderTop:
                                                            "1px solid var(--border, #eee)",
                                                        paddingTop:
                                                            "0.65rem",
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
                                                            Inversión
                                                        </span>

                                                        <strong>
                                                            {
                                                                movement.investmentPercentage
                                                            }
                                                            %
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
                                                            Total inversión
                                                        </span>

                                                        <strong>
                                                            $
                                                            {formatMoney(
                                                                investmentAmount
                                                            )}
                                                        </strong>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Medios de pago */}
                                            {movement.payments &&
                                                movement.payments.length >
                                                    0 && (
                                                    <div
                                                        style={{
                                                            borderTop:
                                                                "1px solid var(--border, #ddd)",
                                                            paddingTop:
                                                                "0.65rem",
                                                            display:
                                                                "flex",
                                                            flexDirection:
                                                                "column",
                                                            gap: "0.6rem",
                                                        }}
                                                    >
                                                        <strong>
                                                            Medios de pago
                                                        </strong>

                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                flexDirection:
                                                                    "column",
                                                                gap: "0.55rem",
                                                            }}
                                                        >
                                                            {movement.payments.map(
                                                                (
                                                                    payment
                                                                ) => (
                                                                    <div
                                                                        key={`${movement.id}-${payment.paymentMethodId}`}
                                                                        style={{
                                                                            display:
                                                                                "flex",
                                                                            flexDirection:
                                                                                "column",
                                                                            gap: "0.15rem",
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                display:
                                                                                    "flex",
                                                                                justifyContent:
                                                                                    "space-between",
                                                                                alignItems:
                                                                                    "center",
                                                                                gap: "1rem",
                                                                            }}
                                                                        >
                                                                            <strong>
                                                                                {
                                                                                    payment.paymentMethodName
                                                                                }
                                                                            </strong>

                                                                            <strong>
                                                                                $
                                                                                {formatMoney(
                                                                                    payment.amount
                                                                                )}
                                                                            </strong>
                                                                        </div>

                                                                        {payment.commissionPercentage >
                                                                            0 && (
                                                                            <>
                                                                                <div
                                                                                    style={{
                                                                                        display:
                                                                                            "flex",
                                                                                        justifyContent:
                                                                                            "space-between",
                                                                                        paddingLeft:
                                                                                            "0.5rem",
                                                                                        fontSize:
                                                                                            "0.8rem",
                                                                                        color: "var(--text-muted)",
                                                                                    }}
                                                                                >
                                                                                    <span>
                                                                                        Comisión (
                                                                                        {
                                                                                            payment.commissionPercentage
                                                                                        }
                                                                                        %)
                                                                                    </span>

                                                                                    <span>
                                                                                        -$
                                                                                        {formatMoney(
                                                                                            payment.commissionAmount
                                                                                        )}
                                                                                    </span>
                                                                                </div>

                                                                                <div
                                                                                    style={{
                                                                                        display:
                                                                                            "flex",
                                                                                        justifyContent:
                                                                                            "space-between",
                                                                                        paddingLeft:
                                                                                            "0.5rem",
                                                                                        fontSize:
                                                                                            "0.8rem",
                                                                                    }}
                                                                                >
                                                                                    <span>
                                                                                        Neto
                                                                                    </span>

                                                                                    <strong>
                                                                                        $
                                                                                        {formatMoney(
                                                                                            payment.netAmount
                                                                                        )}
                                                                                    </strong>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Resumen */}
                                            <div
                                                style={{
                                                    borderTop:
                                                        "1px solid var(--border, #ddd)",
                                                    paddingTop:
                                                        "0.65rem",
                                                    display:
                                                        "flex",
                                                    flexDirection:
                                                        "column",
                                                    gap: "0.35rem",
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
                                                        Bruto
                                                    </span>

                                                    <span>
                                                        $
                                                        {formatMoney(
                                                            movement.amount
                                                        )}
                                                    </span>
                                                </div>

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        color: "var(--text-muted)",
                                                    }}
                                                >
                                                    <span>
                                                        Comisiones
                                                    </span>

                                                    <span>
                                                        -$
                                                        {formatMoney(
                                                            totalCommission
                                                        )}
                                                    </span>
                                                </div>

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        paddingTop:
                                                            "0.25rem",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    <span>
                                                        Neto
                                                    </span>

                                                    <span>
                                                        $
                                                        {formatMoney(
                                                            netIncome
                                                        )}
                                                    </span>
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