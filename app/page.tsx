'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
    LayoutDashboard,
    TrendingUp,
    Receipt,
    Settings,
} from 'lucide-react';

export default function RootPage() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/hoy');
        }
    }, [status, router]);

    const handleLogin = () => {
        signIn('google', { callbackUrl: '/hoy' });
    };

    return (
        <main
            style={{
                minHeight: '100vh',
                backgroundColor: 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1rem',
            }}
        >
            <div
                className="animate-fade"
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    textAlign: 'center',
                }}
            >
                {/* Logo / icono */}
                <div
                    style={{
                        width: '72px',
                        height: '72px',
                        backgroundColor: 'var(--primary-light)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'var(--primary)',
                    }}
                >
                    <LayoutDashboard size={36} />
                </div>

                {/* Título */}
                <h1
                    style={{
                        marginBottom: '0.75rem',
                        fontSize: '2rem',
                    }}
                >
                    Excel Pro
                </h1>

                <p
                    style={{
                        color: 'var(--text-muted)',
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        marginBottom: '2rem',
                    }}
                >
                    Una forma simple de llevar el control de
                    <br />
                    los ingresos y gastos de tu negocio.
                </p>

                {/* Qué podés hacer */}
                <div
                    className="card"
                    style={{
                        textAlign: 'left',
                        marginBottom: '1.5rem',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.25rem',
                        }}
                    >
                        <TrendingUp
                            size={22}
                            color="var(--primary)"
                        />
                        <div>
                            <strong>Controlá tus ingresos</strong>
                            <p
                                style={{
                                    margin: '0.2rem 0 0',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                Registrá tus ventas y cobros.
                            </p>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.25rem',
                        }}
                    >
                        <Receipt
                            size={22}
                            color="var(--primary)"
                        />
                        <div>
                            <strong>Registrá tus gastos</strong>
                            <p
                                style={{
                                    margin: '0.2rem 0 0',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                Sabé en qué se está yendo tu dinero.
                            </p>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                        }}
                    >
                        <Settings
                            size={22}
                            color="var(--primary)"
                        />
                        <div>
                            <strong>Configurá tu negocio</strong>
                            <p
                                style={{
                                    margin: '0.2rem 0 0',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                Adaptá categorías, medios de pago y
                                preferencias.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Login */}
                <button
                    onClick={handleLogin}
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        gap: '10px',
                        minHeight: '48px',
                        fontSize: '0.95rem',
                    }}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C9.03,19.27 6.59,16.74 6.59,13.5C6.59,10.26 9.03,7.73 12.19,7.73C14.1,7.73 15.4,8.47 16.32,9.34L18.4,7.26C16.89,5.84 14.75,5 12.19,5C7.5,5 3.5,8.81 3.5,13.5C3.5,18.19 7.5,22 12.19,22C16.88,22 21.5,18.43 21.5,13.5C21.5,12.7 21.4,11.83 21.35,11.1V11.1Z" />
                    </svg>

                    Continuar con Google
                </button>

                <p
                    style={{
                        marginTop: '1rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                    }}
                >
                    Iniciá sesión para guardar y consultar
                    la información de tu negocio.
                </p>

                {/* Footer */}
                <div
                    style={{
                        marginTop: '2rem',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1rem',
                        fontSize: '0.75rem',
                    }}
                >
                    <a
                        href="/privacy"
                        style={{
                            color: 'var(--text-muted)',
                            textDecoration: 'underline',
                        }}
                    >
                        Política de Privacidad
                    </a>

                    <a
                        href="/terms"
                        style={{
                            color: 'var(--text-muted)',
                            textDecoration: 'underline',
                        }}
                    >
                        Términos de Servicio
                    </a>
                </div>
            </div>
        </main>
    );
}