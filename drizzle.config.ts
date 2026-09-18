import { defineConfig } from "drizzle-kit";

// Local dev target: a SQLite file kept outside the repo (gitignored).
// Swapping to real Neon Postgres later means changing `dialect`/`dbCredentials`
// here and porting src/lib/db/schema.ts to drizzle-orm/pg-core — see the
// dialect note at the top of that file.
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL_SQLITE ?? "./local.db",
  },
});
