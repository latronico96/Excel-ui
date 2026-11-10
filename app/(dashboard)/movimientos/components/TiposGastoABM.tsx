"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Power, X } from "lucide-react";
import { ExpenseTypeOption } from "@/shared/types";

interface ExpenseType extends ExpenseTypeOption {
    active: boolean;
}

export default function TiposGastoABM() {
    const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");

    const fetchExpenseTypes = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch("/api/tipos-gasto?all=true");
            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        "No se pudieron cargar los tipos de gasto"
                );
            }

            setExpenseTypes(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudieron cargar los tipos de gasto"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenseTypes();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setName("");
        setError("");
        setShowForm(true);
    };

    const openEdit = (expenseType: ExpenseType) => {
        setEditingId(expenseType.id);
        setName(expenseType.name);
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
        setError("");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Ingresá un nombre.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const res = await fetch("/api/tipos-gasto", {
                method: editingId ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    editingId
                        ? {
                              id: editingId,
                              name: trimmedName,
                          }
                        : {
                              name: trimmedName,
                          }
                ),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        "No se pudo guardar el tipo de gasto"
                );
            }

            if (editingId) {
                setExpenseTypes((current) =>
                    current.map((expenseType) =>
                        expenseType.id === editingId
                            ? {
                                  ...expenseType,
                                  name: data.name,
                                  active: data.active,
                              }
                            : expenseType
                    )
                );
            } else {
                setExpenseTypes((current) =>
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
                    : "No se pudo guardar el tipo de gasto"
            );
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (
        expenseType: ExpenseType
    ) => {
        try {
            setError("");

            const res = await fetch("/api/tipos-gasto", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: expenseType.id,
                    active: !expenseType.active,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        "No se pudo cambiar el estado"
                );
            }

            setExpenseTypes((current) =>
                current.map((item) =>
                    item.id === expenseType.id
                        ? {
                              ...item,
                              active: data.active,
                          }
                        : item
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
                        Tipos de gasto
                    </h3>

                    <p className="abm-subtitle">
                        Organizá tus gastos por categoría.
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
                                ? "Editar tipo de gasto"
                                : "Nuevo tipo de gasto"}
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
                        <label htmlFor="expense-type-name">
                            Nombre
                        </label>

                        <input
                            id="expense-type-name"
                            className="input"
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            placeholder="Ej: Publicidad"
                            maxLength={100}
                            autoFocus
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
                    Cargando tipos de gasto...
                </div>
            ) : expenseTypes.length === 0 ? (
                <div className="abm-empty">
                    No hay tipos de gasto.
                </div>
            ) : (
                <div className="expense-type-grid">
                    {expenseTypes.map((expenseType) => (
                        <div
                            key={expenseType.id}
                            className={`expense-type-card ${
                                expenseType.active
                                    ? ""
                                    : "inactive"
                            }`}
                        >
                            {/* Encabezado */}
                            <div className="expense-type-header">
                                <div className="expense-type-icon">
                                    $
                                </div>

                                <div
                                    style={{
                                        minWidth: 0,
                                        flex: 1,
                                    }}
                                >
                                    <div className="expense-type-name">
                                        {expenseType.name}
                                    </div>

                                    <span
                                        className={`expense-type-status ${
                                            expenseType.active
                                                ? "active"
                                                : "inactive"
                                        }`}
                                    >
                                        {expenseType.active
                                            ? "Activo"
                                            : "Inactivo"}
                                    </span>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="expense-type-actions">
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() =>
                                        openEdit(
                                            expenseType
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
                                            expenseType
                                        )
                                    }
                                >
                                    <Power size={16} />
                                    {expenseType.active
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
