"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowDownCircle,
    ArrowUpCircle,
    ChevronRight,
    CreditCard,
    Receipt,
    Wallet,
} from "lucide-react";

import { Movement } from "@/shared/types";

interface TodaySummary {
    income: number;
    expenses: number;
    balance: number;
    commissions: number;
    netIncome: number;
    investment: number;
    tithe: number;
    available: number;
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
    const [summary, setSummary] =
        useState<TodaySummary | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    movementsRes,
                    summaryRes,
                ] = await Promise.all([
                    fetch("/api/movimientos"),
                    fetch("/api/resumen?period=day"),
                ]);

                const movementsData =
                    await movementsRes.json();

                const summaryData =
                    await summaryRes.json();

                if (!movementsRes.ok) {
                    throw new Error(
                        movementsData.error ||
                            "No se pudieron cargar los movimientos"
                    );
                }

                if (!summaryRes.ok) {
                    throw new Error(
                        summaryData.error ||
                            "No se pudo cargar el resumen"
                    );
                }

                setMovements(
                    Array.isArray(movementsData)
                        ? movementsData
                        : []
                );

                setSummary(
                    summaryData.totals ?? null
                );
            } catch (err) {
                console.error(err);

                setError(
                    err instanceof Error
                        ? err.message
                        : "No se pudieron cargar los datos"
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    /*
     * La API devuelve todos los movimientos.
     *
     * Para la lista de "Movimientos de hoy"
     * filtramos únicamente los del día actual.
     *
     * Los totales NO se calculan acá:
     * vienen de /api/resumen?period=day
     */
    const today = new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone:
                "America/Argentina/Buenos_Aires",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }
    ).format(new Date());

    const todayMovements =
        movements.filter((movement) => {
            const movementDate =
                new Date(movement.date);

            if (
                Number.isNaN(
                    movementDate.getTime()
                )
            ) {
                return false;
            }

            const movementDay =
                new Intl.DateTimeFormat(
                    "en-CA",
                    {
                        timeZone:
                            "America/Argentina/Buenos_Aires",
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    }
                ).format(movementDate);

            return movementDay === today;
        });

    const getPaymentMethod = (
        movement: Movement
    ) => {
        if (
            movement.type === "INGRESO"
        ) {
            const paymentNames =
                movement.payments
                    ?.filter(
                        (payment) =>
                            payment.amount > 0
                    )
                    .map(
                        (payment) =>
                            payment.paymentMethodName
                    );

            if (
                !paymentNames ||
                paymentNames.length === 0
            ) {
                return null;
            }

            return paymentNames.join(" · ");
        }

        return (
            movement.paymentMethod?.name ??
            null
        );
    };

    const getMovementTitle = (
        movement: Movement
    ) => {
        if (
            movement.description?.trim()
        ) {
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
                    <h1
                        style={{
                            marginBottom:
                                "0.25rem",
                        }}
                    >
                        Inicio
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            color:
                                "var(--text-muted)",
                            textTransform:
                                "capitalize",
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
                            color:
                                "var(--text-muted)",
                        }}
                    >
                        Cargando resumen...
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
                                <ArrowUpCircle
                                    size={18}
                                />
                                Ingresos
                            </div>

                            <strong>
                                $
                                {formatMoney(
                                    summary?.income ??
                                        0
                                )}
                            </strong>
                        </div>

                        <div className="card hoy-summary-card expense">
                            <div className="hoy-summary-label">
                                <ArrowDownCircle
                                    size={18}
                                />
                                Gastos
                            </div>

                            <strong>
                                $
                                {formatMoney(
                                    summary?.expenses ??
                                        0
                                )}
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
                                    (summary?.balance ??
                                        0) >= 0
                                        ? "hoy-positive"
                                        : "hoy-negative"
                                }
                            >
                                {(summary?.balance ??
                                    0) >= 0
                                    ? "+"
                                    : "-"}
                                $
                                {formatMoney(
                                    Math.abs(
                                        summary?.balance ??
                                            0
                                    )
                                )}
                            </strong>
                        </div>

                        <Wallet size={28} />
                    </div>

                    {/* =========================================
                        DISTRIBUCIÓN
                    ========================================= */}

                    {summary &&
                        (summary.investment >
                            0 ||
                            summary.tithe > 0) && (
                            <div className="card">
                                <div
                                    style={{
                                        display:
                                            "flex",
                                        flexDirection:
                                            "column",
                                        gap: "0.75rem",
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
                                        <span>
                                            Reinversión
                                        </span>

                                        <strong>
                                            $
                                            {formatMoney(
                                                summary.investment
                                            )}
                                        </strong>
                                    </div>

                                    {summary.tithe >
                                        0 && (
                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                gap: "1rem",
                                            }}
                                        >
                                            <span>
                                                Diezmo
                                            </span>

                                            <strong>
                                                $
                                                {formatMoney(
                                                    summary.tithe
                                                )}
                                            </strong>
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            borderTop:
                                                "1px solid var(--border)",
                                            paddingTop:
                                                "0.75rem",
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            gap: "1rem",
                                        }}
                                    >
                                        <strong>
                                            Disponible
                                        </strong>

                                        <strong>
                                            $
                                            {formatMoney(
                                                summary.available
                                            )}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* =========================================
                        MOVIMIENTOS
                    ========================================= */}

                    <div className="card hoy-movements-card">
                        <div className="hoy-section-header">
                            <div>
                                <h3
                                    style={{
                                        margin: 0,
                                    }}
                                >
                                    Movimientos de hoy
                                </h3>

                                <p>
                                    {todayMovements.length ===
                                    0
                                        ? "Todavía no registraste movimientos"
                                        : `${
                                              todayMovements.length
                                          } movimiento${
                                              todayMovements.length ===
                                              1
                                                  ? ""
                                                  : "s"
                                          }`}
                                </p>
                            </div>

                            {todayMovements.length >
                                0 && (
                                <Link
                                    href="/movimientos"
                                    className="hoy-see-all"
                                >
                                    Ver todos
                                    <ChevronRight
                                        size={17}
                                    />
                                </Link>
                            )}
                        </div>

                        {todayMovements.length ===
                        0 ? (
                            <div className="hoy-empty">
                                <Receipt
                                    size={32}
                                />

                                <strong>
                                    Hoy todavía no pasó
                                    nada registrado.
                                </strong>

                                <span>
                                    Usá el botón + para
                                    registrar un ingreso,
                                    egreso o pago mensual.
                                </span>
                            </div>
                        ) : (
                            <div className="hoy-movements-list">
                                {todayMovements.map(
                                    (
                                        movement
                                    ) => {
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
