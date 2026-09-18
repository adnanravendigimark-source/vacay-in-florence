import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cmsBlocks } from "@/lib/db/schema";
import type { HomepageContent } from "@/lib/types";
import { homepageContent as fallbackHomepageContent } from "@/lib/data/seed/site-content";

/**
 * The one query the Master Admin's homepage-copy edits actually hit.
 * Falls back to the last-known-good bundled content (not a network call,
 * just a TS import) if the "homepage" CMS row is ever missing — a CMS
 * outage or an unseeded database should degrade to stale-but-correct
 * copy, never a broken homepage.
 */
export async function getHomepageContent(): Promise<HomepageContent> {
  const row = db.select().from(cmsBlocks).where(eq(cmsBlocks.key, "homepage")).get();
  if (!row) return fallbackHomepageContent;
  return row.content as HomepageContent;
}
