"use client";

import { useEffect, useState } from "react";
import {
    Calendar,
    Check,
    Pencil,
    Plus,
    Power,
    X,
    CreditCard,
    DollarSign,
    Receipt,
} from "lucide-react";

interface ExpenseTypeOption {
    id: string;
    name: string;
    active: boolean;
}

interface PaymentMethodOption {
    id: string;
    name: string;
    active: boolean;
}

interface LastPayment {
    id: string;
    amount: number;
    paidAt: string;
    period: string;
}

interface RecurringExpense {
    id: string;
    name: string;
    amount: number | null;
    dueDay: number | null;
    active: boolean;

    expenseTypeId: string;
    paymentMethodId: string;

    expenseType: {
        id: string;
        name: string;
    };

    paymentMethod: {
        id: string;
        name: string;
    };

    lastPayment: LastPayment | null;
}

interface PaymentForm {
    recurringExpenseId: string;
    period: string;
    amount: string;
    paidAt: string;
    paymentMethodId: string;
    updateAmount: boolean;
}

const formatMoney = (amount: number | null) => {
    if (amount === null) {
        return "Variable";
    }

    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

const formatDate = (date: string) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString("es-AR");
};

const getCurrentPeriod = () => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}`;
};

const getToday = () => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const formatPeriod = (period: string) => {
    const [year, month] = period.split("-");

    if (!year || !month) {
        return period;
    }

    const date = new Date(
        Number(year),
        Number(month) - 1,
        1
    );

    return date.toLocaleDateString("es-AR", {
        month: "long",
        year: "numeric",
    });
};

export default function GastosMensualesABM() {
    const [recurringExpenses, setRecurringExpenses] = useState<
        RecurringExpense[]
    >([]);

    const [expenseTypes, setExpenseTypes] = useState<
        ExpenseTypeOption[]
    >([]);

    const [paymentMethods, setPaymentMethods] = useState<
        PaymentMethodOption[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [paying, setPaying] = useState(false);

    const [error, setError] = useState("");

    // Formulario de gasto mensual
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(
        null
    );

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [dueDay, setDueDay] = useState("");
    const [expenseTypeId, setExpenseTypeId] = useState("");
    const [paymentMethodId, setPaymentMethodId] =
        useState("");

    // Modal de pago
    const [showPaymentForm, setShowPaymentForm] =
        useState(false);

    const [paymentForm, setPaymentForm] =
        useState<PaymentForm>({
            recurringExpenseId: "",
            period: getCurrentPeriod(),
            amount: "",
            paidAt: getToday(),
            paymentMethodId: "",
            updateAmount: true,
        });

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                recurringExpensesRes,
                expenseTypesRes,
                paymentMethodsRes,
            ] = await Promise.all([
                fetch("/api/gastos-mensuales?all=true"),
                fetch("/api/tipos-gasto?all=true"),
                fetch("/api/medios-pago?all=true"),
            ]);

            const [
                recurringExpensesData,
                expenseTypesData,
                paymentMethodsData,
            ] = await Promise.all([
                recurringExpensesRes.json(),
                expenseTypesRes.json(),
                paymentMethodsRes.json(),
            ]);

            if (!recurringExpensesRes.ok) {
                throw new Error(
                    recurringExpensesData.error ||
                    "No se pudieron cargar los gastos mensuales"
                );
            }

            if (!expenseTypesRes.ok) {
                throw new Error(
                    expenseTypesData.error ||
                    "No se pudieron cargar los tipos de gasto"
                );
            }

            if (!paymentMethodsRes.ok) {
                throw new Error(
                    paymentMethodsData.error ||
                    "No se pudieron cargar los medios de pago"
                );
            }

            setRecurringExpenses(
                Array.isArray(recurringExpensesData)
                    ? recurringExpensesData
                    : []
            );

            setExpenseTypes(
                Array.isArray(expenseTypesData)
                    ? expenseTypesData.filter(
                        (item) => item.active
                    )
                    : []
            );

            setPaymentMethods(
                Array.isArray(paymentMethodsData)
                    ? paymentMethodsData.filter(
                        (item) => item.active
                    )
                    : []
            );
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudieron cargar los gastos mensuales"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setName("");
        setAmount("");
        setDueDay("");
        setExpenseTypeId(
            expenseTypes[0]?.id ?? ""
        );
        setPaymentMethodId(
            paymentMethods[0]?.id ?? ""
        );
        setError("");
        setShowForm(true);
    };

    const openEdit = (expense: RecurringExpense) => {
        setEditingId(expense.id);
        setName(expense.name);
        setAmount(
            expense.amount !== null
                ? String(expense.amount)
                : ""
        );
        setDueDay(
            expense.dueDay !== null
                ? String(expense.dueDay)
                : ""
        );
        setExpenseTypeId(expense.expenseTypeId);
        setPaymentMethodId(
            expense.paymentMethodId
        );
        setError("");
        setShowForm(true);
    };

    const closeForm = () => {
        if (saving) {
            return;
        }

        setShowForm(false);
        setEditingId(null);
        setName("");
        setAmount("");
        setDueDay("");
        setExpenseTypeId("");
        setPaymentMethodId("");
        setError("");
    };

    const handleSave = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Ingresá un nombre.");
            return;
        }

        if (!expenseTypeId) {
            setError(
                "Seleccioná un tipo de gasto."
            );
            return;
        }

        if (!paymentMethodId) {
            setError(
                "Seleccioná un medio de pago."
            );
            return;
        }

        const parsedAmount = amount.trim()
            ? Number(amount.replace(",", "."))
            : null;

        if (
            parsedAmount !== null &&
            (!Number.isFinite(parsedAmount) ||
                parsedAmount < 0)
        ) {
            setError("Ingresá un monto válido.");
            return;
        }

        const parsedDueDay = dueDay.trim()
            ? Number(dueDay)
            : null;

        if (
            parsedDueDay !== null &&
            (!Number.isInteger(parsedDueDay) ||
                parsedDueDay < 1 ||
                parsedDueDay > 31)
        ) {
            setError(
                "El día de vencimiento debe estar entre 1 y 31."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const res = await fetch(
                "/api/gastos-mensuales",
                {
                    method: editingId
                        ? "PATCH"
                        : "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(
                        editingId
                            ? {
                                id: editingId,
                                name: trimmedName,
                                amount: parsedAmount,
                                dueDay: parsedDueDay,
                                expenseTypeId,
                                paymentMethodId,
                            }
                            : {
                                name: trimmedName,
                                amount: parsedAmount,
                                dueDay: parsedDueDay,
                                expenseTypeId,
                                paymentMethodId,
                            }
                    ),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                    "No se pudo guardar el gasto mensual"
                );
            }

            if (editingId) {
                setRecurringExpenses(
                    (current) =>
                        current.map((expense) =>
                            expense.id ===
                                editingId
                                ? data
                                : expense
                        )
                );
            } else {
                setRecurringExpenses(
                    (current) =>
                        [...current, data].sort(
                            (a, b) =>
                                a.name.localeCompare(
                                    b.name,
                                    "es"
                                )
                        )
                );
            }

            closeForm();
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo guardar el gasto mensual"
            );
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (
        expense: RecurringExpense
    ) => {
        try {
            setError("");

            const res = await fetch(
                "/api/gastos-mensuales",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        id: expense.id,
                        active: !expense.active,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                    "No se pudo cambiar el estado"
                );
            }

            setRecurringExpenses(
                (current) =>
                    current.map((item) =>
                        item.id === expense.id
                            ? {
                                ...item,
                                active: data.active,
                            }
                            : item
                    )
            );
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo cambiar el estado"
            );
        }
    };

    const openPayment = (
        expense: RecurringExpense
    ) => {
        setError("");

        setPaymentForm({
            recurringExpenseId: expense.id,
            period: getCurrentPeriod(),
            amount:
                expense.amount !== null
                    ? String(expense.amount)
                    : "",
            paidAt: getToday(),
            paymentMethodId:
                expense.paymentMethodId ||
                paymentMethods[0]?.id ||
                "",
            updateAmount: true,
        });

        setShowPaymentForm(true);
    };

    const closePayment = () => {
        if (paying) {
            return;
        }

        setShowPaymentForm(false);
        setPaymentForm({
            recurringExpenseId: "",
            period: getCurrentPeriod(),
            amount: "",
            paidAt: getToday(),
            paymentMethodId: "",
            updateAmount: true,
        });
    };

    const handlePayment = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        const parsedAmount = Number(
            paymentForm.amount.replace(",", ".")
        );

        if (
            !Number.isFinite(parsedAmount) ||
            parsedAmount <= 0
        ) {
            setError(
                "Ingresá un monto de pago válido."
            );
            return;
        }

        if (!paymentForm.period) {
            setError("Seleccioná el período.");
            return;
        }

        if (!paymentForm.paidAt) {
            setError(
                "Seleccioná la fecha de pago."
            );
            return;
        }

        if (!paymentForm.paymentMethodId) {
            setError(
                "Seleccioná el medio de pago."
            );
            return;
        }

        try {
            setPaying(true);
            setError("");

            const res = await fetch(
                "/api/gastos-mensuales/pagar",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        recurringExpenseId:
                            paymentForm.recurringExpenseId,
                        period:
                            paymentForm.period,
                        amount: parsedAmount,
                        paidAt:
                            paymentForm.paidAt,
                        paymentMethodId:
                            paymentForm.paymentMethodId,
                        updateAmount:
                            paymentForm.updateAmount,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                    "No se pudo registrar el pago"
                );
            }

            /*
             * El backend devuelve el gasto mensual
             * actualizado, incluyendo el último pago.
             */
            setRecurringExpenses(
                (current) =>
                    current.map((expense) =>
                        expense.id ===
                            paymentForm.recurringExpenseId
                            ? data.recurringExpense
                            : expense
                    )
            );

            closePayment();
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo registrar el pago"
            );
        } finally {
            setPaying(false);
        }
    };

    const selectedPaymentExpense =
        recurringExpenses.find(
            (expense) =>
                expense.id ===
                paymentForm.recurringExpenseId
        );

    return (
        <div className="card">
            {/* Header */}
            <div className="abm-header">
                <div>
                    <h3 style={{ margin: 0 }}>
                        Gastos mensuales
                    </h3>

                    <p className="abm-subtitle">
                        Registrá tus gastos recurrentes y
                        llevá el control de sus pagos.
                    </p>
                </div>

                {!showForm && !showPaymentForm && (
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

            {/* Error */}
            {error && (
                <div className="abm-error">
                    {error}
                </div>
            )}

            {/* Formulario gasto mensual */}
            {showForm && (
                <form
                    onSubmit={handleSave}
                    className="abm-form"
                >
                    <div className="abm-form-header">
                        <h4 style={{ margin: 0 }}>
                            {editingId
                                ? "Editar gasto mensual"
                                : "Nuevo gasto mensual"}
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
                        <label htmlFor="recurring-expense-name">
                            Nombre
                        </label>

                        <input
                            id="recurring-expense-name"
                            className="input"
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }
                            placeholder="Ej: Internet"
                            maxLength={100}
                            autoFocus
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="recurring-expense-amount">
                            Monto habitual
                        </label>

                        <input
                            id="recurring-expense-amount"
                            className="input"
                            type="number"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) =>
                                setAmount(
                                    e.target.value
                                )
                            }
                            placeholder="Ej: 35000"
                            disabled={saving}
                        />

                        <small
                            style={{
                                color: "var(--text-muted)",
                            }}
                        >
                            Podés dejarlo vacío si el monto
                            cambia todos los meses.
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="recurring-expense-due-day">
                            Día de vencimiento
                        </label>

                        <input
                            id="recurring-expense-due-day"
                            className="input"
                            type="number"
                            min="1"
                            max="31"
                            value={dueDay}
                            onChange={(e) =>
                                setDueDay(
                                    e.target.value
                                )
                            }
                            placeholder="Ej: 10"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="recurring-expense-type">
                            Tipo de gasto
                        </label>

                        <select
                            id="recurring-expense-type"
                            className="select"
                            value={expenseTypeId}
                            onChange={(e) =>
                                setExpenseTypeId(
                                    e.target.value
                                )
                            }
                            disabled={saving}
                        >
                            <option value="">
                                Seleccioná un tipo
                            </option>

                            {expenseTypes.map(
                                (type) => (
                                    <option
                                        key={type.id}
                                        value={type.id}
                                    >
                                        {type.name}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="recurring-payment-method">
                            Medio de pago habitual
                        </label>

                        <select
                            id="recurring-payment-method"
                            className="select"
                            value={paymentMethodId}
                            onChange={(e) =>
                                setPaymentMethodId(
                                    e.target.value
                                )
                            }
                            disabled={saving}
                        >
                            <option value="">
                                Seleccioná un medio
                            </option>

                            {paymentMethods.map(
                                (method) => (
                                    <option
                                        key={method.id}
                                        value={method.id}
                                    >
                                        {method.name}
                                    </option>
                                )
                            )}
                        </select>
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
                            <Check size={18} />

                            {saving
                                ? "Guardando..."
                                : "Guardar"}
                        </button>
                    </div>
                </form>
            )}

            {/* Lista */}
            {loading ? (
                <div className="abm-empty">
                    Cargando gastos mensuales...
                </div>
            ) : recurringExpenses.length === 0 ? (
                <div className="abm-empty">
                    No hay gastos mensuales.
                </div>
            ) : (
                <div className="recurring-expense-grid">
                    {recurringExpenses.map((expense) => (
                        <div
                            key={expense.id}
                            className={`recurring-expense-card ${expense.active ? "" : "inactive"
                                }`}
                        >
                            {/* Header */}
                            <div className="recurring-expense-header">
                                <div className="recurring-expense-icon">
                                    <Receipt size={20} />
                                </div>

                                <div
                                    style={{
                                        minWidth: 0,
                                        flex: 1,
                                    }}
                                >
                                    <div className="recurring-expense-name">
                                        {expense.name}
                                    </div>

                                    <span
                                        className={`recurring-expense-status ${expense.active
                                                ? "active"
                                                : "inactive"
                                            }`}
                                    >
                                        {expense.active
                                            ? "Activo"
                                            : "Inactivo"}
                                    </span>
                                </div>
                            </div>

                            {/* Monto principal */}
                            <div className="recurring-expense-amount">
                                {formatMoney(expense.amount)}
                            </div>

                            {/* Datos */}
                            <div className="recurring-expense-details">
                                <div>
                                    <span>Vencimiento</span>
                                    <strong>
                                        {expense.dueDay
                                            ? `Día ${expense.dueDay}`
                                            : "Sin definir"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Medio</span>
                                    <strong>
                                        {expense.paymentMethod.name}
                                    </strong>
                                </div>

                                <div>
                                    <span>Tipo</span>
                                    <strong>
                                        {expense.expenseType.name}
                                    </strong>
                                </div>
                            </div>

                            {/* Último pago */}
                            <div className="recurring-expense-last-payment">
                                <div>
                                    <span>Último pago</span>

                                    {expense.lastPayment ? (
                                        <strong>
                                            {formatMoney(
                                                expense.lastPayment.amount
                                            )}
                                            <small>
                                                {" "}
                                                ·{" "}
                                                {formatDate(
                                                    expense.lastPayment.paidAt
                                                )}
                                            </small>
                                        </strong>
                                    ) : (
                                        <strong>Sin pagos registrados</strong>
                                    )}
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="recurring-expense-actions">
                                {expense.active && (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() =>
                                            openPayment(expense)
                                        }
                                    >
                                        <DollarSign size={16} />
                                        Pagar
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() =>
                                        openEdit(expense)
                                    }
                                >
                                    <Pencil size={16} />
                                    Editar
                                </button>

                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() =>
                                        toggleActive(expense)
                                    }
                                >
                                    <Power size={16} />
                                    {expense.active
                                        ? "Desactivar"
                                        : "Activar"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal / formulario de pago */}
            {showPaymentForm && (
                <div
                    className="recurring-payment-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="payment-modal-title"
                >
                    <div className="recurring-payment-modal">
                        <div className="abm-form-header">
                            <div>
                                <h4
                                    id="payment-modal-title"
                                    style={{
                                        margin: 0,
                                    }}
                                >
                                    Registrar pago
                                </h4>

                                {selectedPaymentExpense && (
                                    <p
                                        className="abm-subtitle"
                                        style={{
                                            marginBottom: 0,
                                        }}
                                    >
                                        {
                                            selectedPaymentExpense.name
                                        }
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closePayment
                                }
                                disabled={paying}
                                aria-label="Cerrar"
                                className="abm-close-button"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                handlePayment
                            }
                        >
                            <div className="form-group">
                                <label htmlFor="payment-period">
                                    Período
                                </label>

                                <input
                                    id="payment-period"
                                    className="input"
                                    type="month"
                                    value={
                                        paymentForm.period
                                    }
                                    onChange={(e) =>
                                        setPaymentForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                period: e
                                                    .target
                                                    .value,
                                            })
                                        )
                                    }
                                    disabled={paying}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="payment-amount">
                                    Total pagado
                                </label>

                                <input
                                    id="payment-amount"
                                    className="input"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={
                                        paymentForm.amount
                                    }
                                    onChange={(e) =>
                                        setPaymentForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                amount: e
                                                    .target
                                                    .value,
                                            })
                                        )
                                    }
                                    autoFocus
                                    disabled={paying}
                                />

                                {selectedPaymentExpense &&
                                    selectedPaymentExpense.amount !==
                                    null &&
                                    Number(
                                        paymentForm.amount
                                    ) !==
                                    selectedPaymentExpense.amount && (
                                        <small
                                            style={{
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            El monto
                                            habitual
                                            actual es{" "}
                                            {formatMoney(
                                                selectedPaymentExpense.amount
                                            )}
                                            .
                                        </small>
                                    )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="payment-date">
                                    Fecha de pago
                                </label>

                                <input
                                    id="payment-date"
                                    className="input"
                                    type="date"
                                    value={
                                        paymentForm.paidAt
                                    }
                                    onChange={(e) =>
                                        setPaymentForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                paidAt: e
                                                    .target
                                                    .value,
                                            })
                                        )
                                    }
                                    disabled={paying}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="payment-method">
                                    Medio de pago
                                </label>

                                <select
                                    id="payment-method"
                                    className="select"
                                    value={
                                        paymentForm.paymentMethodId
                                    }
                                    onChange={(e) =>
                                        setPaymentForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                paymentMethodId:
                                                    e
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    disabled={paying}
                                >
                                    <option value="">
                                        Seleccioná un medio
                                    </option>

                                    {paymentMethods.map(
                                        (
                                            method
                                        ) => (
                                            <option
                                                key={
                                                    method.id
                                                }
                                                value={
                                                    method.id
                                                }
                                            >
                                                {
                                                    method.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <label className="recurring-payment-update-option">
                                <input
                                    type="checkbox"
                                    checked={
                                        paymentForm.updateAmount
                                    }
                                    onChange={(e) =>
                                        setPaymentForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                updateAmount:
                                                    e
                                                        .target
                                                        .checked,
                                            })
                                        )
                                    }
                                    disabled={paying}
                                />

                                <span>
                                    Actualizar el monto
                                    habitual para los
                                    próximos meses
                                </span>
                            </label>

                            <div className="recurring-payment-info">
                                <CreditCard
                                    size={20}
                                />
                                    Se registrará como un
                                    egreso y quedará
                                    asociado a este gasto
                                    mensual.
                            </div>

                            <div className="abm-form-actions">
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={
                                        closePayment
                                    }
                                    disabled={paying}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={paying}
                                >
                                    <Check
                                        size={18}
                                    />

                                    {paying
                                        ? "Registrando..."
                                        : "Registrar pago"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
