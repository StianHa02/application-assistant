import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Default matches src/lib/db.ts, so `npm install` (prisma generate) works before .env exists.
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
