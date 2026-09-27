"use client";

import { useEffect, useState } from "react";
import {
    ExpenseTypeOption,
    Movement,
    PaymentMethodOption,
} from "@/shared/types";

import EgresoForm from "./components/EgresoForm";
import IngresoForm from "./components/IngresoForm";
import MovimientosHistorial from "./components/MovimientosHistorial";

export default function MovimientosPage() {
    const [movements, setMovements] = useState<Movement[]>([]);
    const [expenseTypes, setExpenseTypes] = useState<
        ExpenseTypeOption[]
    >([]);
    const [paymentMethods, setPaymentMethods] = useState<
        PaymentMethodOption[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showIngresoForm, setShowIngresoForm] = useState(false);
    const [showEgresoForm, setShowEgresoForm] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                movementsRes,
                paymentMethodsRes,
                expenseTypesRes,
            ] = await Promise.all([
                fetch("/api/movimientos"),
                fetch("/api/medios-pago"),
                fetch("/api/tipos-gasto"),
            ]);

            if (!movementsRes.ok) {
                throw new Error(
                    "No se pudieron cargar los movimientos"
                );
            }

            if (!paymentMethodsRes.ok) {
                throw new Error(
                    "No se pudieron cargar los medios de pago"
                );
            }

            if (!expenseTypesRes.ok) {
                throw new Error(
                    "No se pudieron cargar los tipos de gasto"
                );
            }

            const [
                movementsData,
                paymentMethodsData,
                expenseTypesData,
            ] = await Promise.all([
                movementsRes.json(),
                paymentMethodsRes.json(),
                expenseTypesRes.json(),
            ]);

            const methods = Array.isArray(paymentMethodsData)
                ? paymentMethodsData
                : [];

            const types = Array.isArray(expenseTypesData)
                ? expenseTypesData
                : [];

            setMovements(
                Array.isArray(movementsData)
                    ? movementsData
                    : []
            );

            setPaymentMethods(methods);
            setExpenseTypes(types);
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Ocurrió un error al cargar los datos"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="animate-fade">
            <h1>Movimientos</h1>

            {error && (
                <div
                    className="card"
                    style={{
                        marginBottom: "1rem",
                        color: "var(--danger, #dc2626)",
                    }}
                >
                    {error}
                </div>
            )}


            <div
                style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginBottom: "1.5rem",
                    flexWrap: "wrap",
                }}
            >
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowIngresoForm((current) => !current)}
                >
                    + Nuevo ingreso
                </button>

                <button
                    type="button"
                    className="btn"
                    onClick={() => setShowEgresoForm((current) => !current)}
                >
                    + Nuevo egreso
                </button>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                }}
            >

                {showEgresoForm && (
                    <EgresoForm
                        paymentMethods={paymentMethods}
                        expenseTypes={expenseTypes}
                        loading={loading}
                        onSaved={fetchData}
                        onError={setError}
                    />
                )}

                {showIngresoForm && (
                    <IngresoForm
                        paymentMethods={paymentMethods}
                        loading={loading}
                        onSaved={fetchData}
                        onError={setError}
                    />
                )}
            </div>
            <MovimientosHistorial
                movements={movements}
                loading={loading}
            />
        </div >
    );
}
