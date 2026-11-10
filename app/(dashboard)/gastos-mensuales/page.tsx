import GastosMensualesABM from "../movimientos/components/GastosMensualesABM";

export default function GastosMensualesPage() {
    return (
        <div>
            <div style={{ marginBottom: "1rem" }}>
                <h1 style={{ marginBottom: "0.25rem" }}>
                    Gastos mensuales
                </h1>

                <p
                    style={{
                        margin: 0,
                        color: "var(--text-muted)",
                    }}
                >
                    Administrá tus gastos recurrentes y
                    registrá sus pagos.
                </p>
            </div>

            <GastosMensualesABM />
        </div>
    );
}