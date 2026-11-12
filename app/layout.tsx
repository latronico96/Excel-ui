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
        default: appTitle,
        template: `%s | ${appTitle}`,
    },
    creator: "Ordená tus Finanzas",
    publisher: "Ordená tus Finanzas",
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
        title: appTitle,
        description: appDescription,
        url: "/",
        siteName: appTitle,
        locale: "es_AR",
        type: "website",
        images: [
            {
                url: "/opengraph-image.png",
                width: 1200,
                height: 630,
                alt: "Ordená tus Finanzas",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: appTitle,
        description: appDescription,
        images: ["/opengraph-image.png"],
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
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "SoftwareApplication",
                            name: appTitle,
                            applicationCategory: "FinanceApplication",
                            operatingSystem: "Web",
                            inLanguage: "es-AR",
                            url: "https://ordenentusfinanzas.vercel.app",
                            description: appDescription,
                        }),
                    }}
                />
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
