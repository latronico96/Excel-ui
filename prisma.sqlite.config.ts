
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.sqlite.prisma",
  migrations: {
    path: "prisma/migrations-sqlite",
  },
  datasource: {
    url: "file:./dev.db",
  },
});
