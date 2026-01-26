'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function RootPage() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/movimientos');
        }
    }, [status, router]);

    const handleLogin = () => {
        signIn('google', { callbackUrl: '/movimientos' });
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '1rem',
            backgroundColor: 'var(--bg)'
        }}>
            <div className="card animate-fade" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'rgba(197, 75, 140, 0.1)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'var(--primary)'
                    }}>
                        <LayoutDashboard size={32} />
                    </div>
                    <h1>{process.env.NEXT_PUBLIC_APP_TITLE || 'Tienda de Ropa - Gestión'}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Gestión inteligente de ingresos y gastos con Google Sheets.
                    </p>
                </div>

                <button onClick={handleLogin} className="btn btn-primary" style={{ width: '100%', gap: '10px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C9.03,19.27 6.59,16.74 6.59,13.5C6.59,10.26 9.03,7.73 12.19,7.73C14.1,7.73 15.4,8.47 16.32,9.34L18.4,7.26C16.89,5.84 14.75,5 12.19,5C7.5,5 3.5,8.81 3.5,13.5C3.5,18.19 7.5,22 12.19,22C16.88,22 21.5,18.43 21.5,13.5C21.5,12.7 21.4,11.83 21.35,11.1V11.1Z" />
                    </svg>
                    Iniciar sesión con Google
                </button>

                <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Al iniciar sesión, autorizas el acceso a Google Drive para crear y gestionar el archivo de datos.
                </p>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem' }}>
                    <a href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Política de Privacidad</a>
                    <a href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Términos de Servicio</a>
                </div>
            </div>
        </div>
    );
}
