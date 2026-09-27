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
        // no tiene ningún tipo de gasto.
        const existingCount = await prisma.expenseType.count({
            where: {
                userId: user.id,
            },
        });

        if (existingCount === 0) {
            await prisma.expenseType.createMany({
                data: [
                    {
                        userId: user.id,
                        name: "Insumos",
                    },
                    {
                        userId: user.id,
                        name: "Servicios",
                    },
                    {
                        userId: user.id,
                        name: "Impuestos",
                    },
                    {
                        userId: user.id,
                        name: "Otros",
                    },
                ],
            });
        }

        const expenseTypes = await prisma.expenseType.findMany({
            where: {
                userId: user.id,
                active: true,
            },
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(expenseTypes);
    } catch (error) {
        console.error("GET /api/tipos-gasto:", error);

        return NextResponse.json(
            { error: "Error fetching expense types" },
            { status: 500 }
        );
    }
}
