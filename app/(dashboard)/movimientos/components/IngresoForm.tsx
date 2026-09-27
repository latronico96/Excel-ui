"use client";

import { useState } from "react";
import { PaymentMethodOption } from "@/shared/types";
import { Loader2, Plus } from "lucide-react";

interface IncomePaymentForm {
    paymentMethodId: string;
    amount: string;
    commissionPercentage: string;
}

interface IngresoFormProps {
    paymentMethods: PaymentMethodOption[];
    loading: boolean;
    onSaved: () => Promise<void>;
    onError: (message: string) => void;
}

export default function IngresoForm({
    paymentMethods,
    loading,
    onSaved,
    onError,
}: IngresoFormProps) {
    const today = new Date().toISOString().split("T")[0];

    const [saving, setSaving] = useState(false);

    const createPayments = () =>
        paymentMethods.map((method) => ({
            paymentMethodId: method.id,
            amount: "",
            commissionPercentage: String(
                method.defaultCommissionPercentage ?? 0
            ),
        }));

    const [form, setForm] = useState({
        date: today,
        investmentPercentage: "50",
        description: "",
        payments: createPayments(),
    });

    const updatePayment = (
        paymentMethodId: string,
        field: "amount" | "commissionPercentage",
        value: string
    ) => {
        setForm((current) => ({
            ...current,
            payments: current.payments.map((payment) =>
                payment.paymentMethodId === paymentMethodId
                    ? {
                          ...payment,
                          [field]: value,
                      }
                    : payment
            ),
        }));
    };

    const totalIncome = form.payments.reduce(
        (total, payment) =>
            total + Number(payment.amount || 0),
        0
    );

    const totalCommission = form.payments.reduce(
        (total, payment) => {
            const amount = Number(payment.amount || 0);
            const percentage = Number(
                payment.commissionPercentage || 0
            );

            return (
                total +
                amount * (percentage / 100)
            );
        },
        0
    );

    const netIncome = totalIncome - totalCommission;

    const investmentPercentage = Number(
        form.investmentPercentage || 0
    );

    const investmentAmount =
        netIncome * (investmentPercentage / 100);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const payments = form.payments
            .filter(
                (payment) =>
                    Number(payment.amount) > 0
            )
            .map((payment) => ({
                paymentMethodId:
                    payment.paymentMethodId,
                amount: Number(payment.amount),
                commissionPercentage: Number(
                    payment.commissionPercentage || 0
                ),
            }));

        if (payments.length === 0) {
            onError(
                "Ingresá al menos un monto en un medio de pago."
            );
            return;
        }

        if (totalIncome <= 0) {
            onError(
                "El total del ingreso debe ser mayor a cero."
            );
            return;
        }

        try {
            setSaving(true);
            onError("");

            const res = await fetch("/api/movimientos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: "INGRESO",
                    date: form.date,
                    investmentPercentage,
                    payments,
                    description:
                        form.description.trim() || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        "No se pudo guardar el ingreso"
                );
            }

            setForm({
                date: today,
                investmentPercentage: "50",
                description: "",
                payments: createPayments(),
            });

            await onSaved();
        } catch (err) {
            console.error(err);

            onError(
                err instanceof Error
                    ? err.message
                    : "No se pudo guardar el ingreso"
            );
        } finally {
            setSaving(false);
        }
    };

    const formatMoney = (value: number) =>
        value.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    return (
        <div className="card">
            <h3>Nuevo ingreso</h3>

            <form
                onSubmit={handleSave}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                <div className="form-group">
                    <label>Fecha</label>

                    <input
                        type="date"
                        className="input"
                        value={form.date}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                date: e.target.value,
                            })
                        }
                        required
                    />
                </div>

                <div>
                    <label
                        style={{
                            display: "block",
                            marginBottom: "0.75rem",
                            fontWeight: 600,
                        }}
                    >
                        Medios de pago
                    </label>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                        }}
                    >
                        {paymentMethods.map((method) => {
                            const payment =
                                form.payments.find(
                                    (p) =>
                                        p.paymentMethodId ===
                                        method.id
                                );

                            return (
                                <div
                                    key={method.id}
                                    style={{
                                        padding: "0.75rem",
                                        border:
                                            "1px solid var(--border, #ddd)",
                                        borderRadius:
                                            "0.5rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            marginBottom:
                                                "0.5rem",
                                        }}
                                    >
                                        {method.name}
                                    </div>

                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "1fr 100px",
                                            gap: "0.75rem",
                                        }}
                                    >
                                        <div className="form-group">
                                            <label>
                                                Monto
                                            </label>

                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="input"
                                                placeholder="0.00"
                                                value={
                                                    payment?.amount ??
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    updatePayment(
                                                        method.id,
                                                        "amount",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Comisión %
                                            </label>

                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="input"
                                                value={
                                                    payment?.commissionPercentage ??
                                                    "0"
                                                }
                                                onChange={(e) =>
                                                    updatePayment(
                                                        method.id,
                                                        "commissionPercentage",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div
                    style={{
                        borderTop:
                            "1px solid var(--border, #ddd)",
                        paddingTop: "1rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                        }}
                    >
                        <span>Total bruto</span>

                        <strong>
                            ${formatMoney(totalIncome)}
                        </strong>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                        }}
                    >
                        <span>Comisiones</span>

                        <strong>
                            -$
                            {formatMoney(
                                totalCommission
                            )}
                        </strong>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            fontSize: "1.1rem",
                        }}
                    >
                        <strong>Total neto</strong>

                        <strong>
                            ${formatMoney(netIncome)}
                        </strong>
                    </div>
                </div>

                <div className="form-group">
                    <label>
                        Inversión (% sobre neto)
                    </label>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "100px 1fr",
                            gap: "0.75rem",
                            alignItems: "center",
                        }}
                    >
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            className="input"
                            value={
                                form.investmentPercentage
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    investmentPercentage:
                                        e.target.value,
                                })
                            }
                        />

                        <div>
                            ${formatMoney(investmentAmount)}
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Descripción</label>

                    <input
                        type="text"
                        className="input"
                        placeholder="Ej: Ventas del día"
                        value={form.description}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                description:
                                    e.target.value,
                            })
                        }
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving || loading}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                    }}
                >
                    {saving ? (
                        <Loader2
                            className="animate-spin"
                            size={20}
                        />
                    ) : (
                        <Plus size={20} />
                    )}

                    {saving
                        ? "Guardando..."
                        : "Guardar ingreso"}
                </button>
            </form>
        </div>
    );
}
