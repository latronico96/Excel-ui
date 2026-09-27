"use client";

import { useState } from "react";
import {
    ExpenseTypeOption,
    PaymentMethodOption,
} from "@/shared/types";
import { Loader2, Plus, X } from "lucide-react";
interface EgresoFormProps {
    paymentMethods: PaymentMethodOption[];
    expenseTypes: ExpenseTypeOption[];
    loading: boolean;
    onSaved: () => Promise<void>;
    onClose: () => void;
    onError: (message: string) => void;
}

export default function EgresoForm({
    paymentMethods,
    expenseTypes,
    loading,
    onSaved,
    onClose,
    onError,
}: EgresoFormProps) {
    const today = new Date().toISOString().split("T")[0];

    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        date: today,
        paymentMethodId: "",
        expenseTypeId: "",
        amount: "",
        description: "",
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const amount = Number(form.amount);

        if (!amount || amount <= 0) {
            onError("Ingresá un monto válido para el egreso.");
            return;
        }

        if (!form.paymentMethodId) {
            onError(
                "Seleccioná un medio de pago para el egreso."
            );
            return;
        }

        if (!form.expenseTypeId) {
            onError("Seleccioná un tipo de gasto.");
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
                    type: "EGRESO",
                    date: form.date,
                    amount,
                    paymentMethodId: form.paymentMethodId,
                    expenseTypeId: form.expenseTypeId,
                    description:
                        form.description.trim() || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "No se pudo guardar el egreso"
                );
            }

            setForm((current) => ({
                ...current,
                amount: "",
                description: "",
            }));

            await onSaved();
        } catch (err) {
            console.error(err);

            onError(
                err instanceof Error
                    ? err.message
                    : "No se pudo guardar el egreso"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        const hasData =
            form.amount.trim() !== "" ||
            form.description.trim() !== "" ||
            form.paymentMethodId !== "" ||
            form.expenseTypeId !== "";

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

    return (
        <div className="card">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                }}
            >
                <h3 style={{ margin: 0 }}>Nuevo egreso</h3>

                <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Cerrar formulario"
                    style={{
                        border: "none",
                        background: "transparent",
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

                <div className="form-group">
                    <label>Tipo de gasto</label>

                    <select
                        className="select"
                        value={form.expenseTypeId}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                expenseTypeId: e.target.value,
                            })
                        }
                        required
                    >
                        <option value="">
                            Seleccionar...
                        </option>

                        {expenseTypes.map((type) => (
                            <option
                                key={type.id}
                                value={type.id}
                            >
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Medio de pago</label>

                    <select
                        className="select"
                        value={form.paymentMethodId}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                paymentMethodId: e.target.value,
                            })
                        }
                        required
                    >
                        <option value="">
                            Seleccionar...
                        </option>

                        {paymentMethods.map((method) => (
                            <option
                                key={method.id}
                                value={method.id}
                            >
                                {method.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Monto</label>

                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input"
                        placeholder="0.00"
                        value={form.amount}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                amount: e.target.value,
                            })
                        }
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Descripción</label>

                    <input
                        type="text"
                        className="input"
                        placeholder="Ej: Compra de insumos"
                        value={form.description}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                description: e.target.value,
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
                        : "Guardar egreso"}
                </button>
            </form>
        </div>
    );
}
