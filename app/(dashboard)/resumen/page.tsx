'use client';

import { useState, useEffect } from 'react';
import { DailySummary } from '@/shared/types';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

export default function ResumenPage() {
    const [summary, setSummary] = useState<DailySummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await fetch('/api/resumen');
                const data = await res.json();
                if (Array.isArray(data)) setSummary(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const totalNet = summary.reduce((acc, curr) => acc + curr.netDaily, 0);
    const totalIncome = summary.reduce((acc, curr) => acc + curr.totalIncome, 0);
    const totalExpense = summary.reduce((acc, curr) => acc + curr.totalExpenses, 0);

    return (
        <div className="animate-fade">
            <h1>Resumen de Cuenta</h1>

            <div className="summary-grid">
                <div className="card" style={{ marginBottom: 0 }}>
                    <div className="summary-card-title">Balance Total Neto</div>
                    <div className="summary-card-value" style={{ color: totalNet >= 0 ? 'var(--success)' : 'var(--error)' }}>
                        <DollarSign size={20} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {totalNet.toLocaleString()}
                    </div>
                </div>
                <div className="card" style={{ marginBottom: 0 }}>
                    <div className="summary-card-title">Total Ingresos</div>
                    <div className="summary-card-value" style={{ color: 'var(--success)' }}>
                        <TrendingUp size={20} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {totalIncome.toLocaleString()}
                    </div>
                </div>
                <div className="card" style={{ marginBottom: 0 }}>
                    <div className="summary-card-title">Total Gastos</div>
                    <div className="summary-card-value" style={{ color: 'var(--error)' }}>
                        <TrendingDown size={20} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {totalExpense.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>Desglose Diario</h3>
                <div className="table-container">
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Calculando resumen...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Ingresos</th>
                                    <th>Gastos</th>
                                    <th>Neto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.map((s, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Calendar size={16} color="var(--text-muted)" />
                                                {s.date}
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--success)' }}>+${s.totalIncome.toLocaleString()}</td>
                                        <td style={{ color: 'var(--error)' }}>-${s.totalExpenses.toLocaleString()}</td>
                                        <td style={{ fontWeight: '700' }}>
                                            <span style={{ color: s.netDaily >= 0 ? 'var(--success)' : 'var(--error)' }}>
                                                ${s.netDaily.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
