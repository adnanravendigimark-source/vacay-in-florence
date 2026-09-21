import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

/**
 * Ensures the Postgres extension and indexes the smart search bar
 * depends on (see src/lib/data/search.ts) exist in the real database.
 *
 * This project applies schema changes with `drizzle-kit push` rather than
 * checked-in migration files (see drizzle.config.ts), and the two are
 * meant to converge on the same DDL — the index definitions here mirror
 * the ones declared on `products`/`categories` in src/lib/db/schema.ts.
 * Declared here as idempotent, run-at-startup SQL (guarded so it only
 * ever runs once per server process) so a fresh environment gets a
 * working search index without a manual migration step, and re-running
 * it (hot reload, redeploy) is always a safe no-op via `IF NOT EXISTS`.
 */
const globalForSearchIndexes = globalThis as unknown as {
  __searchIndexesEnsured__?: Promise<void>;
};

export function ensureSearchIndexes(): Promise<void> {
  if (!globalForSearchIndexes.__searchIndexesEnsured__) {
    globalForSearchIndexes.__searchIndexesEnsured__ = run().catch((error) => {
      // Don't poison the singleton on failure — allow a later call (e.g.
      // the next request) to retry instead of permanently giving up for
      // the lifetime of the process.
      globalForSearchIndexes.__searchIndexesEnsured__ = undefined;
      console.error("[search-indexes] failed to ensure pg_trgm search indexes:", error);
      throw error;
    });
  }
  return globalForSearchIndexes.__searchIndexesEnsured__;
}

async function run(): Promise<void> {
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS products_title_trgm_idx ON products USING gin (title gin_trgm_ops)`,
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS products_short_description_trgm_idx ON products USING gin (short_description gin_trgm_ops)`,
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS categories_name_trgm_idx ON categories USING gin (name gin_trgm_ops)`,
  );
}
