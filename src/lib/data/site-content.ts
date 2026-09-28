import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cmsBlocks } from "@/lib/db/schema";
import type {
  HomepageContent,
  AboutPageContent,
  LegalPageContent,
  BlogPageContent,
  ContactPageContent,
  LeadPageContent,
} from "@/lib/types";
import {
  homepageContent as fallbackHomepageContent,
  aboutPageContent as fallbackAboutPageContent,
  privacyPolicyContent as fallbackPrivacyPolicyContent,
  termsContent as fallbackTermsContent,
  cancellationPolicyContent as fallbackCancellationPolicyContent,
  blogPageContent as fallbackBlogPageContent,
  contactPageContent as fallbackContactPageContent,
  supplierPageContent as fallbackSupplierPageContent,
  affiliatePageContent as fallbackAffiliatePageContent,
} from "@/lib/data/seed/site-content";

/**
 * Generic upsert into cms_blocks, shared by every page-content save
 * action below (About, legal pages, Contact, Supplier, Affiliate) — one
 * write path for the whole key -> jsonb store, same pattern already
 * proven by the Homepage editor's own save flow.
 */
async function setCmsBlock(key: string, content: unknown, updatedBy: string | null): Promise<void> {
  await db
    .insert(cmsBlocks)
    .values({ key, content: content as object, updatedBy, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: cmsBlocks.key,
      set: { content: content as object, updatedBy, updatedAt: new Date() },
    });
}

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

export async function getAboutPageContent(): Promise<AboutPageContent> {
  const [row] = await db.select().from(cmsBlocks).where(eq(cmsBlocks.key, "about"));
  if (!row || !row.content) return fallbackAboutPageContent;
  const dbContent = row.content as Partial<AboutPageContent>;
  return {
    ...fallbackAboutPageContent,
    ...dbContent,
    hero: { ...fallbackAboutPageContent.hero, ...(dbContent.hero || {}) },
    story: { ...fallbackAboutPageContent.story, ...(dbContent.story || {}) },
    cta: { ...fallbackAboutPageContent.cta, ...(dbContent.cta || {}) },
    seo: { ...fallbackAboutPageContent.seo, ...(dbContent.seo || {}) },
  };
}

/** Same CMS-block pattern as the homepage — backs the /blog hero banner. */
export async function getBlogPageContent(): Promise<BlogPageContent> {
  const [row] = await db.select().from(cmsBlocks).where(eq(cmsBlocks.key, "blog"));
  if (!row || !row.content) return fallbackBlogPageContent;
  const dbContent = row.content as Partial<BlogPageContent>;
  return {
    ...fallbackBlogPageContent,
    ...dbContent,
  };
}

const LEGAL_FALLBACKS: Record<string, LegalPageContent> = {
  "privacy-policy": fallbackPrivacyPolicyContent,
  "terms-conditions": fallbackTermsContent,
  "cancellation-policy": fallbackCancellationPolicyContent,
};

export type LegalPageKey = "privacy-policy" | "terms-conditions" | "cancellation-policy";

/**
 * Backs Privacy Policy, Terms & Conditions, and the Cancellation &
 * Refund Policy — three long-form legal pages that share one shape
 * (title, effective date, intro, sections), so one function and one
 * `cms_blocks` key pattern covers all three rather than three near-
 * identical tables or query functions.
 */
export async function getLegalPageContent(key: LegalPageKey): Promise<LegalPageContent> {
  const fallback = LEGAL_FALLBACKS[key] || fallbackPrivacyPolicyContent;
  const [row] = await db.select().from(cmsBlocks).where(eq(cmsBlocks.key, key));
  if (!row || !row.content) return fallback;
  const dbContent = row.content as Partial<LegalPageContent>;
  return {
    ...fallback,
    ...dbContent,
    sections: dbContent.sections && dbContent.sections.length > 0 ? dbContent.sections : fallback.sections,
    seo: { ...fallback.seo, ...(dbContent.seo || {}) },
  };
}

/** Contact Us — mailto card, info cards, no live form (by design). */
export async function getContactPageContent(): Promise<ContactPageContent> {
  const [row] = await db.select().from(cmsBlocks).where(eq(cmsBlocks.key, "contact"));
  if (!row || !row.content) return fallbackContactPageContent;
  const dbContent = row.content as Partial<ContactPageContent>;
  return {
    ...fallbackContactPageContent,
    ...dbContent,
    hero: { ...fallbackContactPageContent.hero, ...(dbContent.hero || {}) },
    infoCards: dbContent.infoCards && dbContent.infoCards.length > 0 ? dbContent.infoCards : fallbackContactPageContent.infoCards,
    seo: { ...fallbackContactPageContent.seo, ...(dbContent.seo || {}) },
  };
}

/** Become a Supplier. */
export async function getSupplierPageContent(): Promise<LeadPageContent> {
  const [row] = await db.select().from(cmsBlocks).where(eq(cmsBlocks.key, "become-a-supplier"));
  if (!row || !row.content) return fallbackSupplierPageContent;
  const dbContent = row.content as Partial<LeadPageContent>;
  return {
    ...fallbackSupplierPageContent,
    ...dbContent,
    hero: { ...fallbackSupplierPageContent.hero, ...(dbContent.hero || {}) },
    benefits: dbContent.benefits && dbContent.benefits.length > 0 ? dbContent.benefits : fallbackSupplierPageContent.benefits,
    fields: dbContent.fields && dbContent.fields.length > 0 ? dbContent.fields : fallbackSupplierPageContent.fields,
    seo: { ...fallbackSupplierPageContent.seo, ...(dbContent.seo || {}) },
  };
}

/** Become an Affiliate. */
export async function getAffiliatePageContent(): Promise<LeadPageContent> {
  const [row] = await db.select().from(cmsBlocks).where(eq(cmsBlocks.key, "affiliates"));
  if (!row || !row.content) return fallbackAffiliatePageContent;
  const dbContent = row.content as Partial<LeadPageContent>;
  return {
    ...fallbackAffiliatePageContent,
    ...dbContent,
    hero: { ...fallbackAffiliatePageContent.hero, ...(dbContent.hero || {}) },
    benefits: dbContent.benefits && dbContent.benefits.length > 0 ? dbContent.benefits : fallbackAffiliatePageContent.benefits,
    fields: dbContent.fields && dbContent.fields.length > 0 ? dbContent.fields : fallbackAffiliatePageContent.fields,
    seo: { ...fallbackAffiliatePageContent.seo, ...(dbContent.seo || {}) },
  };
}

// ---------------------------------------------------------------------------
// Writes — one per editable page, all thin wrappers over setCmsBlock() so
// each save action gets a typed, specific function to call rather than a
// bare string key + `unknown` content.
// ---------------------------------------------------------------------------

export async function updateAboutPageContent(content: AboutPageContent, updatedBy: string | null) {
  await setCmsBlock("about", content, updatedBy);
}

export async function updateLegalPageContent(
  key: LegalPageKey,
  content: LegalPageContent,
  updatedBy: string | null,
) {
  await setCmsBlock(key, content, updatedBy);
}

export async function updateContactPageContent(content: ContactPageContent, updatedBy: string | null) {
  await setCmsBlock("contact", content, updatedBy);
}

export async function updateSupplierPageContent(content: LeadPageContent, updatedBy: string | null) {
  await setCmsBlock("become-a-supplier", content, updatedBy);
}

export async function updateAffiliatePageContent(content: LeadPageContent, updatedBy: string | null) {
  await setCmsBlock("affiliates", content, updatedBy);
}
