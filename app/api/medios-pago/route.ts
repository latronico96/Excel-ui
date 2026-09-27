import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/auth-options";
import { prisma } from "@/prisma/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            },
            select: {
                id: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Crear valores iniciales solamente si el usuario todavía
        // no tiene ningún medio de pago.
        const existingCount = await prisma.paymentMethod.count({
            where: {
                userId: user.id,
            },
        });

        if (existingCount === 0) {
            await prisma.paymentMethod.createMany({
                data: [
                    {
                        userId: user.id,
                        name: "Efectivo",
                        defaultCommissionPercentage: 0,
                    },
                    {
                        userId: user.id,
                        name: "Débito",
                        defaultCommissionPercentage: 0,
                    },
                    {
                        userId: user.id,
                        name: "Crédito",
                        defaultCommissionPercentage: 23,
                    },
                    {
                        userId: user.id,
                        name: "Transferencia",
                        defaultCommissionPercentage: 0,
                    },
                ],
            });
        }

        const paymentMethods = await prisma.paymentMethod.findMany({
            where: {
                userId: user.id,
                active: true,
            },
            select: {
                id: true,
                name: true,
                defaultCommissionPercentage: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(
            paymentMethods.map((method: {
                id: string;
                name: string;
                defaultCommissionPercentage: unknown;
            }) => ({
                id: method.id,
                name: method.name,
                defaultCommissionPercentage:
                    Number(method.defaultCommissionPercentage),
            }))
        );
    } catch (error) {
        console.error("GET /api/medios-pago:", error);

        return NextResponse.json(
            { error: "Error fetching payment methods" },
            { status: 500 }
        );
    }
}
