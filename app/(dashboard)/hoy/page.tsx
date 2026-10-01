"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar,
    ChevronRight,
    CreditCard,
    Receipt,
    Wallet,
} from "lucide-react";

import { Movement } from "@/shared/types";

function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatMoney(value: number) {
    return value.toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

function formatToday() {
    return new Intl.DateTimeFormat("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(new Date());
}

export default function HoyPage() {
    const [movements, setMovements] = useState<Movement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMovements = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await fetch("/api/movimientos");

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data.error ||
                            "No se pudieron cargar los movimientos"
                    );
                }

                setMovements(
                    Array.isArray(data) ? data : []
                );
            } catch (err) {
                console.error(err);

                setError(
                    err instanceof Error
                        ? err.message
                        : "No se pudieron cargar los movimientos"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchMovements();
    }, []);

    const today = getLocalDateString();

    const todayMovements = useMemo(() => {
        return movements.filter((movement) => {
            return movement.date.slice(0, 10) === today;
        });
    }, [movements, today]);

    const totals = useMemo(() => {
        return todayMovements.reduce(
            (result, movement) => {
                if (movement.type === "INGRESO") {
                    result.income += movement.amount;
                } else {
                    result.expenses += movement.amount;
                }

                return result;
            },
            {
                income: 0,
                expenses: 0,
            }
        );
    }, [todayMovements]);

    const balance = totals.income - totals.expenses;

    const getPaymentMethod = (movement: Movement) => {
        if (movement.type === "INGRESO") {
            const paymentNames =
                movement.payments
                    ?.filter((payment) => payment.amount > 0)
                    .map((payment) => payment.paymentMethodName);

            if (!paymentNames || paymentNames.length === 0) {
                return null;
            }

            return paymentNames.join(" · ");
        }

        return movement.paymentMethod?.name ?? null;
    };

    const getMovementTitle = (movement: Movement) => {
        if (movement.description?.trim()) {
            return movement.description;
        }

        if (
            movement.type === "EGRESO" &&
            movement.expenseType?.name
        ) {
            return movement.expenseType.name;
        }

        return movement.type === "INGRESO"
            ? "Ingreso"
            : "Egreso";
    };

    return (
        <div className="animate-fade hoy-page">
            <div className="hoy-header">
                <div>
                    <h1 style={{ marginBottom: "0.25rem" }}>
                        Inicio
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            color: "var(--text-muted)",
                            textTransform: "capitalize",
                        }}
                    >
                        {formatToday()}
                    </p>
                </div>
            </div>

            {error && (
                <div
                    className="card"
                    style={{
                        marginBottom: "1rem",
                        color: "var(--error)",
                    }}
                >
                    {error}
                </div>
            )}

            {loading ? (
                <div className="card">
                    <div
                        style={{
                            padding: "1.5rem",
                            textAlign: "center",
                            color: "var(--text-muted)",
                        }}
                    >
                        Cargando movimientos...
                    </div>
                </div>
            ) : (
                <>
                    {/* =========================================
                        TOTALES DEL DÍA
                    ========================================= */}

                    <div className="hoy-summary-grid">
                        <div className="card hoy-summary-card income">
                            <div className="hoy-summary-label">
                                <ArrowUpCircle size={18} />
                                Ingresos
                            </div>

                            <strong>
                                ${formatMoney(totals.income)}
                            </strong>
                        </div>

                        <div className="card hoy-summary-card expense">
                            <div className="hoy-summary-label">
                                <ArrowDownCircle size={18} />
                                Gastos
                            </div>

                            <strong>
                                ${formatMoney(totals.expenses)}
                            </strong>
                        </div>
                    </div>

                    {/* =========================================
                        NETO
                    ========================================= */}

                    <div className="card hoy-balance-card">
                        <div>
                            <span className="hoy-balance-label">
                                Neto de hoy
                            </span>

                            <strong
                                className={
                                    balance >= 0
                                        ? "hoy-positive"
                                        : "hoy-negative"
                                }
                            >
                                {balance >= 0 ? "+" : "-"}$
                                {formatMoney(
                                    Math.abs(balance)
                                )}
                            </strong>
                        </div>

                        <Wallet size={28} />
                    </div>

                    {/* =========================================
                        MOVIMIENTOS
                    ========================================= */}

                    <div className="card hoy-movements-card">
                        <div className="hoy-section-header">
                            <div>
                                <h3 style={{ margin: 0 }}>
                                    Movimientos de hoy
                                </h3>

                                <p>
                                    {todayMovements.length === 0
                                        ? "Todavía no registraste movimientos"
                                        : `${todayMovements.length} movimiento${
                                              todayMovements.length ===
                                              1
                                                  ? ""
                                                  : "s"
                                          }`}
                                </p>
                            </div>

                            {todayMovements.length > 0 && (
                                <Link
                                    href="/movimientos"
                                    className="hoy-see-all"
                                >
                                    Ver todos
                                    <ChevronRight size={17} />
                                </Link>
                            )}
                        </div>

                        {todayMovements.length === 0 ? (
                            <div className="hoy-empty">
                                <Receipt size={32} />

                                <strong>
                                    Hoy todavía no pasó nada
                                    registrado.
                                </strong>

                                <span>
                                    Usá el botón + para registrar
                                    un ingreso, egreso o pago
                                    mensual.
                                </span>
                            </div>
                        ) : (
                            <div className="hoy-movements-list">
                                {todayMovements.map(
                                    (movement) => {
                                        const isIncome =
                                            movement.type ===
                                            "INGRESO";

                                        const paymentMethod =
                                            getPaymentMethod(
                                                movement
                                            );

                                        return (
                                            <div
                                                key={
                                                    movement.id
                                                }
                                                className="hoy-movement"
                                            >
                                                <div
                                                    className={`hoy-movement-icon ${
                                                        isIncome
                                                            ? "income"
                                                            : "expense"
                                                    }`}
                                                >
                                                    {isIncome ? (
                                                        <ArrowUpCircle
                                                            size={
                                                                20
                                                            }
                                                        />
                                                    ) : (
                                                        <ArrowDownCircle
                                                            size={
                                                                20
                                                            }
                                                        />
                                                    )}
                                                </div>

                                                <div className="hoy-movement-info">
                                                    <strong>
                                                        {getMovementTitle(
                                                            movement
                                                        )}
                                                    </strong>

                                                    <div className="hoy-movement-meta">
                                                        {paymentMethod && (
                                                            <>
                                                                <CreditCard
                                                                    size={
                                                                        13
                                                                    }
                                                                />

                                                                <span>
                                                                    {
                                                                        paymentMethod
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <strong
                                                    className={
                                                        isIncome
                                                            ? "hoy-positive"
                                                            : "hoy-negative"
                                                    }
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
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
