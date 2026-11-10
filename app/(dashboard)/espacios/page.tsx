"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
    ArrowRight,
    Check,
    FolderKanban,
    LoaderCircle,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    X,
} from "lucide-react";

type Workspace = {
    id: string;
    name: string;
    role: "OWNER" | "ADMIN" | "MEMBER" | string;
};

const roleLabels: Record<string, string> = {
    OWNER: "Propietario",
    ADMIN: "Administrador",
    MEMBER: "Integrante",
};

function EspaciosABM() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeWorkspaceId, setActiveWorkspaceId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [switchingId, setSwitchingId] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");

    const fetchWorkspaces = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch("/api/espacios", {
                cache: "no-store",
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "No se pudieron cargar los espacios"
                );
            }

            setWorkspaces(data.workspaces ?? []);
            setActiveWorkspaceId(data.activeWorkspaceId ?? "");
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudieron cargar los espacios"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchWorkspaces();
    }, [fetchWorkspaces]);

    const openCreate = () => {
        setEditingId(null);
        setName("");
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEdit = (workspace: Workspace) => {
        setEditingId(workspace.id);
        setName(workspace.name);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingId(null);
        setName("");
        setError("");
    };

    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedName = name.trim();

        if (trimmedName.length < 2 || trimmedName.length > 80) {
            setError("El nombre debe tener entre 2 y 80 caracteres.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const res = await fetch("/api/espacios", {
                method: editingId ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...(editingId ? { id: editingId } : {}),
                    name: trimmedName,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "No se pudo guardar el espacio"
                );
            }

            if (editingId) {
                setWorkspaces((current) =>
                    current.map((workspace) =>
                        workspace.id === editingId
                            ? { ...workspace, name: data.workspace.name }
                            : workspace
                    )
                );
                setSuccess("Espacio actualizado correctamente.");
            } else {
                await fetchWorkspaces();
                setSuccess("Espacio creado correctamente.");
            }

            setShowForm(false);
            setEditingId(null);
            setName("");
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo guardar el espacio"
            );
        } finally {
            setSaving(false);
        }
    };

    const activateWorkspace = async (workspace: Workspace) => {
        if (workspace.id === activeWorkspaceId) return;

        try {
            setSwitchingId(workspace.id);
            setError("");
            setSuccess("");

            const res = await fetch("/api/espacios/activo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    workspaceId: workspace.id,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "No se pudo cambiar de espacio"
                );
            }

            window.location.reload();
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo cambiar de espacio"
            );
            setSwitchingId("");
        }
    };

    const deleteWorkspace = async (workspace: Workspace) => {
        const confirmed = window.confirm(
            `¿Eliminar el espacio "${workspace.name}"? Solo se pueden eliminar espacios vacíos. Esta acción no se puede deshacer.`
        );

        if (!confirmed) return;

        try {
            setSwitchingId(workspace.id);
            setError("");
            setSuccess("");

            const res = await fetch("/api/espacios", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: workspace.id }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error || "No se pudo eliminar el espacio"
                );
            }

            setWorkspaces((current) =>
                current.filter((item) => item.id !== workspace.id)
            );

            setSuccess("Espacio eliminado correctamente.");
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo eliminar el espacio"
            );
        } finally {
            setSwitchingId("");
        }
    };

    return (
        <div className="card">
            {/* Encabezado */}
            <div className="abm-header">
                <div>
                    <h3 style={{ margin: 0 }}>Espacios de trabajo</h3>
                    <p className="abm-subtitle">
                        Administrá tus espacios personales y compartidos.
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

            {/* Mensajes */}
            {error && (
                <div className="abm-error" role="alert">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Cerrar mensaje"
                        className="abm-close-button"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {success && (
                <div className="abm-success" role="status">
                    <Check size={17} />
                    <span>{success}</span>
                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                        aria-label="Cerrar mensaje"
                        className="abm-close-button"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* Formulario */}
            {showForm && (
                <form onSubmit={handleSave} className="abm-form">
                    <div className="abm-form-header">
                        <h4 style={{ margin: 0 }}>
                            {editingId ? "Editar espacio" : "Nuevo espacio"}
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
                        <label htmlFor="workspace-name">
                            Nombre del espacio
                        </label>

                        <input
                            id="workspace-name"
                            className="input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej.: Personal, Casa, Familia"
                            minLength={2}
                            maxLength={80}
                            required
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
                            {saving ? (
                                <LoaderCircle
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <Check size={18} />
                            )}
                            {saving
                                ? "Guardando..."
                                : editingId
                                  ? "Guardar cambios"
                                  : "Crear espacio"}
                        </button>
                    </div>
                </form>
            )}

            {/* Listado */}
            {loading ? (
                <div className="abm-empty">
                    <LoaderCircle
                        size={22}
                        className="animate-spin"
                    />
                    <span>Cargando espacios...</span>
                </div>
            ) : workspaces.length === 0 ? (
                <div className="abm-empty">
                    <FolderKanban size={32} />
                    <span>No hay espacios de trabajo.</span>
                    {!showForm && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={openCreate}
                        >
                            <Plus size={17} />
                            Crear primer espacio
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="workspace-list-toolbar">
                        <span>
                            {workspaces.length}{" "}
                            {workspaces.length === 1
                                ? "espacio"
                                : "espacios"}
                        </span>

                        <button
                            type="button"
                            className="btn"
                            onClick={() => void fetchWorkspaces()}
                            disabled={loading}
                        >
                            <RefreshCw size={15} />
                            Actualizar
                        </button>
                    </div>

                    <div className="expense-type-grid">
                        {workspaces.map((workspace) => {
                            const isActive =
                                workspace.id === activeWorkspaceId;
                            const canEdit = ["OWNER", "ADMIN"].includes(
                                workspace.role
                            );
                            const isBusy =
                                switchingId === workspace.id;

                            return (
                                <article
                                    key={workspace.id}
                                    className={`expense-type-card workspace-card ${
                                        isActive ? "workspace-current" : ""
                                    }`}
                                >
                                    <div className="expense-type-header">
                                        <div className="expense-type-icon">
                                            <FolderKanban size={21} />
                                        </div>

                                        <div className="workspace-info">
                                            <div className="expense-type-name">
                                                {workspace.name}
                                            </div>

                                            <div className="workspace-meta">
                                                <span>
                                                    {roleLabels[workspace.role] ??
                                                        workspace.role}
                                                </span>

                                                {isActive && (
                                                    <span className="expense-type-status active">
                                                        <Check size={12} />
                                                        Actual
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="expense-type-actions workspace-actions">
                                        <button
                                            type="button"
                                            className={
                                                isActive
                                                    ? "btn"
                                                    : "btn btn-primary"
                                            }
                                            onClick={() =>
                                                void activateWorkspace(workspace)
                                            }
                                            disabled={isActive || isBusy}
                                        >
                                            {isBusy ? (
                                                <LoaderCircle
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            ) : isActive ? (
                                                <Check size={16} />
                                            ) : (
                                                <ArrowRight size={16} />
                                            )}
                                            {isBusy
                                                ? "Procesando..."
                                                : isActive
                                                  ? "Espacio actual"
                                                  : "Entrar"}
                                        </button>

                                        {canEdit && (
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={() =>
                                                    openEdit(workspace)
                                                }
                                            >
                                                <Pencil size={16} />
                                                Editar
                                            </button>
                                        )}

                                        {workspace.role === "OWNER" && (
                                            <button
                                                type="button"
                                                className="btn workspace-delete"
                                                onClick={() =>
                                                    void deleteWorkspace(workspace)
                                                }
                                                disabled={isBusy}
                                            >
                                                <Trash2 size={16} />
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

export default function EspaciosPage() {
    return (
        <div className="animate-fade">
            <h1>Espacios de trabajo</h1>

            <p
                style={{
                    color: "var(--text-muted)",
                    marginBottom: "1.5rem",
                }}
            >
                Administrá tus espacios personales y compartidos.
            </p>

            <EspaciosABM />
        </div>
    );
}
