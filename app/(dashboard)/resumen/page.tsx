"use client";

import { useEffect, useState } from "react";
import {
    Calendar,
    DollarSign,
    Info,
    TrendingDown,
    TrendingUp,
    Wallet,
} from "lucide-react";
import {
    SummaryPeriod,
    SummaryResponse,
} from "@/shared/types";

const periodLabels: Record<SummaryPeriod, string> = {
    week: "Semana",
    month: "Mes",
    year: "Año",
};

const totalDescriptions = {
    balance: "Ingresos menos gastos. No descuenta las comisiones de los medios de pago.",
    income: "Total de ingresos brutos registrados en el período.",
    expenses: "Total de gastos registrados en el período.",
    netIncome: "Ingresos menos las comisiones de los medios de pago.",
};

export default function ResumenPage() {
    const [period, setPeriod] = useState<SummaryPeriod>("month");
    const [summary, setSummary] = useState<SummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);

            try {
                const res = await fetch(
                    `/api/resumen?period=${period}`
                );

                const data = await res.json();

                if (res.ok) {
                    setSummary(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [period]);

    const totals = summary?.totals;

    const formatMoney = (value: number) =>
        value.toLocaleString("es-AR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });

    const InfoTooltip = ({
        text,
    }: {
        text: string;
    }) => (
        <span
            title={text}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "help",
                color: "var(--text-muted)",
                marginLeft: "5px",
                verticalAlign: "middle",
            }}
            aria-label={text}
        >
            <Info size={15} />
        </span>
    );

    return (
        <div className="animate-fade">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                    marginBottom: "1.5rem",
                }}
            >
                <div>
                    <h1 style={{ marginBottom: "0.25rem" }}>
                        Resumen de Cuenta
                    </h1>

                    <p
                        style={{
                            color: "var(--text-muted)",
                            margin: 0,
                        }}
                    >
                        Resumen de {periodLabels[period].toLowerCase()}
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "0.5rem",
                        background: "var(--card-bg)",
                        padding: "0.35rem",
                        borderRadius: "10px",
                        border: "1px solid var(--border)",
                    }}
                >
                    {(["week", "month", "year"] as SummaryPeriod[]).map(
                        (option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setPeriod(option)}
                                style={{
                                    border: "none",
                                    borderRadius: "7px",
                                    padding: "0.55rem 0.9rem",
                                    cursor: "pointer",
                                    fontWeight:
                                        period === option ? "600" : "400",
                                    background:
                                        period === option
                                            ? "var(--primary)"
                                            : "transparent",
                                    color:
                                        period === option
                                            ? "white"
                                            : "var(--text)",
                                }}
                            >
                                {periodLabels[option]}
                            </button>
                        )
                    )}
                </div>
            </div>

            {loading ? (
                <div className="card">
                    <div
                        style={{
                            padding: "2rem",
                            textAlign: "center",
                        }}
                    >
                        Calculando resumen...
                    </div>
                </div>
            ) : !summary || !totals ? (
                <div className="card">
                    <div
                        style={{
                            padding: "2rem",
                            textAlign: "center",
                        }}
                    >
                        No se pudo cargar el resumen.
                    </div>
                </div>
            ) : (
                <>
                    <div className="summary-grid">
                        <div
                            className="card"
                            style={{ marginBottom: 0 }}
                        >
                            <div className="summary-card-title">
                                Balance
                                <InfoTooltip
                                    text={totalDescriptions.balance}
                                />
                            </div>

                            <div
                                className="summary-card-value"
                                style={{
                                    color:
                                        totals.balance >= 0
                                            ? "var(--success)"
                                            : "var(--error)",
                                }}
                            >
                                <Wallet
                                    size={20}
                                    style={{
                                        verticalAlign: "middle",
                                        marginRight: "4px",
                                    }}
                                />

                                ${formatMoney(totals.balance)}
                            </div>
                        </div>

                        <div
                            className="card"
                            style={{ marginBottom: 0 }}
                        >
                            <div className="summary-card-title">
                                Ingresos
                                <InfoTooltip
                                    text={totalDescriptions.income}
                                />
                            </div>

                            <div
                                className="summary-card-value"
                                style={{
                                    color: "var(--success)",
                                }}
                            >
                                <TrendingUp
                                    size={20}
                                    style={{
                                        verticalAlign: "middle",
                                        marginRight: "4px",
                                    }}
                                />

                                ${formatMoney(totals.income)}
                            </div>
                        </div>

                        <div
                            className="card"
                            style={{ marginBottom: 0 }}
                        >
                            <div className="summary-card-title">
                                Gastos
                                <InfoTooltip
                                    text={totalDescriptions.expenses}
                                />
                            </div>

                            <div
                                className="summary-card-value"
                                style={{
                                    color: "var(--error)",
                                }}
                            >
                                <TrendingDown
                                    size={20}
                                    style={{
                                        verticalAlign: "middle",
                                        marginRight: "4px",
                                    }}
                                />

                                ${formatMoney(totals.expenses)}
                            </div>
                        </div>

                        <div
                            className="card"
                            style={{ marginBottom: 0 }}
                        >
                            <div className="summary-card-title">
                                Ingreso Neto
                                <InfoTooltip
                                    text={totalDescriptions.netIncome}
                                />
                            </div>

                            <div
                                className="summary-card-value"
                                style={{
                                    color: "var(--success)",
                                }}
                            >
                                <DollarSign
                                    size={20}
                                    style={{
                                        verticalAlign: "middle",
                                        marginRight: "4px",
                                    }}
                                />

                                ${formatMoney(totals.netIncome)}
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3>
                            {period === "year"
                                ? "Desglose Mensual"
                                : "Desglose Diario"}
                        </h3>

                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>
                                            {period === "year"
                                                ? "Mes"
                                                : "Fecha"}
                                        </th>
                                        <th>Ingresos</th>
                                        <th>Gastos</th>
                                        <th>Comisiones</th>
                                        <th>Neto</th>
                                        <th>Inversión</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {summary.breakdown.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                style={{
                                                    textAlign: "center",
                                                    padding: "2rem",
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                No hay movimientos en este
                                                período.
                                            </td>
                                        </tr>
                                    ) : (
                                        summary.breakdown.map((item) => (
                                            <tr key={item.date}>
                                                <td>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "8px",
                                                        }}
                                                    >
                                                        <Calendar
                                                            size={16}
                                                            color="var(--text-muted)"
                                                        />

                                                        {item.date}
                                                    </div>
                                                </td>

                                                <td
                                                    style={{
                                                        color: "var(--success)",
                                                    }}
                                                >
                                                    +$
                                                    {formatMoney(
                                                        item.totalIncome
                                                    )}
                                                </td>

                                                <td
                                                    style={{
                                                        color: "var(--error)",
                                                    }}
                                                >
                                                    -$
                                                    {formatMoney(
                                                        item.totalExpenses
                                                    )}
                                                </td>

                                                <td>
                                                    $
                                                    {formatMoney(
                                                        item.commissions
                                                    )}
                                                </td>

                                                <td
                                                    style={{
                                                        fontWeight: "700",
                                                    }}
                                                >
                                                    $
                                                    {formatMoney(
                                                        item.netIncome
                                                    )}
                                                </td>

                                                <td>
                                                    $
                                                    {formatMoney(
                                                        item.investment
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
