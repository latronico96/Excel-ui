"use client";

import MediosPagoABM from "../movimientos/components/MediosPagoABM";

export default function MediosPagoPage() {
    return (
        <div className="animate-fade">
            <h1>Medios de pago</h1>

            <p
                style={{
                    color: "var(--text-muted)",
                    marginBottom: "1.5rem",
                }}
            >
                Administrá los medios de pago y sus comisiones
                predeterminadas.
            </p>

            <MediosPagoABM />
        </div>
    );
}
