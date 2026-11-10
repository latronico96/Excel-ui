import "dotenv/config";
import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("\n=== USUARIOS ===");

  const users = await prisma.$queryRaw`
    SELECT id, email, name
    FROM "User"
    ORDER BY email
  `;
  console.table(users);

  console.log("\n=== MOVIMIENTOS POR USUARIO ===");

  const movements = await prisma.$queryRaw`
    SELECT
      u.email,
      COUNT(m.id)::int AS movimientos,
      COUNT(m.id) FILTER (
        WHERE m.type::text = 'INGRESO'
      )::int AS ingresos,
      COUNT(m.id) FILTER (
        WHERE m.type::text = 'EGRESO'
      )::int AS gastos,
      MIN(m.date) AS fecha_mas_antigua,
      MAX(m.date) AS fecha_mas_reciente,
      COALESCE(SUM(m.amount), 0) AS importe_total
    FROM "User" u
    LEFT JOIN "Movement" m ON m."userId" = u.id
    GROUP BY u.id, u.email
    ORDER BY u.email
  `;
  console.table(movements);

  console.log("\n=== TIPOS DE GASTO POR USUARIO ===");

  const expenseTypes = await prisma.$queryRaw`
    SELECT
      u.email,
      COUNT(et.id)::int AS tipos_de_gasto
    FROM "User" u
    LEFT JOIN "ExpenseType" et ON et."userId" = u.id
    GROUP BY u.id, u.email
    ORDER BY u.email
  `;
  console.table(expenseTypes);

  console.log("\n=== MEDIOS DE PAGO POR USUARIO ===");

  const paymentMethods = await prisma.$queryRaw`
    SELECT
      u.email,
      COUNT(pm.id)::int AS medios_de_pago
    FROM "User" u
    LEFT JOIN "PaymentMethod" pm ON pm."userId" = u.id
    GROUP BY u.id, u.email
    ORDER BY u.email
  `;
  console.table(paymentMethods);
}

main()
  .catch((error) => {
    console.error("Error inspeccionando la base de datos:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
