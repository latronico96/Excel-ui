"use client";

import { useState } from "react";
import {
    ArrowRight,
    CheckCircle2,
    Percent,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const router = useRouter();

    const [step, setStep] = useState(1);

    const [investmentPercentage, setInvestmentPercentage] =
        useState("50");

    const [titheEnabled, setTitheEnabled] =
        useState(false);

    const [tithePercentage, setTithePercentage] =
        useState("10");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const validatePercentage = (
        value: string,
        fieldName: string
    ) => {
        const percentage = Number(value);

        if (
            Number.isNaN(percentage) ||
            percentage < 0 ||
            percentage > 100
        ) {
            setError(
                `${fieldName} debe estar entre 0 y 100.`
            );
            return false;
        }

        return true;
    };

    const handleContinue = () => {
        setError("");

        if (
            !validatePercentage(
                investmentPercentage,
                "El porcentaje de reinversión"
            )
        ) {
            return;
        }

        if (
            titheEnabled &&
            !validatePercentage(
                tithePercentage,
                "El porcentaje de diezmo"
            )
        ) {
            return;
        }

        setStep(3);
    };

    const finishOnboarding = async () => {
        try {
            setSaving(true);
            setError("");

            const investment = Number(
                investmentPercentage
            );

            const tithe = Number(tithePercentage);

            if (
                Number.isNaN(investment) ||
                investment < 0 ||
                investment > 100
            ) {
                throw new Error(
                    "El porcentaje de reinversión debe estar entre 0 y 100."
                );
            }

            if (
                titheEnabled &&
                (Number.isNaN(tithe) ||
                    tithe < 0 ||
                    tithe > 100)
            ) {
                throw new Error(
                    "El porcentaje de diezmo debe estar entre 0 y 100."
                );
            }

            const response = await fetch(
                "/api/configuracion",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        defaultInvestmentPercentage:
                            investment,
                        titheEnabled,
                        tithePercentage:
                            titheEnabled
                                ? tithe
                                : 0,
                        titheBase: "NET_INCOME",
                        onboardingCompleted: true,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        "No se pudo guardar la configuración."
                );
            }

            router.push("/hoy");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ocurrió un error."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
                background: "var(--bg)",
            }}
        >
            <div
                className="card"
                style={{
                    width: "100%",
                    maxWidth: "520px",
                }}
            >
                {step === 1 && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "1rem",
                        }}
                    >
                        <CheckCircle2
                            size={52}
                            color="var(--primary)"
                            style={{
                                marginBottom: "1rem",
                            }}
                        />

                        <h1>¡Bienvenido!</h1>

                        <p
                            style={{
                                color:
                                    "var(--text-muted)",
                                lineHeight: 1.6,
                            }}
                        >
                            Vamos a configurar algunas
                            cosas para que puedas empezar
                            a llevar las cuentas de tu
                            negocio.
                        </p>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                                setError("");
                                setStep(2);
                            }}
                            style={{
                                marginTop: "1.5rem",
                                width: "100%",
                            }}
                        >
                            Empezar
                            <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <div
                            style={{
                                textAlign: "center",
                                marginBottom: "1.5rem",
                            }}
                        >
                            <Percent
                                size={42}
                                color="var(--primary)"
                            />

                            <h2>
                                Configuración inicial
                            </h2>

                            <p
                                style={{
                                    color:
                                        "var(--text-muted)",
                                }}
                            >
                                Definí cuánto querés
                                reservar para reinvertir
                                y, si querés, el porcentaje
                                de diezmo.
                            </p>
                        </div>

                        {/* REINVERSIÓN */}
                        <div className="form-group">
                            <label>
                                Reinversión del negocio
                            </label>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                }}
                            >
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    className="input"
                                    value={
                                        investmentPercentage
                                    }
                                    onChange={(e) => {
                                        setInvestmentPercentage(
                                            e.target.value
                                        );
                                        setError("");
                                    }}
                                />

                                <strong>%</strong>
                            </div>

                            <small
                                style={{
                                    color:
                                        "var(--text-muted)",
                                }}
                            >
                                Porcentaje predeterminado
                                de tus ingresos netos que
                                querés reservar para
                                reinvertir.
                            </small>
                        </div>

                        {/* DIEZMO */}
                        <div
                            className="form-group"
                            style={{
                                marginTop: "1.5rem",
                            }}
                        >
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    cursor: "pointer",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={titheEnabled}
                                    onChange={(e) => {
                                        setTitheEnabled(
                                            e.target.checked
                                        );
                                        setError("");
                                    }}
                                />

                                Separar diezmo
                            </label>

                            {titheEnabled && (
                                <div
                                    style={{
                                        marginTop:
                                            "0.75rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems:
                                                "center",
                                            gap: "0.75rem",
                                        }}
                                    >
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="1"
                                            className="input"
                                            value={
                                                tithePercentage
                                            }
                                            onChange={(
                                                e
                                            ) => {
                                                setTithePercentage(
                                                    e.target
                                                        .value
                                                );
                                                setError(
                                                    ""
                                                );
                                            }}
                                        />

                                        <strong>%</strong>
                                    </div>

                                    <small
                                        style={{
                                            color:
                                                "var(--text-muted)",
                                        }}
                                    >
                                        Se calculará sobre
                                        el ingreso neto.
                                    </small>
                                </div>
                            )}
                        </div>

                        {error && (
                            <p
                                style={{
                                    color:
                                        "var(--error)",
                                    marginTop:
                                        "1rem",
                                }}
                            >
                                {error}
                            </p>
                        )}

                        <div
                            style={{
                                display: "flex",
                                gap: "0.75rem",
                                marginTop: "1.5rem",
                            }}
                        >
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => {
                                    setError("");
                                    setStep(1);
                                }}
                                disabled={saving}
                            >
                                Atrás
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={
                                    handleContinue
                                }
                                disabled={saving}
                                style={{
                                    flex: 1,
                                }}
                            >
                                Continuar
                                <ArrowRight
                                    size={18}
                                />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "1rem",
                        }}
                    >
                        <CheckCircle2
                            size={56}
                            color="var(--success)"
                        />

                        <h2>¡Todo listo!</h2>

                        <p
                            style={{
                                color:
                                    "var(--text-muted)",
                                lineHeight: 1.6,
                            }}
                        >
                            Tu configuración inicial está
                            lista. Ya podés empezar a
                            registrar los movimientos de
                            tu negocio.
                        </p>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={
                                finishOnboarding
                            }
                            disabled={saving}
                            style={{
                                width: "100%",
                                marginTop: "1.5rem",
                            }}
                        >
                            {saving
                                ? "Guardando..."
                                : "Empezar a usar la aplicación"}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
