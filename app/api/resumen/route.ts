import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/auth-options";
import { MovimientosService } from "@/server/services/movimientos.service";
import { prisma } from "@/prisma/prisma";

export async function GET(request: NextRequest) {
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

        const periodParam = request.nextUrl.searchParams.get("period");

        const period =
            periodParam === "week" ||
            periodParam === "month" ||
            periodParam === "year"
                ? periodParam
                : "month";

        const summary = await MovimientosService.fetchSummary(
            user.id,
            period
        );

        return NextResponse.json(summary);
    } catch (error: any) {
        console.error("Error fetching summary:", error);

        return NextResponse.json(
            {
                error: error.message || "Error fetching summary",
            },
            { status: 500 }
        );
    }
}