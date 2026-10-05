import "dotenv/config";

import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@excelpro.local";


const ARS = (value: number) =>
    Math.round(value * 100) / 100;

function random(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number) {
    return Math.floor(random(min, max + 1));
}

function randomChoice<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

function round100(value: number) {
    return Math.round(value / 100) * 100;
}

/**
 * Fecha de negocio argentina.
 * Guardamos las 00:00 de Argentina (-03:00).
 */
function argentinaDate(year: number, month: number, day: number) {
    return new Date(
        `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00-03:00`
    );
}

function dateKey(date: Date) {
    return date.toISOString().slice(0, 10);
}

function daysInMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
}

/**
 * Genera una lista de fechas desde start hasta end inclusive.
 */
function getDates(start: Date, end: Date) {
    const dates: Date[] = [];

    const current = new Date(start);

    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

async function main() {
    console.log("======================================");
    console.log("   GENERANDO DATOS DEMO - EXCEL PRO");
    console.log("======================================");

    const user = await prisma.user.findUnique({
        where: {
            email: DEMO_EMAIL,
        },
    });

    if (!user) {
        throw new Error(
            `No existe el usuario DEMO: ${DEMO_EMAIL}`
        );
    }
    if (!user.id) {
        throw new Error(`No existe el usuario demo: ${DEMO_EMAIL}`);
    }
    const userId = user.id;
    console.log(`Usuario encontrado: ${user.email}`);
    console.log(`User ID: ${userId}`);

    console.log("");
    console.log("Eliminando datos anteriores de la DEMO...");

    /*
     * IMPORTANTE:
     * No tocamos Account, Session ni nada relacionado
     * con Google/NextAuth.
     *
     * Solamente eliminamos los datos del negocio.
     */

    await prisma.recurringExpensePayment.deleteMany({
        where: {
            movement: {
                userId: userId,
            },
        },
    });

    await prisma.incomePayment.deleteMany({
        where: {
            income: {
                userId: userId,
            },
        },
    });

    await prisma.expense.deleteMany({
        where: {
            userId: userId,
        },
    });

    await prisma.income.deleteMany({
        where: {
            userId: userId,
        },
    });

    await prisma.movement.deleteMany({
        where: {
            userId: userId,
        },
    });

    await prisma.recurringExpense.deleteMany({
        where: {
            userId: userId,
        },
    });

    await prisma.expenseType.deleteMany({
        where: {
            userId: userId,
        },
    });

    await prisma.paymentMethod.deleteMany({
        where: {
            userId: userId,
        },
    });

    console.log("Datos anteriores eliminados.");

    // =========================================================
    // CONFIGURACIÓN DEL USUARIO
    // =========================================================

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            onboardingCompleted: true,

            defaultInvestmentPercentage: 50,

            titheEnabled: true,
            tithePercentage: 10,
            titheBase: "NET_INCOME",
        },
    });

    // =========================================================
    // MEDIOS DE PAGO
    // =========================================================

    const efectivo = await prisma.paymentMethod.create({
        data: {
            userId: userId,
            name: "Efectivo",
            active: true,
            defaultCommissionPercentage: 0,
        },
    });

    const transferencia = await prisma.paymentMethod.create({
        data: {
            userId: userId,
            name: "Transferencia",
            active: true,
            defaultCommissionPercentage: 0,
        },
    });

    const credito = await prisma.paymentMethod.create({
        data: {
            userId: userId,
            name: "Crédito",
            active: true,
            defaultCommissionPercentage: 23,
        },
    });

    const debito = await prisma.paymentMethod.create({
        data: {
            userId: userId,
            name: "Débito",
            active: true,
            defaultCommissionPercentage: 0,
        },
    });

    const paymentMethods = [
        efectivo,
        transferencia,
        credito,
        debito,
    ];

    console.log("Medios de pago creados.");

    // =========================================================
    // TIPOS DE GASTO
    // =========================================================

    const expenseTypeNames = [
        "Alquiler",
        "Luz",
        "Internet",
        "Publicidad",
        "Contador",
        "Mercadería",
        "Insumos",
        "Transporte",
        "Mantenimiento",
        "Limpieza",
        "Impuestos",
        "Telefonía",
        "Comida",
        "Otros",
    ];

    const expenseTypes: Record<string, any> = {};

    for (const name of expenseTypeNames) {
        const type = await prisma.expenseType.create({
            data: {
                userId: userId,
                name,
                active: true,
            },
        });

        expenseTypes[name] = type;
    }

    console.log(
        `${expenseTypeNames.length} tipos de gasto creados.`
    );

    // =========================================================
    // FECHAS
    //
    // Desde el 1 de agosto hasta hoy.
    // Esto permite tener aproximadamente dos meses de datos.
    // =========================================================

    const today = new Date();

    const startDate = new Date(
        today.getFullYear(),
        today.getMonth() - 2,
        1
    );

    const endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const dates = getDates(startDate, endDate);

    console.log(
        `Generando movimientos desde ${dateKey(startDate)} hasta ${dateKey(endDate)}`
    );

    // =========================================================
    // FUNCIONES DE INGRESOS
    // =========================================================

    /**
     * Distribución aproximada:
     *
     * Efectivo       45%
     * Transferencia  35%
     * Crédito        15%
     * Débito          5%
     */

    function choosePrimaryPayment() {
        const value = Math.random();

        if (value < 0.45) return efectivo;
        if (value < 0.80) return transferencia;
        if (value < 0.95) return credito;

        return debito;
    }

    async function createIncome(
        date: Date,
        amount: number,
        description: string
    ) {
        const movement = await prisma.movement.create({
            data: {
                userId: userId,
                type: "INGRESO",
                amount: ARS(amount),
                date,
                description,
            },
        });

        // Primero creamos el Income porque
        // IncomePayment.incomeId apunta a Income.movementId.
        const income = await prisma.income.create({
            data: {
                movementId: movement.id,
                userId: userId,
                investmentPercentage: random(45, 55),
            },
        });

        /*
         * Distribución aproximada:
         *
         * Efectivo       45%
         * Transferencia  35%
         * Crédito        15%
         * Débito          5%
         */

        const choosePrimaryPayment = () => {
            const value = Math.random();

            if (value < 0.45) return efectivo;
            if (value < 0.80) return transferencia;
            if (value < 0.95) return credito;

            return debito;
        };

        /*
         * Algunas ventas se dividen entre dos medios
         * de pago para que los datos sean más naturales.
         */

        const shouldSplit = Math.random() < 0.12;

        let payments: {
            paymentMethod: typeof efectivo;
            amount: number;
        }[];

        if (shouldSplit) {
            const firstMethod = choosePrimaryPayment();

            let secondMethod = choosePrimaryPayment();

            while (secondMethod.id === firstMethod.id) {
                secondMethod = choosePrimaryPayment();
            }

            const firstAmount = round100(
                amount * random(0.35, 0.65)
            );

            const secondAmount = ARS(
                amount - firstAmount
            );

            payments = [
                {
                    paymentMethod: firstMethod,
                    amount: firstAmount,
                },
                {
                    paymentMethod: secondMethod,
                    amount: secondAmount,
                },
            ];
        } else {
            payments = [
                {
                    paymentMethod: choosePrimaryPayment(),
                    amount,
                },
            ];
        }

        for (const payment of payments) {
            const commissionPercentage =
                Number(
                    payment.paymentMethod
                        .defaultCommissionPercentage
                );

            const commissionAmount = ARS(
                payment.amount *
                commissionPercentage /
                100
            );

            const netAmount = ARS(
                payment.amount -
                commissionAmount
            );

            await prisma.incomePayment.create({
                data: {
                    incomeId: income.movementId,
                    paymentMethodId:
                        payment.paymentMethod.id,
                    amount: ARS(payment.amount),
                    commissionPercentage,
                    commissionAmount,
                    netAmount,
                },
            });
        }
    }

    // =========================================================
    // GENERACIÓN DE INGRESOS
    // =========================================================

    const incomeDescriptions = [
        "Ventas del local",
        "Ventas del día",
        "Ventas mostrador",
        "Venta del día",
        "Ventas generales",
        "Ventas del local",
        "Ventas de clientes",
    ];

    let incomeCount = 0;
    let expenseCount = 0;

    for (const date of dates) {
        const day = date.getDate();

        /*
         * Más movimiento al principio de mes.
         *
         * Días 1-5: bastante actividad
         * Días 6-20: actividad normal
         * Días 21-fin: algo menos
         */

        let numberOfSales: number;

        if (day <= 5) {
            numberOfSales = randomInt(5, 8);
        } else if (day <= 20) {
            numberOfSales = randomInt(3, 6);
        } else {
            numberOfSales = randomInt(2, 5);
        }

        /*
         * Algunos domingos/sábados tienen menos movimiento.
         */

        const dayOfWeek = date.getDay();

        if (dayOfWeek === 0) {
            numberOfSales = Math.max(
                1,
                numberOfSales - 2
            );
        }

        if (dayOfWeek === 6) {
            numberOfSales = Math.max(
                2,
                numberOfSales - 1
            );
        }

        for (
            let sale = 0;
            sale < numberOfSales;
            sale++
        ) {
            let amount = random(
                70000,
                150000
            );

            /*
             * Principio de mes:
             * ventas un poco más altas.
             */

            if (day <= 5) {
                amount *= random(
                    1.05,
                    1.25
                );
            }

            /*
             * Alguna venta grande ocasional.
             */

            if (Math.random() < 0.08) {
                amount = random(
                    130000,
                    180000
                );
            }

            amount = round100(amount);

            await createIncome(
                date,
                amount,
                randomChoice(
                    incomeDescriptions
                )
            );

            incomeCount++;
        }
    }

    console.log(
        `${incomeCount} ingresos creados.`
    );

    // =========================================================
    // GASTOS
    // =========================================================

    async function createExpense(
        date: Date,
        amount: number,
        typeName: string,
        description: string,
        paymentMethod = transferencia
    ) {
        const movement =
            await prisma.movement.create({
                data: {
                    userId: userId,
                    type: "EGRESO",
                    amount: ARS(amount),
                    date,
                    description,
                },
            });

        await prisma.expense.create({
            data: {
                movementId: movement.id,
                userId: userId,
                expenseTypeId:
                    expenseTypes[typeName].id,
                paymentMethodId:
                    paymentMethod.id,
            },
        });

        expenseCount++;
    }

    // =========================================================
    // GASTOS FIJOS MENSUALES
    // =========================================================

    const months: {
        year: number;
        month: number;
    }[] = [];

    const startMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1
    );

    const currentMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const cursor = new Date(startMonth);

    while (cursor <= currentMonth) {
        months.push({
            year: cursor.getFullYear(),
            month: cursor.getMonth(),
        });

        cursor.setMonth(
            cursor.getMonth() + 1
        );
    }

    for (const month of months) {
        const year = month.year;
        const monthIndex = month.month;

        // -----------------------------------------------------
        // Alquiler
        // -----------------------------------------------------

        const rentalDate =
            argentinaDate(
                year,
                monthIndex + 1,
                1
            );

        if (
            rentalDate >= startDate &&
            rentalDate <= endDate
        ) {
            await createExpense(
                rentalDate,
                randomInt(
                    320000,
                    390000
                ),
                "Alquiler",
                "Pago alquiler del local",
                transferencia
            );
        }

        // -----------------------------------------------------
        // Luz
        // -----------------------------------------------------

        const electricityDay =
            Math.min(
                7,
                daysInMonth(
                    year,
                    monthIndex + 1
                )
            );

        const electricityDate =
            argentinaDate(
                year,
                monthIndex + 1,
                electricityDay
            );

        if (
            electricityDate >= startDate &&
            electricityDate <= endDate
        ) {
            await createExpense(
                electricityDate,
                randomInt(
                    65000,
                    105000
                ),
                "Luz",
                "Pago factura de luz",
                transferencia
            );
        }

        // -----------------------------------------------------
        // Internet
        // -----------------------------------------------------

        const internetDate =
            argentinaDate(
                year,
                monthIndex + 1,
                10
            );

        if (
            internetDate >= startDate &&
            internetDate <= endDate
        ) {
            await createExpense(
                internetDate,
                randomInt(
                    28000,
                    42000
                ),
                "Internet",
                "Pago internet del local",
                transferencia
            );
        }

        // -----------------------------------------------------
        // Contador
        // -----------------------------------------------------

        const accountantDate =
            argentinaDate(
                year,
                monthIndex + 1,
                5
            );

        if (
            accountantDate >= startDate &&
            accountantDate <= endDate
        ) {
            await createExpense(
                accountantDate,
                randomInt(
                    60000,
                    85000
                ),
                "Contador",
                "Honorarios contador",
                transferencia
            );
        }

        // -----------------------------------------------------
        // Publicidad
        // -----------------------------------------------------

        for (
            let i = 0;
            i < 3;
            i++
        ) {
            const advertisingDay =
                randomInt(3, 25);

            const advertisingDate =
                argentinaDate(
                    year,
                    monthIndex + 1,
                    advertisingDay
                );

            if (
                advertisingDate >= startDate &&
                advertisingDate <= endDate
            ) {
                await createExpense(
                    advertisingDate,
                    randomInt(
                        18000,
                        55000
                    ),
                    "Publicidad",
                    randomChoice([
                        "Publicidad Instagram",
                        "Publicidad Facebook",
                        "Promoción del local",
                        "Publicidad redes sociales",
                    ]),
                    randomChoice([
                        transferencia,
                        credito,
                    ])
                );
            }
        }
    }

    // =========================================================
    // GASTOS VARIABLES
    // =========================================================

    for (const date of dates) {
        const dayOfWeek = date.getDay();

        /*
         * Mercadería
         *
         * Más frecuente al principio del mes.
         */

        let probability =
            date.getDate() <= 10
                ? 0.55
                : 0.35;

        if (Math.random() < probability) {
            await createExpense(
                date,
                round100(
                    random(
                        80000,
                        220000
                    )
                ),
                "Mercadería",
                randomChoice([
                    "Compra de mercadería",
                    "Reposición de mercadería",
                    "Compra proveedores",
                    "Reposición de stock",
                ]),
                randomChoice([
                    transferencia,
                    transferencia,
                    efectivo,
                ])
            );
        }

        // -----------------------------------------------------
        // Insumos
        // -----------------------------------------------------

        if (Math.random() < 0.28) {
            await createExpense(
                date,
                round100(
                    random(
                        20000,
                        75000
                    )
                ),
                "Insumos",
                randomChoice([
                    "Compra de insumos",
                    "Reposición de insumos",
                    "Materiales para el local",
                    "Compra de materiales",
                ]),
                randomChoice([
                    transferencia,
                    efectivo,
                ])
            );
        }

        // -----------------------------------------------------
        // Comida
        // -----------------------------------------------------

        /*
         * Gastos pequeños que hacen que la demo
         * se vea más natural.
         */

        if (
            dayOfWeek !== 0 &&
            Math.random() < 0.25
        ) {
            await createExpense(
                date,
                randomInt(
                    7000,
                    18000
                ),
                "Comida",
                randomChoice([
                    "Almuerzo",
                    "Comida del local",
                    "Comida personal",
                    "Café y comida",
                ]),
                efectivo
            );
        }

        // -----------------------------------------------------
        // Transporte
        // -----------------------------------------------------

        if (Math.random() < 0.22) {
            await createExpense(
                date,
                randomInt(
                    5000,
                    18000
                ),
                "Transporte",
                randomChoice([
                    "Transporte",
                    "Combustible",
                    "Viaje por compras",
                    "Traslado",
                ]),
                efectivo
            );
        }

        // -----------------------------------------------------
        // Limpieza
        // -----------------------------------------------------

        if (Math.random() < 0.08) {
            await createExpense(
                date,
                randomInt(
                    10000,
                    30000
                ),
                "Limpieza",
                randomChoice([
                    "Productos de limpieza",
                    "Artículos de limpieza",
                    "Limpieza del local",
                ]),
                efectivo
            );
        }

        // -----------------------------------------------------
        // Mantenimiento
        // -----------------------------------------------------

        if (Math.random() < 0.06) {
            await createExpense(
                date,
                randomInt(
                    15000,
                    60000
                ),
                "Mantenimiento",
                randomChoice([
                    "Mantenimiento del local",
                    "Reparación",
                    "Mantenimiento general",
                ]),
                transferencia
            );
        }

        // -----------------------------------------------------
        // Telefonía
        // -----------------------------------------------------

        if (
            date.getDate() === 15 &&
            Math.random() < 0.9
        ) {
            await createExpense(
                date,
                randomInt(
                    12000,
                    22000
                ),
                "Telefonía",
                "Pago línea telefónica",
                transferencia
            );
        }
    }

    // =========================================================
    // ALGUNOS IMPUESTOS
    // =========================================================

    for (const month of months) {
        const taxDate =
            argentinaDate(
                month.year,
                month.month + 1,
                15
            );

        if (
            taxDate >= startDate &&
            taxDate <= endDate
        ) {
            await createExpense(
                taxDate,
                randomInt(
                    30000,
                    75000
                ),
                "Impuestos",
                "Pago impuestos",
                transferencia
            );
        }
    }

    // =========================================================
    // RESUMEN
    // =========================================================

    const incomeResult =
        await prisma.movement.aggregate({
            where: {
                userId: userId,
                type: "INGRESO",
            },
            _sum: {
                amount: true,
            },
            _count: true,
        });

    const expenseResult =
        await prisma.movement.aggregate({
            where: {
                userId: userId,
                type: "EGRESO",
            },
            _sum: {
                amount: true,
            },
            _count: true,
        });

    console.log("");
    console.log("======================================");
    console.log("          DEMO COMPLETADA");
    console.log("======================================");

    console.log(
        `Ingresos: ${incomeResult._count}`
    );

    console.log(
        `Monto ingresos: $${Number(
            incomeResult._sum.amount ?? 0
        ).toLocaleString("es-AR")}`
    );

    console.log(
        `Egresos: ${expenseResult._count}`
    );

    console.log(
        `Monto egresos: $${Number(
            expenseResult._sum.amount ?? 0
        ).toLocaleString("es-AR")}`
    );

    console.log("");
    console.log(
        `Usuario DEMO: ${DEMO_EMAIL}`
    );

    console.log("");
    console.log(
        "Configuración:"
    );

    console.log(
        "  Reinversión: 50%"
    );

    console.log(
        "  Diezmo: 10% sobre ingreso neto"
    );

    console.log("");
    console.log(
        "Podés entrar a la aplicación y revisar:"
    );

    console.log(
        "  → Hoy"
    );

    console.log(
        "  → Movimientos"
    );

    console.log(
        "  → Resumen semanal"
    );

    console.log(
        "  → Resumen mensual"
    );

    console.log(
        "  → Configuración"
    );

    console.log("");
    console.log("======================================");
}

main()
    .catch((error) => {
        console.error("");
        console.error(
            "ERROR AL GENERAR LA DEMO:"
        );
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

//npx tsx prisma/seed.ts