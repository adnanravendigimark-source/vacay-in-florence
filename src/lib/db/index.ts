import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * Singleton DB client, backed by Neon Postgres over plain TCP
 * (node-postgres `Pool` against Neon's pooled connection string —
 * the `-pooler` host in DATABASE_URL is PgBouncer in transaction mode,
 * which is fine for the BEGIN/COMMIT transactions this app runs).
 *
 * node-postgres (rather than @neondatabase/serverless) was chosen
 * specifically because the checkout flow needs a real interactive
 * transaction — read current availability, decide whether to throw,
 * then write — and Neon's HTTP driver (neon-http) does not support
 * that; only a session-based Postgres connection does.
 *
 * Next.js dev-mode module reloading would otherwise open a fresh pool
 * on every hot reload; stashing it on `globalThis` avoids that,
 * mirroring the usual Prisma-client-singleton pattern.
 */
const globalForDb = globalThis as unknown as {
  __pgPool__?: InstanceType<typeof Pool>;
};

const pool =
  globalForDb.__pgPool__ ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__pgPool__ = pool;
}

export const db = drizzle(pool, { schema });
