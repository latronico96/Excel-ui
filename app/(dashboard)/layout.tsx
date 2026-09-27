'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Receipt,
    PieChart,
    Tags,
    LogOut,
} from 'lucide-react';
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Cargando...</div>;
    }

    if (status === 'unauthenticated') return null;

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LayoutDashboard size={24} color="var(--primary)" />
                        {process.env.NEXT_PUBLIC_APP_TITLE || 'Mi Comercio'}
                    </h2>
                    <nav className="sidebar-nav">
                        <Link href="/movimientos" className={`nav-link ${pathname === '/movimientos' ? 'active' : ''}`}>
                            <Receipt size={20} />
                            Movimientos
                        </Link>
                        <Link href="/tipos-gasto" className={`nav-link ${pathname === '/tipos-gasto' ? 'active' : ''}`}>
                            <Tags size={20} />
                            Tipos de gasto
                        </Link>
                        <Link href="/resumen" className={`nav-link ${pathname === '/resumen' ? 'active' : ''}`}>
                            <PieChart size={20} />
                            Resumen
                        </Link>
                    </nav>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="nav-link"
                        style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                    >
                        <LogOut size={20} />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
