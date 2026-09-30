"use client";

import { useState } from "react";
import { Movement } from "@/shared/types";
import MovimientosMobile from "./MovimientosMobile";

interface MovimientosHistorialProps {
    movements: Movement[];
    loading: boolean;
    onEdit: (movement: Movement) => void;
    onDelete: (movementId: string) => Promise<void>;
}

export interface MovementDisplayData {
    movement: Movement;
    isIncome: boolean;
    totalCommission: number;
    netIncome: number;
    investmentAmount: number;
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

    const displayMovements: MovementDisplayData[] = movements.map(
        (movement) => {
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

            const investmentAmount =
                isIncome &&
                movement.investmentPercentage !== undefined
                    ? netIncome *
                      (movement.investmentPercentage / 100)
                    : 0;

            return {
                movement,
                isIncome,
                totalCommission,
                netIncome,
                investmentAmount,
            };
        }
    );

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

            {/* Mobile */}
            <div className="block md:hidden">
                <MovimientosMobile
                    movements={displayMovements}
                    expandedId={expandedId}
                    deletingId={deletingId}
                    onToggle={toggleMovement}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                    formatDate={formatDate}
                    formatMoney={formatMoney}
                />
            </div>
        </div>
    );
}
