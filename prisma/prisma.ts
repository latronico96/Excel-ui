import { PrismaClient as PostgresClient } from "@/prisma/generated/client";
import { PrismaClient as SqliteClient } from "@/prisma/generated-sqlite/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
    prisma: PostgresClient | undefined;
};

function createPrismaClient(): PostgresClient {
    if (process.env.USE_SQLITE === "true") {
        const adapter = new PrismaBetterSqlite3({
            url: process.env.DATABASE_URL_SQLITE!,
        });

        return new SqliteClient({ adapter }) as unknown as PostgresClient;
    }

    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
    });

    return new PostgresClient({ adapter });
}

export const prisma =
    globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}