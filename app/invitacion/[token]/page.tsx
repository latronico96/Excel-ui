
"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowRight,
    CheckCircle2,
    LoaderCircle,
    Users,
    Wallet,
    XCircle,
} from "lucide-react";

type InvitationInfo = {
    valid: boolean;
    workspaceName?: string;
    error?: string;
};

export default function InvitationPage() {
    const params = useParams<{ token: string }>();
    const token = params.token;
    const router = useRouter();
    const { status } = useSession();

    const [invitation, setInvitation] =
        useState<InvitationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [signingIn, setSigningIn] = useState(false);
    const [accepting, setAccepting] = useState(false);
    const [acceptError, setAcceptError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function validateInvitation() {
            try {
                const response = await fetch(
                    `/api/miembros/invitaciones/${encodeURIComponent(token)}`
                );
                const data: InvitationInfo = await response.json();

                if (!cancelled) {
                    setInvitation(data);
                }
            } catch {
                if (!cancelled) {
                    setInvitation({
                        valid: false,
                        error: "No pudimos verificar la invitación. Probá nuevamente.",
                    });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (token) {
            validateInvitation();
        } else {
            setInvitation({
                valid: false,
                error: "El enlace de invitación no es válido.",
            });
            setLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, [token]);

    async function handleContinue() {
        setSigningIn(true);

        try {
            await signIn("google", {
                callbackUrl: `/invitacion/${encodeURIComponent(token)}`,
            });
        } catch {
            setSigningIn(false);
        }
    }

    async function handleAcceptInvitation() {
        setAccepting(true);
        setAcceptError("");

        try {
            const response = await fetch(
                `/api/miembros/invitaciones/${encodeURIComponent(token)}/accept`,
                { method: "POST" }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "No se pudo aceptar la invitación."
                );
            }

            router.replace("/hoy");
            router.refresh();
        } catch (error) {
            setAcceptError(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al aceptar la invitación."
            );
        } finally {
            setAccepting(false);
        }
    }

    const isChecking = loading || status === "loading";

    return (
        <main
            style={{
                minHeight: "100vh",
                background: "var(--bg)",
                color: "var(--text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 20px",
            }}
        >
            <div style={{ width: "100%", maxWidth: 420 }}>
                <header
                    style={{
                        textAlign: "center",
                        marginBottom: 28,
                    }}
                >
                    <div
                        style={{
                            width: 54,
                            height: 54,
                            margin: "0 auto 16px",
                            borderRadius: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "var(--primary-light)",
                            color: "var(--primary)",
                        }}
                    >
                        <Wallet size={27} strokeWidth={1.8} />
                    </div>

                    <p
                        style={{
                            margin: 0,
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            color: "var(--primary)",
                        }}
                    >
                        EXCEL PRO
                    </p>

                    <h1
                        style={{
                            margin: "10px 0 8px",
                            fontSize: "clamp(25px, 5vw, 30px)",
                            lineHeight: 1.2,
                            letterSpacing: "-0.04em",
                            fontWeight: 750,
                        }}
                    >
                        Tus finanzas, en equipo
                    </h1>

                    <p
                        style={{
                            maxWidth: 330,
                            margin: "0 auto",
                            fontSize: 14,
                            lineHeight: 1.65,
                            color: "var(--text-muted)",
                        }}
                    >
                        Te invitaron a compartir un espacio en Excel Pro.
                        Aceptá la invitación para empezar.
                    </p>
                </header>

                <section
                    className="card"
                    style={{
                        padding: "28px 24px",
                        borderRadius: 16,
                    }}
                >
                    {isChecking ? (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "24px 0",
                            }}
                        >
                            <LoaderCircle
                                size={30}
                                className="animate-spin"
                                style={{
                                    color: "var(--primary)",
                                    margin: "0 auto 14px",
                                }}
                            />
                            <p style={{ margin: 0, fontWeight: 600 }}>
                                Verificando invitación
                            </p>
                            <p
                                style={{
                                    margin: "8px 0 0",
                                    fontSize: 13,
                                    color: "var(--text-muted)",
                                }}
                            >
                                Un momento, por favor...
                            </p>
                        </div>
                    ) : !invitation?.valid ? (
                        <div style={{ textAlign: "center", padding: "12px 0" }}>
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    margin: "0 auto 16px",
                                    borderRadius: "50%",
                                    background: "var(--primary-light)",
                                    color: "var(--primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <XCircle size={25} />
                            </div>

                            <h2 style={{ fontSize: 19, margin: "0 0 8px" }}>
                                Invitación no disponible
                            </h2>

                            <p
                                style={{
                                    fontSize: 14,
                                    lineHeight: 1.6,
                                    color: "var(--text-muted)",
                                    margin: 0,
                                }}
                            >
                                {invitation?.error ??
                                    "Este enlace ya no está disponible."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 14,
                                    padding: 16,
                                    borderRadius: 12,
                                    background: "var(--primary-light)",
                                    marginBottom: 22,
                                }}
                            >
                                <div
                                    style={{
                                        flexShrink: 0,
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        background: "var(--card-bg)",
                                        color: "var(--primary)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Users size={22} />
                                </div>

                                <div style={{ minWidth: 0 }}>
                                    <p
                                        style={{
                                            margin: "0 0 4px",
                                            fontSize: 12,
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        Te invitaron a
                                    </p>
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: 17,
                                            lineHeight: 1.35,
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {invitation.workspaceName}
                                    </h2>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 10,
                                    marginBottom: 24,
                                }}
                            >
                                <CheckCircle2
                                    size={19}
                                    style={{
                                        color: "var(--primary)",
                                        flexShrink: 0,
                                        marginTop: 2,
                                    }}
                                />
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 13,
                                        lineHeight: 1.65,
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    Vas a poder compartir la organización de
                                    los movimientos y las cuentas de este
                                    espacio.
                                </p>
                            </div>


                            {status === "authenticated" ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleAcceptInvitation}
                                        disabled={accepting}
                                        className="btn btn-primary"
                                        style={{
                                            width: "100%",
                                            minHeight: 46,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 10,
                                            borderRadius: 10,
                                        }}
                                    >
                                        {accepting ? (
                                            <>
                                                <LoaderCircle
                                                    size={18}
                                                    className="animate-spin"
                                                />
                                                Aceptando invitación...
                                            </>
                                        ) : (
                                            <>
                                                Aceptar invitación
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    {acceptError && (
                                        <p
                                            role="alert"
                                            style={{
                                                color: "#b42318",
                                                fontSize: 13,
                                                lineHeight: 1.5,
                                                marginTop: 12,
                                            }}
                                        >
                                            {acceptError}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleContinue}
                                        disabled={signingIn}
                                        className="btn btn-primary"
                                        style={{
                                            width: "100%",
                                            minHeight: 46,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 10,
                                            borderRadius: 10,
                                        }}
                                    >
                                        {signingIn ? (
                                            <>
                                                <LoaderCircle
                                                    size={18}
                                                    className="animate-spin"
                                                />
                                                Conectando...
                                            </>
                                        ) : (
                                            <>
                                                Continuar con Google
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    <p
                                        style={{
                                            margin: "14px 0 0",
                                            fontSize: 12,
                                            lineHeight: 1.5,
                                            textAlign: "center",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        Ingresá con tu cuenta de Google para continuar.
                                    </p>
                                </>
                            )}

                        </>
                    )}
                </section>

                <footer
                    style={{
                        marginTop: 22,
                        textAlign: "center",
                        fontSize: 12,
                        color: "var(--text-muted)",
                    }}
                >
                    Excel Pro · Tus finanzas, más organizadas.
                </footer>
            </div>
        </main>
    );
}
