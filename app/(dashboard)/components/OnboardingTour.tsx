
"use client";

import { useJoyride } from "react-joyride";

const steps = [
    {
        target: '[data-tour="workspace"]',
        title: "1. Espacio de trabajo",
        content:
            "Es el espacio donde se organiza la información. Pensalo como el lugar al que pertenecen los movimientos y la configuración compartida.",
        placement: "right" as const,
    },
    {
        target: '[data-tour="inicio"]',
        title: "2. Inicio",
        content:
            "Es el punto de entrada para consultar la información principal y orientarte dentro de la aplicación.",
        placement: "right" as const,
    },
    {
        target: '[data-tour="resumen"]',
        title: "3. Resumen",
        content:
            "Acá podés consultar los resultados y entender cómo se comportan tus ingresos y gastos según la información que registra la aplicación.",
        placement: "right" as const,
    },
    {
        target: '[data-tour="movimientos"]',
        title: "4. Movimientos",
        content:
            "Un movimiento es una operación económica: por ejemplo, un ingreso de dinero o un gasto. Es el registro básico con el que trabaja la aplicación.",
        placement: "right" as const,
    },
    {
        target: '[data-tour="gastos-mensuales"]',
        title: "5. Gastos mensuales",
        content:
            "Esta sección permite trabajar con gastos mensuales. El detalle del funcionamiento se explica mejor dentro de la propia pantalla.",
        placement: "right" as const,
    },
    {
        target: '[data-tour="tipos-gasto"]',
        title: "6. Tipos de gasto",
        content:
            "Son las categorías que permiten clasificar los gastos. Por ejemplo: supermercado, transporte o servicios, si tenés esas categorías configuradas.",
        placement: "right" as const,
    },
    {
        target: '[data-tour="medios-pago"]',
        title: "7. Medios de pago",
        content:
            "Representan cómo se pagó una operación, por ejemplo, efectivo, débito o transferencia, según los medios que tengas configurados.",
        placement: "right" as const,
    },
    {
        target: '[data-tour="miembros"]',
        title: "8. Miembros",
        content:
            "Acá se administra la participación de las personas en el espacio de trabajo. Los permisos concretos dependen de la configuración de tu aplicación.",
        placement: "right" as const,
    },
    {
        target: '[data-tour="espacios"]',
        title: "9. Espacios",
        content:
            "Un usuario puede trabajar con distintos espacios si tiene acceso a ellos. Cada espacio permite separar la información correspondiente.",
        placement: "right" as const,
    },
];

export default function OnboardingTour() {
    const { controls, Tour } = useJoyride({
        continuous: true,
        steps,
        locale: {
            back: "Anterior",
            close: "Cerrar",
            last: "Finalizar",
            next: "Siguiente",
            skip: "Saltar recorrido",
        },
        options: {
            primaryColor: "#2563eb",
            overlayColor: "rgba(15, 23, 42, 0.65)",
            zIndex: 10000,
            showProgress: true,
            buttons: ["back", "close", "primary", "skip"],
        },
    });

    return (
        <>
            <button
                type="button"
                onClick={() => controls.reset(true)}
                aria-label="Iniciar o volver a ver el recorrido guiado"
                style={{
                    position: "fixed",
                    left: 16,
                    bottom: 16,
                    zIndex: 9000,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--border, #d1d5db)",
                    background: "var(--card, #ffffff)",
                    color: "var(--foreground, #111827)",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                }}
            >
                ¿Cómo funciona?
            </button>

            {Tour}
        </>
    );
}
