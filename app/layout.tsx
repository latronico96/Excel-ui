import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: process.env.NEXT_PUBLIC_APP_TITLE || "Tienda de Ropa - Gestión",
    description: "Gestión de ingresos y gastos con Google Sheets",
    verification: {
        google: "LPSt3_sjFJfq1Qv7_ISCHgBPvXt41xcRKK2Nzk_kRfU",
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
