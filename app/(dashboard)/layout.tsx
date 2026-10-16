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
    Folder,
    LayoutDashboard,
    LogOut,
    Menu,
    PieChart,
    Plus,
    Receipt,
    Settings,
    SlidersHorizontal,
    Tags,
    Users,
    X,
} from "lucide-react";
type WorkspaceOption = {
    id: string;
    name: string;
    role: string;
};

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
    const [checkingOnboarding, setCheckingOnboarding] = useState(true);
    const [workspaceName, setWorkspaceName] = useState("");
    const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
    const [activeWorkspaceId, setActiveWorkspaceId] = useState("");
    const [switchingWorkspace, setSwitchingWorkspace] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated") {
            return;
        }

        let cancelled = false;

        const loadWorkspaceName = async () => {
            try {
                const response = await fetch("/api/configuracion");

                if (!response.ok) {
                    throw new Error("No se pudo cargar el workspace");
                }

                const data = await response.json();

                if (!cancelled && typeof data.name === "string") {
                    setWorkspaceName(data.name);
                }

                if (!data.onboardingCompleted) {
                    router.replace("/onboarding");
                    return;
                }

                setCheckingOnboarding(false);

                const responseEspacios = await fetch("/api/espacios");

                if (!responseEspacios.ok) return;

                const dataEspacios = await responseEspacios.json();

                setWorkspaces(dataEspacios.workspaces);
                setActiveWorkspaceId(dataEspacios.activeWorkspaceId ?? "");

            } catch (error) {
                console.error("Error cargando el workspace:", error);
            }
        };

        const handleWorkspaceUpdate = (event: Event) => {
            const customEvent = event as CustomEvent<{ name: string }>;

            if (typeof customEvent.detail?.name === "string") {
                setWorkspaceName(customEvent.detail.name);
            }
        };

        loadWorkspaceName();

        window.addEventListener(
            "workspace-updated",
            handleWorkspaceUpdate
        );


        return () => {
            cancelled = true;
            window.removeEventListener(
                "workspace-updated",
                handleWorkspaceUpdate
            );
        };
    }, [status, router]);

    useEffect(() => {
        document.title = workspaceName
            ? `${workspaceName} | Excel Pro`
            : "Excel Pro";
    }, [workspaceName]);

    // Cerrar el menú móvil al cambiar de página
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (status !== "authenticated") {
            return;
        }

        // No controlar el onboarding estando ya en él
        if (pathname === "/onboarding") {
            setCheckingOnboarding(false);
            return;
        }
    }, [status, pathname, router]);

    async function switchWorkspace(workspaceId: string) {
        if (!workspaceId || workspaceId === activeWorkspaceId) return;

        setSwitchingWorkspace(true);

        try {
            const response = await fetch("/api/espacios/activo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ workspaceId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "No se pudo cambiar el espacio");
            }

            setActiveWorkspaceId(data.workspace.id);
            setWorkspaceName(data.workspace.name);

            // Recargar los datos y permisos del espacio seleccionado.
            window.location.reload();
        } catch (error) {
            console.error("Error al cambiar de espacio:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "No se pudo cambiar el espacio"
            );
        } finally {
            setSwitchingWorkspace(false);
        }
    }

    if (
        status === "loading" ||
        (status === "authenticated" &&
            checkingOnboarding &&
            pathname !== "/onboarding")
    ) {
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
                        className="mb-8 flex w-full min-w-0 items-center gap-2"
                        style={{ fontSize: "1.25rem", fontWeight: 700 }}
                    >
                        <LayoutDashboard
                            size={20}
                            color="var(--primary)"
                            className="shrink-0"
                        />

                        {workspaces.length > 1 ? (
                            <div className="min-w-0 flex-1">
                                <div className="relative w-full min-w-0">
                                    <select
                                        id="workspace-select"
                                        value={activeWorkspaceId}
                                        onChange={(event) =>
                                            switchWorkspace(event.target.value)
                                        }
                                        disabled={switchingWorkspace}
                                        aria-label="Cambiar espacio de trabajo"
                                        style={{
                                            display: "block",
                                            boxSizing: "border-box",
                                            width: "100%",
                                            minWidth: 0,
                                            maxWidth: "100%",
                                            overflow: "hidden",
                                            padding: "8px 30px 8px 10px",
                                            border: "1px solid var(--border, #e5e7eb)",
                                            borderRadius: 8,
                                            background: "var(--card, #fff)",
                                            color: "var(--foreground, #374151)",
                                            font: "500 14px/1.4 inherit",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {workspaces.map((workspace) => (
                                            <option
                                                key={workspace.id}
                                                value={workspace.id}
                                            >
                                                {workspace.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <span className="min-w-0 truncate text-base font-bold">
                                {workspaceName ||
                                    process.env.NEXT_PUBLIC_APP_TITLE ||
                                    "Mi Comercio"}
                            </span>
                        )}
                    </div>

                    <nav className="sidebar-nav">
                        <Link
                            href="/hoy"
                            className={`nav-link ${isActive("/hoy") ? "active" : ""}`}
                        >
                            <LayoutDashboard size={20} />
                            Inicio
                        </Link>

                        <Link
                            href="/resumen"
                            className={`nav-link ${isActive("/resumen") ? "active" : ""}`}
                        >
                            <PieChart size={20} />
                            Resumen
                        </Link>

                        <Link
                            href="/movimientos"
                            className={`nav-link ${isActive("/movimientos") ? "active" : ""}`}
                        >
                            <Receipt size={20} />
                            Movimientos
                        </Link>

                        <Link
                            href="/gastos-mensuales"
                            className={`nav-link ${isActive("/gastos-mensuales") ? "active" : ""}`}
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
                                href="/configuracion"
                                className={`nav-link nav-link-sub ${isActive("/configuracion") ? "active" : ""}`}
                            >
                                <SlidersHorizontal size={19} />
                                General
                            </Link>
                            <Link
                                href="/tipos-gasto"
                                className={`nav-link nav-link-sub ${isActive("/tipos-gasto") ? "active" : ""}`}
                            >
                                <Tags size={19} />
                                Tipos de gasto
                            </Link>

                            <Link
                                href="/medios-pago"
                                className={`nav-link nav-link-sub ${isActive("/medios-pago") ? "active" : ""}`}
                            >
                                <CreditCard size={19} />
                                Medios de pago
                            </Link>
                            <Link
                                href="/miembros"
                                className={`nav-link nav-link-sub ${isActive("/miembros") ? "active" : ""}`}
                            >
                                <Users size={19} />
                                Miembros
                            </Link>
                            <Link
                                href="/espacios"
                                className={`nav-link nav-link-sub ${isActive("/espacios") ? "active" : ""}`}
                            >
                                <Folder size={19} />
                                Espacios
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
                    {workspaceName ||
                        process.env.NEXT_PUBLIC_APP_TITLE ||
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
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mobile-drawer-header">
                            <div
                                className="flex min-w-0 flex-1 items-center gap-2"
                                style={{
                                    fontWeight: 700,
                                    fontSize: "1.1rem",
                                }}
                            >
                                <LayoutDashboard
                                    size={22}
                                    color="var(--primary)"
                                    style={{ flexShrink: 0 }}
                                />

                                {workspaces.length > 1 ? (
                                    <div className="min-w-0 flex-1">
                                        <div className="relative w-full min-w-0">
                                            <select
                                                id="workspace-select-mobile"
                                                value={activeWorkspaceId}
                                                onChange={(event) =>
                                                    switchWorkspace(event.target.value)
                                                }
                                                disabled={switchingWorkspace}
                                                aria-label="Cambiar espacio de trabajo"
                                                style={{
                                                    display: "block",
                                                    boxSizing: "border-box",
                                                    width: "100%",
                                                    minWidth: 0,
                                                    maxWidth: "100%",
                                                    overflow: "hidden",
                                                    padding: "8px 30px 8px 10px",
                                                    border: "1px solid var(--border, #e5e7eb)",
                                                    borderRadius: 8,
                                                    background: "var(--card, #fff)",
                                                    color: "var(--foreground, #374151)",
                                                    fontSize: "14px",
                                                    fontWeight: 500,
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {workspaces.map((workspace) => (
                                                    <option
                                                        key={workspace.id}
                                                        value={workspace.id}
                                                    >
                                                        {workspace.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <span
                                        className="min-w-0 truncate"
                                        style={{ fontSize: "1rem" }}
                                    >
                                        {workspaceName ||
                                            process.env.NEXT_PUBLIC_APP_TITLE ||
                                            "Mi Comercio"}
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                className="mobile-drawer-close"
                                onClick={() => setMobileMenuOpen(false)}
                                aria-label="Cerrar menú"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <nav className="sidebar-nav">
                            <Link
                                href="/hoy"
                                onClick={closeMenus}
                                className={`nav-link ${isActive("/hoy") ? "active" : ""}`}
                            >
                                <LayoutDashboard size={20} />
                                Inicio
                            </Link>

                            <Link
                                href="/resumen"
                                onClick={closeMenus}
                                className={`nav-link ${isActive("/resumen") ? "active" : ""}`}
                            >
                                <PieChart size={20} />
                                Resumen
                            </Link>

                            <Link
                                href="/movimientos"
                                onClick={closeMenus}
                                className={`nav-link ${isActive("/movimientos") ? "active" : ""}`}
                            >
                                <Receipt size={20} />
                                Movimientos
                            </Link>

                            <Link
                                href="/gastos-mensuales"
                                onClick={closeMenus}
                                className={`nav-link ${isActive("/gastos-mensuales") ? "active" : ""}`}
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
                                    href="/configuracion"
                                    className={`nav-link nav-link-sub ${isActive("/configuracion") ? "active" : ""}`}
                                >
                                    <SlidersHorizontal size={19} />
                                    General
                                </Link>
                                <Link
                                    href="/tipos-gasto"
                                    onClick={closeMenus}
                                    className={`nav-link nav-link-sub ${isActive("/tipos-gasto") ? "active" : ""}`}
                                >
                                    <Tags size={19} />
                                    Tipos de gasto
                                </Link>

                                <Link
                                    href="/medios-pago"
                                    onClick={closeMenus}
                                    className={`nav-link nav-link-sub ${isActive("/medios-pago") ? "active" : ""}`}
                                >
                                    <CreditCard size={19} />
                                    Medios de pago
                                </Link>
                                <Link
                                    href="/miembros"
                                    onClick={closeMenus}
                                    className={`nav-link nav-link-sub ${isActive("/miembros") ? "active" : ""}`}
                                >
                                    <Users size={19} />
                                    Miembros
                                </Link>
                                <Link
                                    href="/espacios"
                                    className={`nav-link nav-link-sub ${isActive("/espacios") ? "active" : ""}`}
                                >
                                    <Folder size={19} />
                                    Espacios
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
            <main className="main-content">{children}</main>

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
                                router.push("/movimientos?nuevo=ingreso");
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
                                router.push("/movimientos?nuevo=egreso");
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
                                router.push("/gastos-mensuales?accion=pagar");
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
                    className={`quick-action-button ${quickMenuOpen ? "open" : ""}`}
                    onClick={() => setQuickMenuOpen((value) => !value)}
                    aria-label={quickMenuOpen ? "Cerrar acciones" : "Nueva operación"}
                >
                    {quickMenuOpen ? <X size={27} /> : <Plus size={28} />}
                </button>
            </div>
        </div>
    );
}
