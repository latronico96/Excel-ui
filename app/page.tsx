'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    ArrowRight,
    LayoutDashboard,
    CreditCard,
    Lock,
    Receipt,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import styles from './page.module.css';

export default function RootPage() {
    const { status } = useSession();
    const router = useRouter();
    const [demoLoading, setDemoLoading] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [demoError, setDemoError] = useState('');

    useEffect(() => {
        if (status === 'authenticated') {
            router.replace('/hoy');
        }
    }, [status, router]);

    const handleLogin = async () => {
        setLoginLoading(true);
        await signIn('google', { callbackUrl: '/hoy' });
    };

    const handleDemoLogin = async () => {
        setDemoError('');
        setDemoLoading(true);

        try {
            const response = await fetch('/api/auth/demo', { method: 'POST' });

            if (!response.ok) {
                throw new Error('No se pudo iniciar la demo. Probá de nuevo en unos segundos.');
            }

            window.location.href = '/hoy';
        } catch {
            setDemoError('No se pudo iniciar la demo. Probá de nuevo en unos segundos.');
            setDemoLoading(false);
        }
    };

    if (status === 'loading' || status === 'authenticated') {
        return (
            <main className={styles.loadingScreen}>
                <div className={styles.loadingMark}>
                    <LayoutDashboard size={25} />
                </div>
                <p>Preparando tus finanzas...</p>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <header className={styles.nav}>
                <a className={styles.brand} href="/" aria-label="Excel Pro, inicio">
                    <span className={styles.brandMark}>
                        <LayoutDashboard size={23} strokeWidth={2.2} />
                    </span>
                    <span>Excel <b>Pro</b></span>
                </a>

                <nav className={styles.navActions} aria-label="Navegación principal">
                    <a href="#funciones" className={styles.navLink}>Funciones</a>
                    <a href="#privacidad" className={styles.navLink}>Tu información</a>
                    <button
                        type="button"
                        className={styles.navLogin}
                        onClick={handleLogin}
                        disabled={loginLoading}
                    >
                        {loginLoading ? 'Conectando...' : 'Iniciar sesión'}
                    </button>
                </nav>
            </header>

            <section className={styles.hero}>
                <div className={styles.heroCopy}>
                    <div className={styles.eyebrow}>
                        <Sparkles size={15} aria-hidden="true" />
                        Tus finanzas, en orden
                    </div>

                    <h1>
                        Entendé tu dinero.
                        <span>Decidí con claridad.</span>
                    </h1>

                    <p className={styles.heroDescription}>
                        Registrá tus ingresos y gastos, revisá tus movimientos y entendé
                        mejor cómo usás tu plata. Todo organizado en un solo lugar.
                    </p>

                    <div className={styles.heroActions}>
                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={handleLogin}
                            disabled={loginLoading}
                        >
                            {loginLoading ? 'Conectando...' : 'Continuar con Google'}
                            <ArrowRight size={17} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={handleDemoLogin}
                            disabled={demoLoading}
                        >
                            {demoLoading ? 'Preparando demo...' : 'Explorar demo'}
                        </button>
                    </div>

                    {demoError && (
                        <p className={styles.errorMessage} role="alert">{demoError}</p>
                    )}

                    <div className={styles.trustNote}>
                        <Lock size={15} aria-hidden="true" />
                        <span>Entrá a tu cuenta o explorá un espacio de prueba.</span>
                    </div>
                </div>

                <div className={styles.previewWrap} aria-label="Vista ilustrativa del panel financiero">
                    <div className={styles.previewGlow} />
                    <div className={styles.previewCard}>
                        <div className={styles.previewHeader}>
                            <div>
                                <span className={styles.previewKicker}>RESUMEN FINANCIERO</span>
                                <h2>Así se ve tu plata</h2>
                            </div>
                            <span className={styles.monthPill}>Este mes</span>
                        </div>

                        <div className={styles.balanceCard}>
                            <span className={styles.balanceLabel}>Balance del período</span>
                            <strong>$ 530.000</strong>
                            <span className={styles.balanceHint}>
                                <TrendingUp size={14} aria-hidden="true" /> Ingresos menos gastos
                            </span>
                            <div className={styles.chart} aria-hidden="true">
                                <span style={{ height: '34%' }} />
                                <span style={{ height: '48%' }} />
                                <span style={{ height: '40%' }} />
                                <span style={{ height: '65%' }} />
                                <span style={{ height: '53%' }} />
                                <span style={{ height: '76%' }} />
                                <span style={{ height: '61%' }} />
                                <span style={{ height: '88%' }} />
                                <span style={{ height: '70%' }} />
                                <span style={{ height: '96%' }} />
                                <span style={{ height: '78%' }} />
                                <span style={{ height: '100%' }} />
                            </div>
                        </div>

                        <div className={styles.previewStats}>
                            <div className={styles.statCard}>
                                <span className={`${styles.statIcon} ${styles.incomeIcon}`}>
                                    <TrendingUp size={17} aria-hidden="true" />
                                </span>
                                <span className={styles.statLabel}>Ingresos</span>
                                <strong>$ 850.000</strong>
                            </div>
                            <div className={styles.statCard}>
                                <span className={`${styles.statIcon} ${styles.expenseIcon}`}>
                                    <TrendingDown size={17} aria-hidden="true" />
                                </span>
                                <span className={styles.statLabel}>Gastos</span>
                                <strong>$ 320.000</strong>
                            </div>
                        </div>

                        <div className={styles.recentTitle}>
                            <strong>Movimientos recientes</strong>
                            <span>Vista de ejemplo</span>
                        </div>
                        <div className={styles.movement}>
                            <span className={`${styles.movementIcon} ${styles.incomeIcon}`}>
                                <Wallet size={17} aria-hidden="true" />
                            </span>
                            <span className={styles.movementName}>
                                <strong>Ingreso registrado</strong>
                                <small>Transferencia</small>
                            </span>
                            <strong className={styles.incomeAmount}>+$ 120.000</strong>
                        </div>
                        <div className={styles.movement}>
                            <span className={`${styles.movementIcon} ${styles.expenseIcon}`}>
                                <Receipt size={17} aria-hidden="true" />
                            </span>
                            <span className={styles.movementName}>
                                <strong>Gasto cotidiano</strong>
                                <small>Débito</small>
                            </span>
                            <strong className={styles.expenseAmount}>−$ 18.500</strong>
                        </div>
                        <div className={styles.previewFootnote}>
                            Importes ilustrativos, no son datos de tu cuenta
                        </div>
                    </div>
                </div>
            </section>

            <section id="funciones" className={styles.featuresSection}>
                <div className={styles.sectionHeading}>
                    <span className={styles.sectionEyebrow}>MENOS VUELTAS, MÁS CLARIDAD</span>
                    <h2>Lo importante, sin complicarte.</h2>
                    <p>Herramientas simples para tener una imagen más clara de tus finanzas.</p>
                </div>

                <div className={styles.featuresGrid}>
                    <article className={styles.featureCard}>
                        <span className={styles.featureIcon}><TrendingUp size={21} aria-hidden="true" /></span>
                        <h3>Ingresos y gastos</h3>
                        <p>Registrá lo que entra y sale para mantener tus números al día.</p>
                    </article>
                    <article className={styles.featureCard}>
                        <span className={styles.featureIcon}><Receipt size={21} aria-hidden="true" /></span>
                        <h3>Historial ordenado</h3>
                        <p>Encontrá movimientos, revisá fechas y filtrá la información que necesitás.</p>
                    </article>
                    <article className={styles.featureCard}>
                        <span className={styles.featureIcon}><CreditCard size={21} aria-hidden="true" /></span>
                        <h3>Medios y categorías</h3>
                        <p>Adaptá las opciones a tu forma de organizar y registrar el dinero.</p>
                    </article>
                </div>
            </section>

            <section id="privacidad" className={styles.privacyBanner}>
                <span className={styles.privacyIcon}><Lock size={21} aria-hidden="true" /></span>
                <div>
                    <h2>Tu información importa.</h2>
                    <p>
                        Ingresá con tu cuenta para guardar y consultar tus movimientos.
                        La demo es un espacio de prueba separado.
                    </p>
                </div>
            </section>

            <footer className={styles.footer}>
                <a className={styles.footerBrand} href="/">Excel Pro</a>
                <span>Una forma más clara de organizar tus finanzas.</span>
                <div className={styles.footerLinks}>
                    <a href="/privacy">Política de privacidad</a>
                    <a href="/terms">Términos de servicio</a>
                </div>
            </footer>
        </main>
    );
}
