"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar,
    ChevronRight,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Menu,
    PieChart,
    Plus,
    Receipt,
    Settings,
    Tags,
    X,
} from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [quickMenuOpen, setQuickMenuOpen] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    // Cerrar el menú móvil al cambiar de página
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    if (status === "loading") {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                }}
            >
                Cargando...
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    const isActive = (href: string) => {
        if (href === "/hoy") {
            return pathname === "/hoy";
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const closeMenus = () => {
        setMobileMenuOpen(false);
        setQuickMenuOpen(false);
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" });
    };

    return (
        <div className="dashboard-container">
            {/* =========================================
                SIDEBAR DESKTOP
            ========================================= */}
            <aside className="sidebar">
                <div>
                    <div
                        style={{
                            fontSize: "1.25rem",
                            marginBottom: "2rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: 700,
                        }}
                    >
                        <LayoutDashboard
                            size={24}
                            color="var(--primary)"
                        />

                        {process.env.NEXT_PUBLIC_APP_TITLE ||
                            "Mi Comercio"}
                    </div>

                    <nav className="sidebar-nav">
                        <Link
                            href="/hoy"
                            className={`nav-link ${
                                isActive("/hoy") ? "active" : ""
                            }`}
                        >
                            <LayoutDashboard size={20} />
                            Inicio
                        </Link>

                        <Link
                            href="/resumen"
                            className={`nav-link ${
                                isActive("/resumen") ? "active" : ""
                            }`}
                        >
                            <PieChart size={20} />
                            Resumen
                        </Link>

                        <Link
                            href="/movimientos"
                            className={`nav-link ${
                                isActive("/movimientos") ? "active" : ""
                            }`}
                        >
                            <Receipt size={20} />
                            Movimientos
                        </Link>

                        <Link
                            href="/gastos-mensuales"
                            className={`nav-link ${
                                isActive("/gastos-mensuales")
                                    ? "active"
                                    : ""
                            }`}
                        >
                            <Calendar size={20} />
                            Gastos mensuales
                        </Link>

                        <div className="sidebar-section">
                            <div className="sidebar-section-title">
                                <Settings size={17} />
                                Configuración
                            </div>

                            <Link
                                href="/tipos-gasto"
                                className={`nav-link nav-link-sub ${
                                    isActive("/tipos-gasto")
                                        ? "active"
                                        : ""
                                }`}
                            >
                                <Tags size={19} />
                                Tipos de gasto
                            </Link>

                            <Link
                                href="/medios-pago"
                                className={`nav-link nav-link-sub ${
                                    isActive("/medios-pago")
                                        ? "active"
                                        : ""
                                }`}
                            >
                                <CreditCard size={19} />
                                Medios de pago
                            </Link>
                        </div>
                    </nav>
                </div>

                <div style={{ marginTop: "auto" }}>
                    <button
                        onClick={handleLogout}
                        className="nav-link"
                        style={{
                            width: "100%",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            textAlign: "left",
                        }}
                    >
                        <LogOut size={20} />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* =========================================
                HEADER MOBILE
            ========================================= */}
            <header className="mobile-header">
                <button
                    type="button"
                    className="mobile-menu-button"
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Abrir menú"
                >
                    <Menu size={24} />
                </button>

                <div className="mobile-header-title">
                    {process.env.NEXT_PUBLIC_APP_TITLE ||
                        "Mi Comercio"}
                </div>

                <div style={{ width: 40 }} />
            </header>

            {/* =========================================
                MOBILE DRAWER
            ========================================= */}
            {mobileMenuOpen && (
                <div
                    className="mobile-menu-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <aside
                        className="mobile-drawer"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="mobile-drawer-header">
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontWeight: 700,
                                    fontSize: "1.1rem",
                                }}
                            >
                                <LayoutDashboard
                                    size={22}
                                    color="var(--primary)"
                                />

                                {process.env.NEXT_PUBLIC_APP_TITLE ||
                                    "Mi Comercio"}
                            </div>

                            <button
                                type="button"
                                className="mobile-drawer-close"
                                onClick={() =>
                                    setMobileMenuOpen(false)
                                }
                                aria-label="Cerrar menú"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <nav className="sidebar-nav">
                            <Link
                                href="/hoy"
                                onClick={closeMenus}
                                className={`nav-link ${
                                    isActive("/hoy")
                                        ? "active"
                                        : ""
                                }`}
                            >
                                <LayoutDashboard size={20} />
                                Inicio
                            </Link>

                            <Link
                                href="/resumen"
                                onClick={closeMenus}
                                className={`nav-link ${
                                    isActive("/resumen")
                                        ? "active"
                                        : ""
                                }`}
                            >
                                <PieChart size={20} />
                                Resumen
                            </Link>

                            <Link
                                href="/movimientos"
                                onClick={closeMenus}
                                className={`nav-link ${
                                    isActive("/movimientos")
                                        ? "active"
                                        : ""
                                }`}
                            >
                                <Receipt size={20} />
                                Movimientos
                            </Link>

                            <Link
                                href="/gastos-mensuales"
                                onClick={closeMenus}
                                className={`nav-link ${
                                    isActive(
                                        "/gastos-mensuales"
                                    )
                                        ? "active"
                                        : ""
                                }`}
                            >
                                <Calendar size={20} />
                                Gastos mensuales
                            </Link>

                            <div className="sidebar-section">
                                <div className="sidebar-section-title">
                                    <Settings size={17} />
                                    Configuración
                                </div>

                                <Link
                                    href="/tipos-gasto"
                                    onClick={closeMenus}
                                    className={`nav-link nav-link-sub ${
                                        isActive(
                                            "/tipos-gasto"
                                        )
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <Tags size={19} />
                                    Tipos de gasto
                                </Link>

                                <Link
                                    href="/medios-pago"
                                    onClick={closeMenus}
                                    className={`nav-link nav-link-sub ${
                                        isActive(
                                            "/medios-pago"
                                        )
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <CreditCard size={19} />
                                    Medios de pago
                                </Link>
                            </div>
                        </nav>

                        <div className="mobile-drawer-footer">
                            <button
                                onClick={handleLogout}
                                className="nav-link"
                                style={{
                                    width: "100%",
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                <LogOut size={20} />
                                Cerrar sesión
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* =========================================
                MAIN CONTENT
            ========================================= */}
            <main className="main-content">
                {children}
            </main>

            {/* =========================================
                QUICK ACTION MENU
            ========================================= */}
            {quickMenuOpen && (
                <div
                    className="quick-action-backdrop"
                    onClick={() => setQuickMenuOpen(false)}
                />
            )}

            <div className="quick-actions">
                {quickMenuOpen && (
                    <div className="quick-action-menu">
                        <button
                            type="button"
                            className="quick-action-item"
                            onClick={() => {
                                setQuickMenuOpen(false);
                                router.push(
                                    "/movimientos?nuevo=ingreso"
                                );
                            }}
                        >
                            <span className="quick-action-icon income">
                                <ArrowUpCircle size={20} />
                            </span>

                            <span>Nuevo ingreso</span>

                            <ChevronRight size={17} />
                        </button>

                        <button
                            type="button"
                            className="quick-action-item"
                            onClick={() => {
                                setQuickMenuOpen(false);
                                router.push(
                                    "/movimientos?nuevo=egreso"
                                );
                            }}
                        >
                            <span className="quick-action-icon expense">
                                <ArrowDownCircle size={20} />
                            </span>

                            <span>Nuevo egreso</span>

                            <ChevronRight size={17} />
                        </button>

                        <button
                            type="button"
                            className="quick-action-item"
                            onClick={() => {
                                setQuickMenuOpen(false);
                                router.push(
                                    "/gastos-mensuales?accion=pagar"
                                );
                            }}
                        >
                            <span className="quick-action-icon recurring">
                                <Calendar size={20} />
                            </span>

                            <span>Pago mensual</span>

                            <ChevronRight size={17} />
                        </button>
                    </div>
                )}

                <button
                    type="button"
                    className={`quick-action-button ${
                        quickMenuOpen ? "open" : ""
                    }`}
                    onClick={() =>
                        setQuickMenuOpen((value) => !value)
                    }
                    aria-label={
                        quickMenuOpen
                            ? "Cerrar acciones"
                            : "Nueva operación"
                    }
                >
                    {quickMenuOpen ? (
                        <X size={27} />
                    ) : (
                        <Plus size={28} />
                    )}
                </button>
            </div>
        </div>
    );
}
