import { NextRequest, NextResponse } from "next/server";
import { MovimientosService } from "@/server/services/movimientos.service";
import { getCurrentWorkspace } from "@/server/services/workspace.service";
import { MovementWithDetails } from "@/shared/types";
import { prisma } from "@/prisma/prisma";

export async function GET() {
    const current = await getCurrentWorkspace();

    if (!current) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const movementCount = await prisma.movement.count({
        where: { workspaceId: current.workspaceId },
    });

    console.log("[DEBUG movimientos]", {
        workspaceId: current.workspaceId,
        workspaceName: current.workspace.name,
        movementCount,
    });
    
    try {
        const movements =
            await MovimientosService.fetchMovements(
                current.workspaceId
            );

        const formattedMovements = movements.map(
            (movement: MovementWithDetails) => {
                const baseMovement = {
                    id: movement.id,
                    type: movement.type,
                    date: movement.date,
                    amount: Number(movement.amount),
                    description: movement.description,
                };

                if (
                    movement.type === "INGRESO" &&
                    movement.income
                ) {
                    return {
                        ...baseMovement,
                        investmentPercentage: Number(
                            movement.income.investmentPercentage
                        ),
                        payments: movement.income.payments.map(
                            (payment) => ({
                                paymentMethodId:
                                    payment.paymentMethodId,
                                paymentMethodName:
                                    payment.paymentMethod.name,
                                amount: Number(payment.amount),
                                commissionPercentage: Number(
                                    payment.commissionPercentage
                                ),
                                commissionAmount: Number(
                                    payment.commissionAmount
                                ),
                                netAmount: Number(payment.netAmount),
                            })
                        ),
                    };
                }

                if (
                    movement.type === "EGRESO" &&
                    movement.expense
                ) {
                    return {
                        ...baseMovement,
                        expenseType: {
                            id: movement.expense.expenseType.id,
                            name: movement.expense.expenseType.name,
                        },
                        paymentMethod: {
                            id: movement.expense.paymentMethod.id,
                            name: movement.expense.paymentMethod.name,
                        },
                    };
                }

                return baseMovement;
            }
        );

        return NextResponse.json(formattedMovements);
    } catch (error) {
        console.error("GET /api/movimientos:", error);

        return NextResponse.json(
            { error: "Error fetching movements" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const current = await getCurrentWorkspace();

    if (!current) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();

        const movement = await MovimientosService.saveMovement(
            current.workspaceId,
            current.userId,
            body
        );

        return NextResponse.json(movement, { status: 201 });
    } catch (error) {
        console.error("POST /api/movimientos:", error);

        if (
            error instanceof Error &&
            error.message.startsWith("VALIDATION:")
        ) {
            return NextResponse.json(
                {
                    error: error.message.replace(
                        "VALIDATION: ",
                        ""
                    ),
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Error creating movement",
            },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    const current = await getCurrentWorkspace();

    if (!current) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { id, ...movement } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Debe indicar el movimiento a editar" },
                { status: 400 }
            );
        }

        const updatedMovement =
            await MovimientosService.updateMovement(
                current.workspaceId,
                current.userId,
                id,
                movement
            );

        return NextResponse.json(updatedMovement);
    } catch (error) {
        console.error("PUT /api/movimientos:", error);

        if (
            error instanceof Error &&
            error.message.startsWith("VALIDATION:")
        ) {
            return NextResponse.json(
                {
                    error: error.message.replace(
                        "VALIDATION: ",
                        ""
                    ),
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Error updating movement",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    const current = await getCurrentWorkspace();

    if (!current) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const id = req.nextUrl.searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Debe indicar el movimiento a eliminar" },
                { status: 400 }
            );
        }

        await MovimientosService.deleteMovement(
            current.workspaceId,
            current.userId,
            id
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/movimientos:", error);

        if (
            error instanceof Error &&
            error.message.startsWith("VALIDATION:")
        ) {
            return NextResponse.json(
                {
                    error: error.message.replace(
                        "VALIDATION: ",
                        ""
                    ),
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Error deleting movement",
            },
            { status: 500 }
        );
    }
}
