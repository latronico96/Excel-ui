import {
    LayoutDashboard,
    CreditCard,
    Lock,
    Receipt,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Wallet,
    CircleHelp,
    CheckCircle2,
} from 'lucide-react';
import styles from './page.module.css';
import Link from 'next/link';
import { LandingActions } from './components/LandingActions';

export default function RootPage() {
    return (
        <main className={styles.page}>
            <header className={styles.nav}>
                <Link
                    className={styles.brand}
                    href="/"
                    aria-label="Ordená tus Finanzas, inicio"
                >
                    <span className={styles.brandMark}>
                        <LayoutDashboard size={23} strokeWidth={2.2} />
                    </span>
                    <span>Ordená tus <b>Finanzas</b></span>
                </Link>

                <nav className={styles.navActions} aria-label="Navegación principal">
                    <Link href="#funciones" className={styles.navLink}>
                        Funciones
                    </Link>
                    <Link href="#como-funciona" className={styles.navLink}>
                        Cómo funciona
                    </Link>
                    <Link href="#privacidad" className={styles.navLink}>
                        Tu información
                    </Link>
                    <LandingActions variant="nav" />
                </nav>
            </header>

            <section className={styles.hero}>
                <div className={styles.heroCopy}>
                    <div className={styles.eyebrow}>
                        <Sparkles size={15} aria-hidden="true" />
                        Tu plata, más organizada
                    </div>

                    <h1>
                        Ordená tus finanzas.
                        <span>Administrá tu plata fácilmente.</span>
                    </h1>

                    <p className={styles.heroDescription}>
                        Registrá tus ingresos y gastos, organizá tus cuentas y
                        descubrí en qué estás usando tu plata. Todo en un solo lugar,
                        de manera simple y clara.
                    </p>

                    <LandingActions variant="hero" />

                    <div className={styles.trustNote}>
                        <Lock size={15} aria-hidden="true" />
                        <span>
                            Empezá gratis o explorá la aplicación antes de registrarte.
                        </span>
                    </div>
                </div>

                <div
                    className={styles.previewWrap}
                    aria-label="Vista ilustrativa del panel financiero"
                >
                    <div className={styles.previewGlow} />

                    <div className={styles.previewCard}>
                        <div className={styles.previewHeader}>
                            <div>
                                <span className={styles.previewKicker}>
                                    RESUMEN FINANCIERO
                                </span>
                                <h2>Así se ve tu plata</h2>
                            </div>
                            <span className={styles.monthPill}>Este mes</span>
                        </div>

                        <div className={styles.balanceCard}>
                            <span className={styles.balanceLabel}>
                                Balance del período
                            </span>
                            <strong>$ 530.000</strong>
                            <span className={styles.balanceHint}>
                                <TrendingUp size={14} aria-hidden="true" />
                                Ingresos menos gastos
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
                            <strong className={styles.incomeAmount}>
                                +$ 120.000
                            </strong>
                        </div>

                        <div className={styles.movement}>
                            <span className={`${styles.movementIcon} ${styles.expenseIcon}`}>
                                <Receipt size={17} aria-hidden="true" />
                            </span>
                            <span className={styles.movementName}>
                                <strong>Gasto cotidiano</strong>
                                <small>Débito</small>
                            </span>
                            <strong className={styles.expenseAmount}>
                                −$ 18.500
                            </strong>
                        </div>

                        <div className={styles.previewFootnote}>
                            Importes ilustrativos, no son datos de tu cuenta
                        </div>
                    </div>
                </div>
            </section>

            <section id="funciones" className={styles.featuresSection}>
                <div className={styles.sectionHeading}>
                    <span className={styles.sectionEyebrow}>
                        MENOS VUELTAS, MÁS CLARIDAD
                    </span>
                    <h2>Todo lo que necesitás para organizarte.</h2>
                    <p>
                        Herramientas simples para tomar el control de tus finanzas
                        cotidianas.
                    </p>
                </div>

                <div className={styles.featuresGrid}>
                    <article className={styles.featureCard}>
                        <span className={styles.featureIcon}>
                            <TrendingUp size={21} aria-hidden="true" />
                        </span>
                        <h3>Ingresos y gastos</h3>
                        <p>
                            Registrá lo que entra y sale para saber cómo se mueve tu plata.
                        </p>
                    </article>

                    <article className={styles.featureCard}>
                        <span className={styles.featureIcon}>
                            <Receipt size={21} aria-hidden="true" />
                        </span>
                        <h3>Historial ordenado</h3>
                        <p>
                            Consultá tus movimientos, revisá fechas y encontrá lo que necesitás.
                        </p>
                    </article>

                    <article className={styles.featureCard}>
                        <span className={styles.featureIcon}>
                            <CreditCard size={21} aria-hidden="true" />
                        </span>
                        <h3>Cuentas y categorías</h3>
                        <p>
                            Organizá tus cuentas, billeteras y categorías a tu manera.
                        </p>
                    </article>
                </div>
            </section>

            <section id="como-funciona" className={styles.howSection}>
                <div className={styles.sectionHeading}>
                    <span className={styles.sectionEyebrow}>
                        TU ECONOMÍA, MÁS CLARA
                    </span>
                    <h2>Organizá tus finanzas personales en pocos pasos.</h2>
                    <p>
                        No necesitás planillas complicadas. Empezá registrando tus
                        movimientos y consultá tu situación cuando quieras.
                    </p>
                </div>

                <div className={styles.stepsGrid}>
                    <article className={styles.stepCard}>
                        <span className={styles.stepNumber}>01</span>
                        <span className={styles.stepIcon}>
                            <Wallet size={22} aria-hidden="true" />
                        </span>
                        <h3>Registrá tus ingresos</h3>
                        <p>
                            Anotá el dinero que recibís y mantené tus entradas
                            organizadas en un mismo lugar.
                        </p>
                    </article>

                    <article className={styles.stepCard}>
                        <span className={styles.stepNumber}>02</span>
                        <span className={styles.stepIcon}>
                            <Receipt size={22} aria-hidden="true" />
                        </span>
                        <h3>Anotá tus gastos</h3>
                        <p>
                            Registrá tus compras y pagos para tener un historial
                            claro de tus movimientos.
                        </p>
                    </article>

                    <article className={styles.stepCard}>
                        <span className={styles.stepNumber}>03</span>
                        <span className={styles.stepIcon}>
                            <TrendingUp size={22} aria-hidden="true" />
                        </span>
                        <h3>Revisá tu balance</h3>
                        <p>
                            Compará ingresos y gastos para entender cómo evoluciona
                            tu economía durante el período.
                        </p>
                    </article>
                </div>
            </section>

            <section className={styles.faqSection} aria-labelledby="faq-title">
                <div className={styles.sectionHeading}>
                    <span className={styles.sectionEyebrow}>
                        PREGUNTAS FRECUENTES
                    </span>
                    <h2 id="faq-title">Resolvemos tus dudas.</h2>
                    <p>
                        Conocé un poco más sobre cómo funciona Ordená tus Finanzas.
                    </p>
                </div>

                <div className={styles.faqList}>
                    <details className={styles.faqItem}>
                        <summary>
                            <span>
                                <CircleHelp size={19} aria-hidden="true" />
                                ¿Para qué sirve Ordená tus Finanzas?
                            </span>
                            <span className={styles.faqPlus} aria-hidden="true">+</span>
                        </summary>
                        <p>
                            Es una aplicación para organizar tus finanzas personales.
                            Podés registrar ingresos, gastos, administrar tus cuentas
                            y consultar tus movimientos para tener una visión más clara
                            de tu dinero.
                        </p>
                    </details>

                    <details className={styles.faqItem}>
                        <summary>
                            <span>
                                <CircleHelp size={19} aria-hidden="true" />
                                ¿Puedo registrar ingresos y gastos?
                            </span>
                            <span className={styles.faqPlus} aria-hidden="true">+</span>
                        </summary>
                        <p>
                            Sí. Podés registrar tanto el dinero que recibís como los
                            gastos que realizás y consultar el historial de movimientos.
                        </p>
                    </details>

                    <details className={styles.faqItem}>
                        <summary>
                            <span>
                                <CircleHelp size={19} aria-hidden="true" />
                                ¿Puedo organizar distintas cuentas?
                            </span>
                            <span className={styles.faqPlus} aria-hidden="true">+</span>
                        </summary>
                        <p>
                            Sí. Podés organizar tus movimientos utilizando distintas
                            cuentas y categorías, según tu forma de administrar el dinero.
                        </p>
                    </details>

                    <details className={styles.faqItem}>
                        <summary>
                            <span>
                                <CircleHelp size={19} aria-hidden="true" />
                                ¿Puedo probar la aplicación antes de registrarme?
                            </span>
                            <span className={styles.faqPlus} aria-hidden="true">+</span>
                        </summary>
                        <p>
                            Sí. Podés explorar la demostración para conocer la aplicación
                            antes de ingresar con tu propia cuenta. La demo utiliza un
                            espacio de prueba separado.
                        </p>
                    </details>
                </div>
            </section>

            <section id="privacidad" className={styles.privacyBanner}>
                <span className={styles.privacyIcon}>
                    <Lock size={21} aria-hidden="true" />
                </span>
                <div>
                    <h2>Tus finanzas son tuyas.</h2>
                    <p>
                        Ingresá con tu cuenta para guardar y consultar tus movimientos.
                        La demo funciona en un espacio de prueba separado.
                    </p>
                </div>
            </section>

            <footer className={styles.footer}>
                <Link
                    className={styles.footerBrand}
                    href="/"
                    aria-label="Ordená tus Finanzas, inicio"
                >
                    Ordená tus Finanzas
                </Link>

                <span>Administrá tu plata fácilmente.</span>

                <div className={styles.footerLinks}>
                    <Link href="/privacy">Política de privacidad</Link>
                    <Link href="/terms">Términos de servicio</Link>
                </div>
            </footer>
        </main>
    );
}
