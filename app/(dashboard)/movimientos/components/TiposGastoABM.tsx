"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Plus, X } from "lucide-react";
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

            const res = await fetch("/api/tipos-gasto");

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "No se pudieron cargar los tipos de gasto"
                );
            }

            setExpenseTypes(
                Array.isArray(data)
                    ? data.map((type) => ({
                        ...type,
                        active: true,
                    }))
                    : []
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
                    : "No se pudo guardar el tipo de gasto"
            );
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (expenseType: ExpenseType) => {
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
                    Tipos de gasto
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
                                ? "Editar tipo de gasto"
                                : "Nuevo tipo de gasto"}
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
                        }}
                    >
                        <label htmlFor="expense-type-name">
                            Nombre
                        </label>

                        <input
                            id="expense-type-name"
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            placeholder="Ej: Publicidad"
                            maxLength={100}
                            autoFocus
                            disabled={saving}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid var(--border, #ddd)",
                                borderRadius: "0.5rem",
                                background: "var(--input-bg, #fff)",
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
                    Cargando tipos de gasto...
                </div>
            ) : expenseTypes.length === 0 ? (
                <div
                    style={{
                        padding: "1.5rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                    }}
                >
                    No hay tipos de gasto.
                </div>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                    }}
                >
                    {expenseTypes.map((expenseType) => (
                        <div
                            key={expenseType.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "1rem",
                                padding: "0.75rem",
                                border:
                                    "1px solid var(--border, #ddd)",
                                borderRadius: "0.6rem",
                                opacity: expenseType.active
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
                                    {expenseType.name}
                                </div>

                                {!expenseType.active && (
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
                                            expenseType
                                        )
                                    }
                                    aria-label={`Editar ${expenseType.name}`}
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