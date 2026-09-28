"use client";

import { useEffect, useState } from "react";
import {
    Movement,
    PaymentMethodOption,
} from "@/shared/types";
import {
    Loader2,
    Plus,
    Save,
    X,
} from "lucide-react";

interface IncomePaymentForm {
    paymentMethodId: string;
    amount: string;
    commissionPercentage: string;
}

interface IngresoFormProps {
    paymentMethods: PaymentMethodOption[];
    loading: boolean;
    onSaved: () => Promise<void>;
    onClose: () => void;
    onError: (message: string) => void;
    movement?: Movement;
}

export default function IngresoForm({
    paymentMethods,
    loading,
    onSaved,
    onClose,
    onError,
    movement,
}: IngresoFormProps) {
    const today = new Date()
        .toISOString()
        .split("T")[0];

    const isEditing = Boolean(movement);

    const createPayments = (): IncomePaymentForm[] =>
        paymentMethods.map((method) => ({
            paymentMethodId: method.id,
            amount: "",
            commissionPercentage: String(
                method.defaultCommissionPercentage ?? 0
            ),
        }));

    const createForm = () => ({
        date: today,
        investmentPercentage: "50",
        description: "",
        payments: createPayments(),
    });

    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState(createForm);

    useEffect(() => {
        if (!movement) {
            setForm(createForm());
            return;
        }

        const movementDate = new Date(movement.date);

        const formattedDate = Number.isNaN(
            movementDate.getTime()
        )
            ? today
            : movementDate
                .toISOString()
                .split("T")[0];

        const movementPayments =
            movement.payments ?? [];

        const payments = paymentMethods.map(
            (method) => {
                const existingPayment =
                    movementPayments.find(
                        (payment) =>
                            payment.paymentMethodId ===
                            method.id
                    );

                return {
                    paymentMethodId: method.id,
                    amount: existingPayment
                        ? String(existingPayment.amount)
                        : "",
                    commissionPercentage:
                        existingPayment
                            ? String(
                                existingPayment.commissionPercentage
                            )
                            : String(
                                method.defaultCommissionPercentage ??
                                0
                            ),
                };
            }
        );

        setForm({
            date: formattedDate,
            investmentPercentage: String(
                movement.investmentPercentage ?? 50
            ),
            description:
                movement.description ?? "",
            payments,
        });
    }, [movement, paymentMethods]);

    const updatePayment = (
        paymentMethodId: string,
        field:
            | "amount"
            | "commissionPercentage",
        value: string
    ) => {
        setForm((current) => ({
            ...current,
            payments: current.payments.map(
                (payment) =>
                    payment.paymentMethodId ===
                        paymentMethodId
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
            total +
            Number(payment.amount || 0),
        0
    );

    const totalCommission = form.payments.reduce(
        (total, payment) => {
            const amount = Number(
                payment.amount || 0
            );

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

    const netIncome =
        totalIncome - totalCommission;

    const investmentPercentage = Number(
        form.investmentPercentage || 0
    );

    const investmentAmount =
        netIncome *
        (investmentPercentage / 100);

    const handleSave = async (
        e: React.FormEvent
    ) => {
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

            const payload = {
                type: "INGRESO" as const,
                date: form.date,
                investmentPercentage,
                payments,
                description:
                    form.description.trim() ||
                    null,
            };

            const res = await fetch(
                "/api/movimientos",
                {
                    method: isEditing
                        ? "PUT"
                        : "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(
                        isEditing
                            ? {
                                id: movement!.id,
                                ...payload,
                            }
                            : payload
                    ),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                    (
                        isEditing
                            ? "No se pudo actualizar el ingreso"
                            : "No se pudo guardar el ingreso"
                    )
                );
            }

            if (!isEditing) {
                setForm(createForm());
            }

            await onSaved();
        } catch (err) {
            console.error(err);

            onError(
                err instanceof Error
                    ? err.message
                    : (
                        isEditing
                            ? "No se pudo actualizar el ingreso"
                            : "No se pudo guardar el ingreso"
                    )
            );
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        const hasData =
            form.description.trim() !== "" ||
            form.investmentPercentage !== "50" ||
            form.payments.some(
                (payment) =>
                    payment.amount.trim() !== ""
            );

        if (!hasData) {
            onClose();
            return;
        }

        const confirmed = window.confirm(
            "¿Cerrar el formulario?\n\nSe perderán los datos que ingresaste."
        );

        if (confirmed) {
            onClose();
        }
    };

    const formatMoney = (value: number) =>
        value.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    return (
        <div className="card">
            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                }}
            >
                <h3 style={{ margin: 0 }}>
                    {isEditing
                        ? "Editar ingreso"
                        : "Nuevo ingreso"}
                </h3>

                <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Cerrar formulario"
                    style={{
                        border: "none",
                        background:
                            "transparent",
                        cursor: "pointer",
                        padding: "0.25rem",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <X size={20} />
                </button>
            </div>

            <form
                onSubmit={handleSave}
                style={{
                    display: "flex",
                    flexDirection:
                        "column",
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
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                        }}
                    >
                        Medios de pago
                    </label>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.4rem",
                        }}
                    >
                        {paymentMethods.map((method) => {
                            const payment = form.payments.find(
                                (p) => p.paymentMethodId === method.id
                            );

                            const commission = Number(
                                payment?.commissionPercentage || 0
                            );

                            return (
                                <div
                                    key={method.id}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 130px",
                                        gap: "0.5rem",
                                        alignItems: "center",
                                        minHeight: "42px",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.35rem",
                                            minWidth: 0,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontWeight: 500,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {method.name}
                                        </span>

                                        {commission > 0 && (
                                            <span
                                                style={{
                                                    fontSize: "0.75rem",
                                                    color: "var(--text-muted)",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                · {commission}%
                                            </span>
                                        )}
                                    </div>

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="input"
                                        placeholder="0.00"
                                        value={payment?.amount ?? ""}
                                        onChange={(e) =>
                                            updatePayment(
                                                method.id,
                                                "amount",
                                                e.target.value
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                        }}
                                    />
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
                        display:
                            "flex",
                        flexDirection:
                            "column",
                        gap: "0.5rem",
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
                                totalIncome
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
                                "1.1rem",
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

                <div className="form-group">
                    <label>
                        Inversión (% sobre neto)
                    </label>

                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "100px 1fr",
                            gap:
                                "0.75rem",
                            alignItems:
                                "center",
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
                                        e.target
                                            .value,
                                })
                            }
                        />

                        <div>
                            $
                            {formatMoney(
                                investmentAmount
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>
                        Descripción
                    </label>

                    <input
                        type="text"
                        className="input"
                        placeholder="Ej: Ventas del día"
                        value={
                            form.description
                        }
                        onChange={(e) =>
                            setForm({
                                ...form,
                                description:
                                    e.target
                                        .value,
                            })
                        }
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                        saving || loading
                    }
                    style={{
                        display:
                            "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        gap: "0.5rem",
                    }}
                >
                    {saving ? (
                        <Loader2
                            className="animate-spin"
                            size={20}
                        />
                    ) : isEditing ? (
                        <Save size={20} />
                    ) : (
                        <Plus size={20} />
                    )}

                    {saving
                        ? "Guardando..."
                        : isEditing
                            ? "Guardar cambios"
                            : "Guardar ingreso"}
                </button>
            </form>
        </div>
    );
}
