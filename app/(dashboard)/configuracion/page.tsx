"use client";

import { useEffect, useState } from "react";
import {
    CheckCircle2,
    Loader2,
    Save,
    Settings,
} from "lucide-react";

interface Configuracion {
    defaultInvestmentPercentage: number;
    onboardingCompleted: boolean;
    titheEnabled: boolean;
    tithePercentage: number;
    titheBase:
        | "NET_INCOME"
        | "AFTER_INVESTMENT";
}

export default function ConfiguracionPage() {
    const [config, setConfig] =
        useState<Configuracion | null>(null);

    const [
        investmentPercentage,
        setInvestmentPercentage,
    ] = useState("");

    const [titheEnabled, setTitheEnabled] =
        useState(false);

    const [tithePercentage, setTithePercentage] =
        useState("10");

    const [titheBase, setTitheBase] =
        useState<
            "NET_INCOME" | "AFTER_INVESTMENT"
        >("NET_INCOME");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [messageType, setMessageType] =
        useState<
            "success" | "error" | ""
        >("");

    useEffect(() => {
        loadConfig();
    }, []);

    async function loadConfig() {
        try {
            setLoading(true);

            const response = await fetch(
                "/api/configuracion"
            );

            if (!response.ok) {
                throw new Error(
                    "No se pudo cargar la configuración"
                );
            }

            const data: Configuracion =
                await response.json();

            setConfig(data);

            setInvestmentPercentage(
                String(
                    data.defaultInvestmentPercentage
                )
            );

            setTitheEnabled(
                data.titheEnabled === true
            );

            setTithePercentage(
                String(
                    data.tithePercentage ?? 10
                )
            );

            setTitheBase(
                data.titheBase ===
                    "AFTER_INVESTMENT"
                    ? "AFTER_INVESTMENT"
                    : "NET_INCOME"
            );
        } catch (error) {
            console.error(error);

            setMessage(
                "No se pudo cargar la configuración."
            );

            setMessageType("error");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setMessage("");
        setMessageType("");

        const investment =
            Number(
                investmentPercentage
            );

        if (
            !Number.isFinite(investment) ||
            investment < 0 ||
            investment > 100
        ) {
            setMessage(
                "El porcentaje de inversión debe estar entre 0 y 100."
            );

            setMessageType("error");
            return;
        }

        const tithe =
            Number(tithePercentage);

        if (
            !Number.isFinite(tithe) ||
            tithe < 0 ||
            tithe > 100
        ) {
            setMessage(
                "El porcentaje de diezmo debe estar entre 0 y 100."
            );

            setMessageType("error");
            return;
        }

        try {
            setSaving(true);

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
                            tithe,

                        titheBase,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        "No se pudo guardar la configuración"
                );
            }

            setConfig(data);

            setInvestmentPercentage(
                String(
                    data.defaultInvestmentPercentage
                )
            );

            setTitheEnabled(
                data.titheEnabled === true
            );

            setTithePercentage(
                String(
                    data.tithePercentage ?? 10
                )
            );

            setTitheBase(
                data.titheBase ===
                    "AFTER_INVESTMENT"
                    ? "AFTER_INVESTMENT"
                    : "NET_INCOME"
            );

            setMessage(
                "Configuración guardada correctamente."
            );

            setMessageType("success");
        } catch (error) {
            console.error(error);

            setMessage(
                error instanceof Error
                    ? error.message
                    : "No se pudo guardar la configuración."
            );

            setMessageType("error");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="card">
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "center",
                        gap: "0.5rem",
                        padding: "2rem",
                        color:
                            "var(--text-muted)",
                    }}
                >
                    <Loader2
                        size={20}
                        className="animate-fade"
                    />

                    <span>
                        Cargando configuración...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="config-section animate-fade">
            {/* Header */}

            <div className="config-header">
                <div
                    style={{
                        display: "flex",
                        alignItems:
                            "center",
                        gap: "0.75rem",
                    }}
                >
                    <div
                        className="payment-method-icon"
                        style={{
                            width: 44,
                            height: 44,
                            flexShrink: 0,
                        }}
                    >
                        <Settings size={22} />
                    </div>

                    <div>
                        <h1>
                            Configuración
                        </h1>

                        <p>
                            Personalizá los valores
                            predeterminados de tu
                            negocio.
                        </p>
                    </div>
                </div>
            </div>

            {/* Preferencias */}

            <div className="card config-card">
                <div>
                    <h2>
                        Preferencias del negocio
                    </h2>

                    <p
                        style={{
                            marginTop:
                                "0.4rem",
                            color:
                                "var(--text-muted)",
                            fontSize:
                                "0.85rem",
                        }}
                    >
                        Estos valores se utilizarán
                        automáticamente al registrar
                        nuevos movimientos.
                    </p>
                </div>

                {/* Inversión */}

                <div className="config-field">
                    <label htmlFor="investmentPercentage">
                        Inversión predeterminada
                    </label>

                    <small>
                        Porcentaje de cada ingreso
                        que se propone inicialmente
                        como inversión.
                    </small>

                    <div
                        style={{
                            position:
                                "relative",
                            maxWidth: "260px",
                            marginTop:
                                "0.35rem",
                        }}
                    >
                        <input
                            id="investmentPercentage"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={
                                investmentPercentage
                            }
                            onChange={(event) =>
                                setInvestmentPercentage(
                                    event.target
                                        .value
                                )
                            }
                            className="input"
                            style={{
                                paddingRight:
                                    "3rem",
                                fontSize:
                                    "1.1rem",
                                fontWeight: 700,
                            }}
                        />

                        <span
                            style={{
                                position:
                                    "absolute",
                                right:
                                    "0.9rem",
                                top: "50%",
                                transform:
                                    "translateY(-50%)",
                                color:
                                    "var(--text-muted)",
                                fontWeight: 700,
                            }}
                        >
                            %
                        </span>
                    </div>
                </div>

                {/* Separador */}

                <div
                    style={{
                        height: "1px",
                        background:
                            "var(--border)",
                        margin:
                            "0.5rem 0",
                    }}
                />

                {/* Diezmo */}

                <div className="config-field">
                    <div
                        style={{
                            display: "flex",
                            alignItems:
                                "flex-start",
                            gap: "0.75rem",
                        }}
                    >
                        <input
                            id="titheEnabled"
                            type="checkbox"
                            checked={
                                titheEnabled
                            }
                            onChange={(event) =>
                                setTitheEnabled(
                                    event.target
                                        .checked
                                )
                            }
                            style={{
                                width: 18,
                                height: 18,
                                marginTop:
                                    "0.15rem",
                                flexShrink: 0,
                            }}
                        />

                        <div>
                            <label
                                htmlFor="titheEnabled"
                                style={{
                                    cursor:
                                        "pointer",
                                }}
                            >
                                Calcular diezmo
                                automáticamente
                            </label>

                            <small
                                style={{
                                    display:
                                        "block",
                                    marginTop:
                                        "0.25rem",
                                }}
                            >
                                Calcula automáticamente
                                el diezmo sobre cada
                                ingreso según la
                                configuración elegida.
                            </small>
                        </div>
                    </div>

                    {titheEnabled && (
                        <div
                            style={{
                                marginTop:
                                    "1rem",
                                display:
                                    "flex",
                                flexDirection:
                                    "column",
                                gap:
                                    "1rem",
                            }}
                        >
                            {/* Porcentaje */}

                            <div>
                                <label htmlFor="tithePercentage">
                                    Porcentaje de diezmo
                                </label>

                                <div
                                    style={{
                                        position:
                                            "relative",
                                        maxWidth:
                                            "260px",
                                        marginTop:
                                            "0.35rem",
                                    }}
                                >
                                    <input
                                        id="tithePercentage"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={
                                            tithePercentage
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setTithePercentage(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="input"
                                        style={{
                                            paddingRight:
                                                "3rem",
                                            fontSize:
                                                "1.1rem",
                                            fontWeight:
                                                700,
                                        }}
                                    />

                                    <span
                                        style={{
                                            position:
                                                "absolute",
                                            right:
                                                "0.9rem",
                                            top:
                                                "50%",
                                            transform:
                                                "translateY(-50%)",
                                            color:
                                                "var(--text-muted)",
                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        %
                                    </span>
                                </div>
                            </div>

                            {/* Base */}

                            <div>
                                <label htmlFor="titheBase">
                                    Calcular sobre
                                </label>

                                <small
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "0.25rem",
                                        marginBottom:
                                            "0.5rem",
                                    }}
                                >
                                    Elegí qué importe se
                                    utiliza como base para
                                    calcular el diezmo.
                                </small>

                                <select
                                    id="titheBase"
                                    value={
                                        titheBase
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setTitheBase(
                                            event
                                                .target
                                                .value as
                                                | "NET_INCOME"
                                                | "AFTER_INVESTMENT"
                                        )
                                    }
                                    className="input"
                                    style={{
                                        maxWidth:
                                            "420px",
                                    }}
                                >
                                    <option value="NET_INCOME">
                                        Ingreso neto
                                    </option>

                                    <option value="AFTER_INVESTMENT">
                                        Después de reinversión
                                    </option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Guardar */}

                <div className="config-actions">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="btn btn-primary"
                    >
                        {saving ? (
                            <Loader2
                                size={17}
                                className="animate-fade"
                            />
                        ) : (
                            <Save size={17} />
                        )}

                        {saving
                            ? "Guardando..."
                            : "Guardar cambios"}
                    </button>
                </div>
            </div>

            {/* Estado inicial */}

            <div
                className="card"
                style={{
                    marginTop: "1rem",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems:
                            "flex-start",
                        gap: "0.75rem",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                            borderRadius: 10,
                            background:
                                "var(--primary-light)",
                            color:
                                "var(--primary)",
                        }}
                    >
                        <CheckCircle2 size={20} />
                    </div>

                    <div
                        style={{
                            flex: 1,
                        }}
                    >
                        <h2>
                            Configuración inicial
                        </h2>

                        <p
                            style={{
                                marginTop:
                                    "0.4rem",
                                color:
                                    "var(--text-muted)",
                                fontSize:
                                    "0.85rem",
                            }}
                        >
                            Este estado se utilizará
                            cuando incorporemos la
                            pantalla de bienvenida y
                            configuración inicial.
                        </p>

                        <div
                            style={{
                                marginTop:
                                    "1rem",
                            }}
                        >
                            <span className="config-status">
                                <CheckCircle2
                                    size={14}
                                />

                                {config?.onboardingCompleted
                                    ? "Configuración inicial completada"
                                    : "Configuración inicial pendiente"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mensaje */}

            {message && (
                <div
                    style={{
                        marginTop:
                            "1rem",
                        padding:
                            "0.75rem 1rem",
                        borderRadius: "8px",
                        background:
                            messageType ===
                            "success"
                                ? "rgb(16 185 129 / 0.1)"
                                : "rgb(239 68 68 / 0.1)",
                        border:
                            `1px solid ${
                                messageType ===
                                "success"
                                    ? "rgb(16 185 129 / 0.2)"
                                    : "rgb(239 68 68 / 0.2)"
                            }`,
                        color:
                            messageType ===
                            "success"
                                ? "var(--success)"
                                : "var(--error)",
                        fontSize:
                            "0.85rem",
                        fontWeight: 600,
                    }}
                >
                    {message}
                </div>
            )}
        </div>
    );
}
