"use client";

import TiposGastoABM from "../movimientos/components/TiposGastoABM";

export default function TiposGastoPage() {
    return (
        <div className="animate-fade">
            <h1>Tipos de gasto</h1>

            <p
                style={{
                    color: "var(--text-muted)",
                    marginBottom: "1.5rem",
                }}
            >
                Administrá las categorías que podés usar en tus egresos.
            </p>

            <TiposGastoABM />
        </div>
    );
}