import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";

const inter = Inter({ subsets: ["latin"] });

const appTitle =
    process.env.NEXT_PUBLIC_APP_TITLE || "Ordená tus Finanzas";

const appDescription =
    "Administrá tu plata fácilmente. Organizá tus ingresos, gastos, cuentas y objetivos de ahorro en un solo lugar.";

export const metadata: Metadata = {
    metadataBase: new URL("https://ordenentusfinanzas.vercel.app"),

    title: {
        default: `${appTitle} | Administrá tu plata fácilmente`,
        template: `%s | ${appTitle}`,
    },

    description: appDescription,

    applicationName: appTitle,

    keywords: [
        "finanzas personales",
        "control de gastos",
        "control de ingresos",
        "administrar dinero",
        "organizar finanzas",
        "ahorro",
        "presupuesto personal",
    ],

    openGraph: {
        title: `${appTitle} | Administrá tu plata fácilmente`,
        description: appDescription,
        url: "/",
        siteName: appTitle,
        locale: "es_AR",
        type: "website",
    },

    twitter: {
        card: "summary_large_image",
        title: `${appTitle} | Administrá tu plata fácilmente`,
        description: appDescription,
    },

    robots: {
        index: true,
        follow: true,
    },

    verification: {
        google: "LPSt3_sjFJfq1Qv7_ISCHgBPvXt41xcRKK2Nzk_kRfU",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es-AR">
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}