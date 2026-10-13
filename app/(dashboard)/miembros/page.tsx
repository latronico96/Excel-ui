"use client";

import { useEffect, useState } from "react";
import {
    Users,
    Loader2,
    ShieldCheck,
    UserRound,
    RefreshCw,
    Link,
    Share2,
} from "lucide-react";
interface Member {
    id: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
}

interface MembersResponse {
    workspaceId: string;
    currentUserId: string;
    currentRole: "OWNER" | "ADMIN" | "MEMBER";
    members: Member[];
}

const roleLabels = {
    OWNER: "Propietario",
    ADMIN: "Administrador",
    MEMBER: "Miembro",
};

export default function MiembrosPage() {
    const [data, setData] = useState<MembersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [inviteLink, setInviteLink] = useState("");
    const [generatingInvite, setGeneratingInvite] = useState(false);
    const [inviteError, setInviteError] = useState("");
    const [inviteSuccess, setInviteSuccess] = useState("");

    async function loadMembers() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/miembros");

            if (!response.ok) {
                throw new Error(
                    "No se pudieron cargar los miembros."
                );
            }

            const result: MembersResponse =
                await response.json();

            setData(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ocurrió un error inesperado."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMembers();
    }, []);


    async function generateInviteLink() {
        setGeneratingInvite(true);
        setInviteError("");
        setInviteSuccess("");
        setInviteLink("");

        try {
            const response = await fetch("/api/miembros/invitaciones", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "No se pudo generar el enlace."
                );
            }

            setInviteLink(data.inviteUrl);
            setInviteSuccess("Enlace generado. Vence en 7 días.");
        } catch (error) {
            setInviteError(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al generar el enlace."
            );
        } finally {
            setGeneratingInvite(false);
        }
    }


    async function shareInviteLink() {
        if (!inviteLink) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Invitación a Excel Pro",
                    text: "Te invito a compartir este espacio de Excel Pro.",
                    url: inviteLink,
                });
            } else {
                await navigator.clipboard.writeText(inviteLink);
                setInviteSuccess("Enlace copiado al portapapeles.");
            }
        } catch (err) {
            if (err instanceof Error && err.name !== "AbortError") {
                setInviteError("No se pudo compartir el enlace.");
            }
        }
    }

    async function copyInviteLink() {
        if (!inviteLink) return;

        try {
            await navigator.clipboard.writeText(inviteLink);
            setInviteSuccess("Enlace copiado al portapapeles.");
            setInviteError("");
        } catch {
            setInviteError("No se pudo copiar el enlace.");
        }
    }

    return (
        <div className="animate-fade">
            <div className="abm-header">
                <div>
                    <h1 style={{ margin: 0 }}>
                        Miembros
                    </h1>

                    <p className="abm-subtitle">
                        Personas que tienen acceso a este espacio.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn"
                    onClick={loadMembers}
                    disabled={loading}
                >
                    <RefreshCw
                        size={17}
                        className={
                            loading ? "animate-spin" : ""
                        }
                    />
                    Actualizar
                </button>
            </div>

            {error && (
                <div className="abm-error">
                    <p style={{ margin: 0 }}>{error}</p>

                    <button
                        type="button"
                        className="btn"
                        onClick={loadMembers}
                        style={{ marginTop: "0.75rem" }}
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {loading ? (
                <div className="abm-empty">
                    <Loader2
                        size={20}
                        className="animate-spin"
                    />
                    Cargando miembros...
                </div>
            ) : !error ? (
                <>
                    <div
                        className="card"
                        style={{
                            marginBottom: "1.5rem",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                            }}
                        >
                            <div
                                style={{
                                    width: "42px",
                                    height: "42px",
                                    borderRadius: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "var(--primary-soft)",
                                    color: "var(--primary)",
                                }}
                            >
                                <ShieldCheck size={21} />
                            </div>

                            <div>
                                <p
                                    style={{
                                        margin: 0,
                                        color: "var(--text-muted)",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    Tu rol en este espacio
                                </p>

                                <strong>
                                    {data
                                        ? roleLabels[data.currentRole]
                                        : "—"}
                                </strong>
                            </div>
                        </div>
                    </div>
                    <div className="card" style={{ marginBottom: "1.5rem" }}>
                        <div className="abm-header">
                            <div>
                                <h3 style={{ margin: 0 }}>
                                    Invitar a otra persona
                                </h3>

                                <p className="abm-subtitle">
                                    Compartí el acceso a este espacio sin enviar emails.
                                </p>
                            </div>

                            <Link size={22} />
                        </div>

                        {!inviteLink ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={generateInviteLink}
                                disabled={generatingInvite}
                            >
                                {generatingInvite ? (
                                    <Loader2 size={17} className="animate-spin" />
                                ) : (
                                    <Link size={17} />
                                )}

                                {generatingInvite
                                    ? "Generando..."
                                    : "Generar enlace"}
                            </button>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label htmlFor="invite-link">
                                        Enlace de invitación
                                    </label>

                                    <input
                                        id="invite-link"
                                        className="input"
                                        type="text"
                                        value={inviteLink}
                                        readOnly
                                    />
                                </div>

                                <div className="abm-form-actions">
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={copyInviteLink}
                                    >
                                        <Link size={17} />
                                        Copiar enlace
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={shareInviteLink}
                                    >
                                        <Share2 size={17} />
                                        Compartir
                                    </button>
                                </div>
                            </>
                        )}

                        {inviteError && (
                            <div className="abm-error" style={{ marginTop: "1rem" }}>
                                {inviteError}
                            </div>
                        )}

                        {inviteSuccess && (
                            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                                {inviteSuccess}
                            </p>
                        )}
                    </div>
                    <div className="card">
                        <div className="abm-header">
                            <div>
                                <h3 style={{ margin: 0 }}>
                                    Integrantes
                                </h3>

                                <p className="abm-subtitle">
                                    Personas que forman parte del espacio.
                                </p>
                            </div>

                            <span
                                style={{
                                    padding: "0.35rem 0.75rem",
                                    borderRadius: "999px",
                                    background: "var(--bg-secondary)",
                                    color: "var(--text-muted)",
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                }}
                            >
                                {data?.members.length ?? 0}
                            </span>
                        </div>

                        {!data?.members.length ? (
                            <div className="abm-empty">
                                No hay miembros para mostrar.
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: "grid",
                                    gap: "0.75rem",
                                }}
                            >
                                {data.members.map((member) => (
                                    <div
                                        key={member.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.75rem",
                                            padding: "0.9rem",
                                            border: "1px solid var(--border)",
                                            borderRadius: "10px",
                                        }}
                                    >
                                        {member.user.image ? (
                                            <img
                                                src={member.user.image}
                                                alt=""
                                                style={{
                                                    width: "44px",
                                                    height: "44px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    flexShrink: 0,
                                                }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: "44px",
                                                    height: "44px",
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    background:
                                                        "var(--bg-secondary)",
                                                    color: "var(--text-muted)",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <UserRound size={21} />
                                            </div>
                                        )}

                                        <div
                                            style={{
                                                minWidth: 0,
                                                flex: 1,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {member.user.name ||
                                                    "Sin nombre"}

                                                {member.user.id ===
                                                    data.currentUserId && (
                                                        <span
                                                            style={{
                                                                marginLeft:
                                                                    "0.5rem",
                                                                fontSize:
                                                                    "0.75rem",
                                                                fontWeight: 400,
                                                                color: "var(--text-muted)",
                                                            }}
                                                        >
                                                            (Vos)
                                                        </span>
                                                    )}
                                            </div>

                                            <div
                                                style={{
                                                    color: "var(--text-muted)",
                                                    fontSize: "0.875rem",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {member.user.email}
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: "0.2rem",
                                                    color: "var(--text-muted)",
                                                    fontSize: "0.75rem",
                                                }}
                                            >
                                                Desde{" "}
                                                {new Date(
                                                    member.createdAt
                                                ).toLocaleDateString(
                                                    "es-AR"
                                                )}
                                            </div>
                                        </div>

                                        <span
                                            style={{
                                                flexShrink: 0,
                                                padding:
                                                    "0.35rem 0.7rem",
                                                borderRadius:
                                                    "999px",
                                                background:
                                                    "var(--bg-secondary)",
                                                color:
                                                    "var(--text-muted)",
                                                fontSize:
                                                    "0.75rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {roleLabels[member.role]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}