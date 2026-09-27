"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Plus, X } from "lucide-react";

interface PaymentMethod {
    id: string;
    name: string;
    active: boolean;
    defaultCommissionPercentage: number;
}

export default function MediosPagoABM() {
    const [paymentMethods, setPaymentMethods] = useState<
        PaymentMethod[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(
        null
    );

    const [name, setName] = useState("");
    const [commission, setCommission] = useState("0");

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch("/api/medios-pago?all=true");

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                    "No se pudieron cargar los medios de pago"
                );
            }

            setPaymentMethods(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudieron cargar los medios de pago"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setName("");
        setCommission("0");
        setError("");
        setShowForm(true);
    };

    const openEdit = (paymentMethod: PaymentMethod) => {
        setEditingId(paymentMethod.id);
        setName(paymentMethod.name);
        setCommission(
            String(
                paymentMethod.defaultCommissionPercentage
            )
        );
        setError("");
        setShowForm(true);
    };

    const closeForm = () => {
        if (saving) {
            return;
        }

        setShowForm(false);
        setEditingId(null);
        setName("");
        setCommission("0");
        setError("");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = name.trim();
        const commissionValue = Number(commission);

        if (!trimmedName) {
            setError("Ingresá un nombre.");
            return;
        }

        if (
            !Number.isFinite(commissionValue) ||
            commissionValue < 0 ||
            commissionValue > 100
        ) {
            setError(
                "La comisión debe estar entre 0 y 100."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const res = await fetch("/api/medios-pago", {
                method: editingId ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    editingId
                        ? {
                            id: editingId,
                            name: trimmedName,
                            defaultCommissionPercentage:
                                commissionValue,
                        }
                        : {
                            name: trimmedName,
                            defaultCommissionPercentage:
                                commissionValue,
                        }
                ),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                    "No se pudo guardar el medio de pago"
                );
            }

            if (editingId) {
                setPaymentMethods((current) =>
                    current.map((method) =>
                        method.id === editingId
                            ? {
                                ...method,
                                name: data.name,
                                active: data.active,
                                defaultCommissionPercentage:
                                    data.defaultCommissionPercentage,
                            }
                            : method
                    )
                );
            } else {
                setPaymentMethods((current) =>
                    [...current, data].sort((a, b) =>
                        a.name.localeCompare(
                            b.name,
                            "es"
                        )
                    )
                );
            }

            closeForm();
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo guardar el medio de pago"
            );
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (
        paymentMethod: PaymentMethod
    ) => {
        try {
            setError("");

            const res = await fetch("/api/medios-pago", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: paymentMethod.id,
                    active: !paymentMethod.active,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                    "No se pudo cambiar el estado"
                );
            }

            setPaymentMethods((current) =>
                current.map((method) =>
                    method.id === paymentMethod.id
                        ? {
                            ...method,
                            active: data.active,
                        }
                        : method
                )
            );
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo cambiar el estado"
            );
        }
    };

    return (
        <div className="card">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem",
                }}
            >
                <h3 style={{ margin: 0 }}>
                    Medios de pago
                </h3>

                {!showForm && (
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={openCreate}
                    >
                        <Plus size={18} />
                        Nuevo
                    </button>
                )}
            </div>

            {error && (
                <div
                    style={{
                        marginBottom: "1rem",
                        color: "var(--danger, #dc2626)",
                    }}
                >
                    {error}
                </div>
            )}

            {showForm && (
                <form
                    onSubmit={handleSave}
                    style={{
                        marginBottom: "1.25rem",
                        padding: "1rem",
                        border: "1px solid var(--border, #ddd)",
                        borderRadius: "0.75rem",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "1rem",
                        }}
                    >
                        <h4 style={{ margin: 0 }}>
                            {editingId
                                ? "Editar medio de pago"
                                : "Nuevo medio de pago"}
                        </h4>

                        <button
                            type="button"
                            onClick={closeForm}
                            disabled={saving}
                            aria-label="Cerrar formulario"
                            style={{
                                border: "none",
                                background: "transparent",
                                cursor: saving
                                    ? "default"
                                    : "pointer",
                                padding: "0.25rem",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            marginBottom: "1rem",
                        }}
                    >
                        <label htmlFor="payment-method-name">
                            Nombre
                        </label>

                        <input
                            id="payment-method-name"
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            placeholder="Ej: Mercado Pago"
                            maxLength={100}
                            autoFocus
                            disabled={saving}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid var(--border, #ddd)",
                                borderRadius: "0.5rem",
                                background:
                                    "var(--input-bg, #fff)",
                                color: "var(--text, inherit)",
                                fontSize: "1rem",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                        }}
                    >
                        <label htmlFor="payment-method-commission">
                            Comisión predeterminada (%)
                        </label>

                        <input
                            id="payment-method-commission"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={commission}
                            onChange={(e) =>
                                setCommission(
                                    e.target.value
                                )
                            }
                            disabled={saving}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid var(--border, #ddd)",
                                borderRadius: "0.5rem",
                                background:
                                    "var(--input-bg, #fff)",
                                color: "var(--text, inherit)",
                                fontSize: "1rem",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "0.75rem",
                            marginTop: "1rem",
                        }}
                    >
                        <button
                            type="button"
                            className="btn"
                            onClick={closeForm}
                            disabled={saving}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            <Check size={18} />
                            {saving
                                ? "Guardando..."
                                : "Guardar"}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div
                    style={{
                        padding: "1.5rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                    }}
                >
                    Cargando medios de pago...
                </div>
            ) : paymentMethods.length === 0 ? (
                <div
                    style={{
                        padding: "1.5rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                    }}
                >
                    No hay medios de pago.
                </div>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                    }}
                >
                    {paymentMethods.map((paymentMethod) => (
                        <div
                            key={paymentMethod.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "1rem",
                                padding: "0.75rem",
                                border:
                                    "1px solid var(--border, #ddd)",
                                borderRadius: "0.6rem",
                                opacity:
                                    paymentMethod.active
                                        ? 1
                                        : 0.55,
                            }}
                        >
                            <div
                                style={{
                                    minWidth: 0,
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        overflow: "hidden",
                                        textOverflow:
                                            "ellipsis",
                                        whiteSpace:
                                            "nowrap",
                                    }}
                                >
                                    {paymentMethod.name}
                                </div>

                                <div
                                    style={{
                                        fontSize: "0.8rem",
                                        color:
                                            "var(--text-muted)",
                                        marginTop: "0.15rem",
                                    }}
                                >
                                    Comisión:{" "}
                                    {
                                        paymentMethod.defaultCommissionPercentage
                                    }
                                    %
                                </div>

                                {!paymentMethod.active && (
                                    <div
                                        style={{
                                            fontSize:
                                                "0.8rem",
                                            color:
                                                "var(--text-muted)",
                                            marginTop:
                                                "0.15rem",
                                        }}
                                    >
                                        Inactivo
                                    </div>
                                )}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "0.5rem",
                                    flexShrink: 0,
                                }}
                            >
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() =>
                                        openEdit(
                                            paymentMethod
                                        )
                                    }
                                    aria-label={`Editar ${paymentMethod.name}`}
                                >
                                    <Pencil size={16} />
                                    Editar
                                </button>

                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() =>
                                        toggleActive(
                                            paymentMethod
                                        )
                                    }
                                >
                                    {paymentMethod.active
                                        ? "Desactivar"
                                        : "Activar"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
