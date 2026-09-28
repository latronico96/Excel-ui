"use client";

import { useEffect, useState } from "react";
import {
    ExpenseTypeOption,
    Movement,
    PaymentMethodOption,
} from "@/shared/types";
import { Loader2, Plus, Save, X } from "lucide-react";

interface EgresoFormProps {
    paymentMethods: PaymentMethodOption[];
    expenseTypes: ExpenseTypeOption[];
    loading: boolean;
    onSaved: () => Promise<void>;
    onClose: () => void;
    onError: (message: string) => void;
    movement?: Movement;
}

export default function EgresoForm({
    paymentMethods,
    expenseTypes,
    loading,
    onSaved,
    onClose,
    onError,
    movement,
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

    const isEditing = Boolean(movement);

    useEffect(() => {
        if (!movement) {
            return;
        }

        setForm({
            date: movement.date
                ? new Date(movement.date)
                      .toISOString()
                      .split("T")[0]
                : today,
            paymentMethodId:
                movement.paymentMethod?.id ?? "",
            expenseTypeId:
                movement.expenseType?.id ?? "",
            amount: String(movement.amount),
            description: movement.description ?? "",
        });
    }, [movement, today]);

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

            const payload = {
                type: "EGRESO" as const,
                date: form.date,
                amount,
                paymentMethodId: form.paymentMethodId,
                expenseTypeId: form.expenseTypeId,
                description:
                    form.description.trim() || null,
            };

            const res = await fetch("/api/movimientos", {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    isEditing
                        ? {
                              id: movement!.id,
                              ...payload,
                          }
                        : payload
                ),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        (isEditing
                            ? "No se pudo actualizar el egreso"
                            : "No se pudo guardar el egreso")
                );
            }

            if (!isEditing) {
                setForm((current) => ({
                    ...current,
                    amount: "",
                    description: "",
                }));
            }

            await onSaved();
        } catch (err) {
            console.error(err);

            onError(
                err instanceof Error
                    ? err.message
                    : isEditing
                      ? "No se pudo actualizar el egreso"
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
        <div
            className="card"
            style={{
                padding: "1rem",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                }}
            >
                <h3 style={{ margin: 0 }}>
                    {isEditing ? "Editar egreso" : "Nuevo egreso"}
                </h3>

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
                    gap: "0.75rem",
                }}
            >
                {/* Fecha */}
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

                {/* Tipo de gasto */}
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

                {/* Medio de pago */}
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

                {/* Monto */}
                <div className="form-group">
                    <label>Monto</label>

                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
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

                {/* Descripción */}
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

                {/* Guardar */}
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving || loading}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        marginTop: "0.25rem",
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
                          : "Guardar egreso"}
                </button>
            </form>
        </div>
    );
}