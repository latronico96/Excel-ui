'use client';

import { useState, useEffect } from 'react';
import { CATEGORIES, PAYMENT_METHODS } from '@/shared/constants';
import { Movement } from '@/shared/types';
import { Plus, Loader2 } from 'lucide-react';

export default function MovimientosPage() {
    const [movements, setMovements] = useState<Movement[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'INGRESO',
        paymentMethod: 'EFECTIVO',
        grossAmount: '',
        commissionPercentage: '0',
        category: 'Ventas',
        observations: ''
    });

    const fetchMovements = async () => {
        try {
            const res = await fetch('/api/movimientos');
            const data = await res.json();
            if (Array.isArray(data)) setMovements(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovements();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const gross = parseFloat(formData.grossAmount);
        const commPct = parseFloat(formData.commissionPercentage);
        const commAmt = (gross * commPct) / 100;
        const net = gross - commAmt;

        const movement: Movement = {
            ...formData as any,
            grossAmount: gross,
            commissionPercentage: commPct,
            commissionAmount: commAmt,
            netAmount: net,
        };

        try {
            const res = await fetch('/api/movimientos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movement),
            });
            if (res.ok) {
                setFormData({ ...formData, grossAmount: '', observations: '' });
                fetchMovements();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade">
            <h1>Movimientos Diarios</h1>

            <div className="card">
                <h3>Cargar Movimiento</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                    <div className="form-group">
                        <label>Fecha</label>
                        <input type="date" className="input" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Tipo</label>
                        <select className="select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                            <option value="INGRESO">Ingreso</option>
                            <option value="GASTO">Gasto</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Medio de Pago</label>
                        <select className="select" value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}>
                            {PAYMENT_METHODS.map(pm => <option key={pm.value} value={pm.value}>{pm.label}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Categoría</label>
                        <select className="select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Monto Bruto</label>
                        <input type="number" step="0.01" className="input" placeholder="0.00" value={formData.grossAmount} onChange={e => setFormData({ ...formData, grossAmount: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Comisión %</label>
                        <input type="number" step="0.1" className="input" placeholder="0" value={formData.commissionPercentage} onChange={e => setFormData({ ...formData, commissionPercentage: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Observaciones</label>
                        <input type="text" className="input" placeholder="Opcional..." value={formData.observations} onChange={e => setFormData({ ...formData, observations: e.target.value })} />
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card">
                <h3>Historial de Movimientos</h3>
                <div className="table-container">
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando movimientos desde Google Sheets...</div>
                    ) : movements.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay movimientos registrados.</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Categoría</th>
                                    <th>Medio de Pago</th>
                                    <th>Monto Bruto</th>
                                    <th>Comisión</th>
                                    <th>Neto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...movements].reverse().map((m, i) => (
                                    <tr key={i}>
                                        <td>{m.date}</td>
                                        <td><span className={`badge badge-${m.type.toLowerCase() === 'ingreso' ? 'income' : 'expense'}`}>{m.type}</span></td>
                                        <td>{m.category}</td>
                                        <td>
                                            <span className={`badge badge-pm-${m.paymentMethod.toLowerCase()}`}>
                                                {m.paymentMethod}
                                            </span>
                                        </td>
                                        <td>${m.grossAmount.toLocaleString()}</td>
                                        <td>${m.commissionAmount.toLocaleString()} ({m.commissionPercentage}%)</td>
                                        <td style={{ fontWeight: '600' }}>${m.netAmount.toLocaleString()}</td>
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
