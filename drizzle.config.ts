import { defineConfig } from "drizzle-kit";

// Neon Postgres (see src/lib/db/index.ts for the runtime client).
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
