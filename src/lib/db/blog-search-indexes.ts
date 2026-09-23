import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

/**
 * Ensures the pg_trgm indexes the blog search bar depends on exist —
 * same idempotent, run-once-per-process pattern as
 * src/lib/db/search-indexes.ts (the product catalog's equivalent).
 * `CREATE EXTENSION IF NOT EXISTS pg_trgm` is itself idempotent, so this
 * is safe to call alongside that module even though both would otherwise
 * race to create the same extension.
 */
const globalForBlogSearchIndexes = globalThis as unknown as {
  __blogSearchIndexesEnsured__?: Promise<void>;
};

export function ensureBlogSearchIndexes(): Promise<void> {
  if (!globalForBlogSearchIndexes.__blogSearchIndexesEnsured__) {
    globalForBlogSearchIndexes.__blogSearchIndexesEnsured__ = run().catch((error) => {
      globalForBlogSearchIndexes.__blogSearchIndexesEnsured__ = undefined;
      console.error("[blog-search-indexes] failed to ensure pg_trgm search indexes:", error);
      throw error;
    });
  }
  return globalForBlogSearchIndexes.__blogSearchIndexesEnsured__;
}

async function run(): Promise<void> {
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS blog_posts_title_trgm_idx ON blog_posts USING gin (title gin_trgm_ops)`,
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS blog_posts_excerpt_trgm_idx ON blog_posts USING gin (excerpt gin_trgm_ops)`,
  );
}
