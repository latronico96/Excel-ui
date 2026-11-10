"use client";

import {
    ChevronDown,
    ChevronUp,
    Pencil,
    Trash2,
} from "lucide-react";
import { Movement } from "@/shared/types";
import { MovementDisplayData } from "./MovimientosHistorial";

interface MovimientosMobileProps {
    movements: MovementDisplayData[];
    expandedId: string | null;
    deletingId: string | null;
    onToggle: (id: string) => void;
    onEdit: (movement: Movement) => void;
    onDelete: (movement: Movement) => Promise<void>;
    formatDate: (date: string) => string;
    formatMoney: (value: number) => string;
}

export default function MovimientosMobile({
    movements,
    expandedId,
    deletingId,
    onToggle,
    onEdit,
    onDelete,
    formatDate,
    formatMoney,
}: MovimientosMobileProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
            }}
        >
            {movements.map(
                ({
                    movement,
                    isIncome,
                    totalCommission,
                    netIncome,
                    investmentAmount,
                }) => {
                    const expanded =
                        expandedId === movement.id;

                    const isDeleting =
                        deletingId === movement.id;

                    return (
                        <div
                            key={movement.id}
                            style={{
                                border: "1px solid var(--border, #ddd)",
                                borderRadius: "0.8rem",
                                overflow: "hidden",
                            }}
                        >
                            {/* CABECERA DE LA CARD */}
                            <div
                                style={{
                                    padding: "0.85rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.65rem",
                                }}
                            >
                                {/* Fecha + tipo */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems: "center",
                                        gap: "0.75rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems:
                                                "center",
                                            gap: "0.45rem",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize:
                                                    "0.78rem",
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            {formatDate(
                                                movement.date
                                            )}
                                        </span>

                                        <span
                                            style={{
                                                fontSize:
                                                    "0.78rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {isIncome
                                                ? "↑ Ingreso"
                                                : "↓ Egreso"}
                                        </span>
                                    </div>

                                    <strong
                                        style={{
                                            fontSize:
                                                "1rem",
                                            whiteSpace:
                                                "nowrap",
                                        }}
                                    >
                                        {isIncome
                                            ? "+"
                                            : "-"}
                                        $
                                        {formatMoney(
                                            movement.amount
                                        )}
                                    </strong>
                                </div>

                                {/* Descripción */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        onToggle(
                                            movement.id
                                        )
                                    }
                                    style={{
                                        border: "none",
                                        background:
                                            "transparent",
                                        padding: 0,
                                        margin: 0,
                                        textAlign: "left",
                                        cursor: "pointer",
                                        fontSize:
                                            "0.9rem",
                                        color: movement.description
                                            ? "var(--text)"
                                            : "var(--text-muted)",
                                    }}
                                >
                                    {movement.description ||
                                        "Sin descripción"}
                                </button>

                                {/* Datos rápidos */}
                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap:
                                            "wrap",
                                        gap: "0.4rem",
                                    }}
                                >
                                    {!isIncome &&
                                        movement.expenseType && (
                                            <span
                                                style={{
                                                    padding:
                                                        "0.25rem 0.5rem",
                                                    borderRadius:
                                                        "0.4rem",
                                                    background:
                                                        "var(--background, #f5f5f5)",
                                                    fontSize:
                                                        "0.75rem",
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                {
                                                    movement
                                                        .expenseType
                                                        .name
                                                }
                                            </span>
                                        )}

                                    {!isIncome &&
                                        movement.paymentMethod && (
                                            <span
                                                style={{
                                                    padding:
                                                        "0.25rem 0.5rem",
                                                    borderRadius:
                                                        "0.4rem",
                                                    background:
                                                        "var(--background, #f5f5f5)",
                                                    fontSize:
                                                        "0.75rem",
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                {
                                                    movement
                                                        .paymentMethod
                                                        .name
                                                }
                                            </span>
                                        )}

                                    {isIncome &&
                                        movement.payments &&
                                        movement.payments.length >
                                            0 &&
                                        movement.payments.map(
                                            (payment) => (
                                                <span
                                                    key={`${movement.id}-${payment.paymentMethodId}`}
                                                    style={{
                                                        padding:
                                                            "0.25rem 0.5rem",
                                                        borderRadius:
                                                            "0.4rem",
                                                        background:
                                                            "var(--background, #f5f5f5)",
                                                        fontSize:
                                                            "0.75rem",
                                                        color: "var(--text-muted)",
                                                    }}
                                                >
                                                    {
                                                        payment.paymentMethodName
                                                    }
                                                    {" · "}
                                                    $
                                                    {formatMoney(
                                                        payment.amount
                                                    )}
                                                </span>
                                            )
                                        )}
                                </div>

                                {/* Acciones */}
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "0.5rem",
                                        paddingTop:
                                            "0.15rem",
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onEdit(
                                                movement
                                            )
                                        }
                                        disabled={
                                            isDeleting
                                        }
                                        style={{
                                            flex: 1,
                                            minHeight:
                                                "42px",
                                            border:
                                                "1px solid var(--border, #ddd)",
                                            borderRadius:
                                                "0.55rem",
                                            background:
                                                "var(--background, #fff)",
                                            color: "var(--text)",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            gap: "0.4rem",
                                            cursor:
                                                isDeleting
                                                    ? "not-allowed"
                                                    : "pointer",
                                            opacity:
                                                isDeleting
                                                    ? 0.5
                                                    : 1,
                                        }}
                                    >
                                        <Pencil
                                            size={16}
                                        />
                                        Editar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onDelete(
                                                movement
                                            )
                                        }
                                        disabled={
                                            isDeleting
                                        }
                                        style={{
                                            width: "46px",
                                            minHeight:
                                                "42px",
                                            border:
                                                "1px solid #fecaca",
                                            borderRadius:
                                                "0.55rem",
                                            background:
                                                "#fff5f5",
                                            color:
                                                "#dc2626",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            cursor:
                                                isDeleting
                                                    ? "not-allowed"
                                                    : "pointer",
                                            opacity:
                                                isDeleting
                                                    ? 0.5
                                                    : 1,
                                        }}
                                        aria-label="Eliminar movimiento"
                                    >
                                        <Trash2
                                            size={17}
                                        />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onToggle(
                                                movement.id
                                            )
                                        }
                                        aria-label={
                                            expanded
                                                ? "Contraer movimiento"
                                                : "Ver detalle"
                                        }
                                        style={{
                                            width: "46px",
                                            minHeight:
                                                "42px",
                                            border:
                                                "1px solid var(--border, #ddd)",
                                            borderRadius:
                                                "0.55rem",
                                            background:
                                                "var(--background, #fff)",
                                            color: "var(--text-muted)",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {expanded ? (
                                            <ChevronUp
                                                size={19}
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={19}
                                            />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* DETALLE */}
                            {expanded && (
                                <div
                                    style={{
                                        borderTop:
                                            "1px solid var(--border, #ddd)",
                                        padding:
                                            "0.85rem",
                                        display:
                                            "flex",
                                        flexDirection:
                                            "column",
                                        gap: "0.8rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            flexDirection:
                                                "column",
                                            gap: "0.45rem",
                                        }}
                                    >
                                        <DetailRow
                                            label="Fecha"
                                            value={formatDate(
                                                movement.date
                                            )}
                                        />

                                        {movement.description && (
                                            <DetailRow
                                                label="Descripción"
                                                value={
                                                    movement.description
                                                }
                                            />
                                        )}
                                    </div>

                                    {/* EGRESO */}
                                    {!isIncome && (
                                        <>
                                            {movement.expenseType && (
                                                <DetailRow
                                                    label="Tipo de gasto"
                                                    value={
                                                        movement
                                                            .expenseType
                                                            .name
                                                    }
                                                />
                                            )}

                                            {movement.paymentMethod && (
                                                <DetailRow
                                                    label="Medio de pago"
                                                    value={
                                                        movement
                                                            .paymentMethod
                                                            .name
                                                    }
                                                />
                                            )}

                                            <div
                                                style={{
                                                    borderTop:
                                                        "1px solid var(--border, #eee)",
                                                    paddingTop:
                                                        "0.7rem",
                                                }}
                                            >
                                                <DetailRow
                                                    label="Total"
                                                    value={`$${formatMoney(
                                                        movement.amount
                                                    )}`}
                                                    strong
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* INGRESO */}
                                    {isIncome && (
                                        <>
                                            {movement.investmentPercentage !==
                                                undefined && (
                                                <div
                                                    style={{
                                                        borderTop:
                                                            "1px solid var(--border, #eee)",
                                                        paddingTop:
                                                            "0.7rem",
                                                        display:
                                                            "flex",
                                                        flexDirection:
                                                            "column",
                                                        gap: "0.45rem",
                                                    }}
                                                >
                                                    <DetailRow
                                                        label="Inversión"
                                                        value={`${movement.investmentPercentage}%`}
                                                    />

                                                    <DetailRow
                                                        label="Total inversión"
                                                        value={`$${formatMoney(
                                                            investmentAmount
                                                        )}`}
                                                        strong
                                                    />
                                                </div>
                                            )}

                                            {movement.payments &&
                                                movement.payments.length >
                                                    0 && (
                                                    <div
                                                        style={{
                                                            borderTop:
                                                                "1px solid var(--border, #eee)",
                                                            paddingTop:
                                                                "0.7rem",
                                                            display:
                                                                "flex",
                                                            flexDirection:
                                                                "column",
                                                            gap: "0.65rem",
                                                        }}
                                                    >
                                                        <strong>
                                                            Medios
                                                            de
                                                            pago
                                                        </strong>

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
                                                                        gap: "0.2rem",
                                                                    }}
                                                                >
                                                                    <DetailRow
                                                                        label={
                                                                            payment.paymentMethodName
                                                                        }
                                                                        value={`$${formatMoney(
                                                                            payment.amount
                                                                        )}`}
                                                                        strong
                                                                    />

                                                                    {payment.commissionPercentage >
                                                                        0 && (
                                                                        <>
                                                                            <DetailRow
                                                                                label={`Comisión (${payment.commissionPercentage}%)`}
                                                                                value={`-$${formatMoney(
                                                                                    payment.commissionAmount
                                                                                )}`}
                                                                                muted
                                                                            />

                                                                            <DetailRow
                                                                                label="Neto"
                                                                                value={`$${formatMoney(
                                                                                    payment.netAmount
                                                                                )}`}
                                                                                strong
                                                                            />
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}

                                            <div
                                                style={{
                                                    borderTop:
                                                        "1px solid var(--border, #eee)",
                                                    paddingTop:
                                                        "0.7rem",
                                                    display:
                                                        "flex",
                                                    flexDirection:
                                                        "column",
                                                    gap: "0.4rem",
                                                }}
                                            >
                                                <DetailRow
                                                    label="Bruto"
                                                    value={`$${formatMoney(
                                                        movement.amount
                                                    )}`}
                                                />

                                                <DetailRow
                                                    label="Comisiones"
                                                    value={`-$${formatMoney(
                                                        totalCommission
                                                    )}`}
                                                    muted
                                                />

                                                <DetailRow
                                                    label="Neto"
                                                    value={`$${formatMoney(
                                                        netIncome
                                                    )}`}
                                                    strong
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                }
            )}
        </div>
    );
}

interface DetailRowProps {
    label: string;
    value: string;
    strong?: boolean;
    muted?: boolean;
}

function DetailRow({
    label,
    value,
    strong = false,
    muted = false,
}: DetailRowProps) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
            }}
        >
            <span
                style={{
                    color: muted
                        ? "var(--text-muted)"
                        : "var(--text)",
                    fontSize: "0.85rem",
                }}
            >
                {label}
            </span>

            <span
                style={{
                    textAlign: "right",
                    overflowWrap: "anywhere",
                    fontWeight: strong ? 600 : 400,
                    fontSize: "0.9rem",
                }}
            >
                {value}
            </span>
        </div>
    );
}
