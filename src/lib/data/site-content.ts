import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cmsBlocks } from "@/lib/db/schema";
import type { HomepageContent, AboutPageContent, LegalPageContent } from "@/lib/types";
import {
  homepageContent as fallbackHomepageContent,
  aboutPageContent as fallbackAboutPageContent,
  privacyPolicyContent as fallbackPrivacyPolicyContent,
  termsContent as fallbackTermsContent,
  cancellationPolicyContent as fallbackCancellationPolicyContent,
} from "@/lib/data/seed/site-content";

/**
 * The one query the Master Admin's homepage-copy edits actually hit.
 * Falls back to the last-known-good bundled content (not a network call,
 * just a TS import) if the "homepage" CMS row is ever missing — a CMS
 * outage or an unseeded database should degrade to stale-but-correct
 * copy, never a broken homepage.
 */
export async function getHomepageContent(): Promise<HomepageContent> {
  const [row] = await db.select().from(cmsBlocks).where(eq(cmsBlocks.key, "homepage"));
  if (!row) return fallbackHomepageContent;
  return row.content as HomepageContent;
}

/** Same CMS-block pattern as the homepage — see getHomepageContent above. */
export async function getAboutPageContent(): Promise<AboutPageContent> {
  const [row] = await db.select().from(cmsBlocks).where(eq(cmsBlocks.key, "about"));
  if (!row) return fallbackAboutPageContent;
  return row.content as AboutPageContent;
}

const LEGAL_FALLBACKS: Record<string, LegalPageContent> = {
  "privacy-policy": fallbackPrivacyPolicyContent,
  "terms-conditions": fallbackTermsContent,
  "cancellation-policy": fallbackCancellationPolicyContent,
};

/**
 * Backs Privacy Policy, Terms & Conditions, and the Cancellation &
 * Refund Policy — three long-form legal pages that share one shape
 * (title, effective date, intro, sections), so one function and one
 * `cms_blocks` key pattern covers all three rather than three near-
 * identical tables or query functions.
 */
export async function getLegalPageContent(
  key: "privacy-policy" | "terms-conditions" | "cancellation-policy",
): Promise<LegalPageContent> {
  const [row] = await db.select().from(cmsBlocks).where(eq(cmsBlocks.key, key));
  if (!row) return LEGAL_FALLBACKS[key];
  return row.content as LegalPageContent;
}
