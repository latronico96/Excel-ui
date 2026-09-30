"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Plus, X, Power } from "lucide-react";

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
                Array.isArray(data) ? data : []
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
            String(paymentMethod.defaultCommissionPercentage)
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
            setError("La comisión debe estar entre 0 y 100.");
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
                        a.name.localeCompare(b.name, "es")
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
            {/* Header */}
            <div className="abm-header">
                <div>
                    <h3 style={{ margin: 0 }}>
                        Medios de pago
                    </h3>

                    <p className="abm-subtitle">
                        Configurá los medios y sus comisiones
                        predeterminadas.
                    </p>
                </div>

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

            {/* Error */}
            {error && (
                <div className="abm-error">
                    {error}
                </div>
            )}

            {/* Formulario */}
            {showForm && (
                <form
                    onSubmit={handleSave}
                    className="abm-form"
                >
                    <div className="abm-form-header">
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
                            className="abm-close-button"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="form-group">
                        <label htmlFor="payment-method-name">
                            Nombre
                        </label>

                        <input
                            id="payment-method-name"
                            className="input"
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            placeholder="Ej: Mercado Pago"
                            maxLength={100}
                            autoFocus
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="payment-method-commission">
                            Comisión predeterminada (%)
                        </label>

                        <input
                            id="payment-method-commission"
                            className="input"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={commission}
                            onChange={(e) =>
                                setCommission(e.target.value)
                            }
                            disabled={saving}
                        />
                    </div>

                    <div className="abm-form-actions">
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

            {/* Lista */}
            {loading ? (
                <div className="abm-empty">
                    Cargando medios de pago...
                </div>
            ) : paymentMethods.length === 0 ? (
                <div className="abm-empty">
                    No hay medios de pago.
                </div>
            ) : (
                <div className="payment-method-grid">
                    {paymentMethods.map((paymentMethod) => (
                        <div
                            key={paymentMethod.id}
                            className={`payment-method-card ${
                                paymentMethod.active
                                    ? ""
                                    : "inactive"
                            }`}
                        >
                            {/* Encabezado */}
                            <div className="payment-method-card-header">
                                <div
                                    className="payment-method-icon"
                                    aria-hidden="true"
                                >
                                    $
                                </div>

                                <div
                                    style={{
                                        minWidth: 0,
                                        flex: 1,
                                    }}
                                >
                                    <div className="payment-method-name">
                                        {paymentMethod.name}
                                    </div>

                                    <span
                                        className={`payment-method-status ${
                                            paymentMethod.active
                                                ? "active"
                                                : "inactive"
                                        }`}
                                    >
                                        {paymentMethod.active
                                            ? "Activo"
                                            : "Inactivo"}
                                    </span>
                                </div>
                            </div>

                            {/* Comisión */}
                            <div className="payment-method-commission">
                                <span>
                                    Comisión predeterminada
                                </span>

                                <strong>
                                    {
                                        paymentMethod.defaultCommissionPercentage
                                    }
                                    %
                                </strong>
                            </div>

                            {/* Acciones */}
                            <div className="payment-method-actions">
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() =>
                                        openEdit(
                                            paymentMethod
                                        )
                                    }
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
                                    <Power size={16} />
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
