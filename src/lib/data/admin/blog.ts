import "server-only";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { isRichHtmlBody, sanitizeRichBody } from "@/lib/blog/rich-content";
import type { BlogPostFormData } from "@/lib/validation/blog";

/**
 * Admin-scoped repository over `blog_posts` — unlike src/lib/data/blog.ts
 * (the public repository, which only ever returns published rows), every
 * function here can see and act on drafts too. Reads and writes the same
 * table and columns the public blog pages read — there is no separate
 * admin content store.
 */

export interface MutationResult {
  success: boolean;
  id?: string;
  error?: string;
}

export type AdminBlogStatus = "draft" | "published";

export interface AdminBlogListItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  status: AdminBlogStatus;
  publishedAt: string | null;
  coverImageUrl: string;
  coverImageAlt: string;
}

export interface AdminBlogPostDetail {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
  author: string;
  status: AdminBlogStatus;
  publishDate: string;
  quickAnswer: string;
  coverImageUrl: string;
  coverImageAlt: string;
  readingTimeMinutes: number;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  noIndex: boolean;
  noFollow: boolean;
  ctaHeading: string;
  ctaBody: string;
  ctaButtonText: string;
  ctaButtonHref: string;
}

function statusOf(publishedAt: Date | null): AdminBlogStatus {
  return publishedAt && publishedAt.getTime() <= Date.now() ? "published" : "draft";
}

function toListItem(row: typeof blogPosts.$inferSelect): AdminBlogListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    author: row.author,
    status: statusOf(row.publishedAt),
    publishedAt: row.publishedAt ? row.publishedAt.toISOString().slice(0, 10) : null,
    coverImageUrl: row.coverImageUrl,
    coverImageAlt: row.coverImageAlt,
  };
}

function toDetail(row: typeof blogPosts.$inferSelect): AdminBlogPostDetail {
  const publishDate = row.publishedAt ?? new Date();
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    category: row.category,
    tags: row.tags as string[],
    author: row.author,
    status: statusOf(row.publishedAt),
    publishDate: publishDate.toISOString().slice(0, 10),
    quickAnswer: row.quickAnswer,
    coverImageUrl: row.coverImageUrl,
    coverImageAlt: row.coverImageAlt,
    readingTimeMinutes: row.readingTimeMinutes,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    canonicalUrl: row.canonicalUrl,
    ogImage: row.ogImage,
    noIndex: row.noIndex,
    noFollow: row.noFollow,
    ctaHeading: row.ctaHeading,
    ctaBody: row.ctaBody,
    ctaButtonText: row.ctaButtonText,
    ctaButtonHref: row.ctaButtonHref,
  };
}

export async function listAdminBlogPosts(): Promise<AdminBlogListItem[]> {
  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt));
  return rows.map(toListItem);
}

export async function getAdminBlogPostById(id: string): Promise<AdminBlogPostDetail | null> {
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  return row ? toDetail(row) : null;
}

async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const rows = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, slug));
  return rows.some((r) => r.id !== excludeId);
}

/**
 * ~200 words/minute, same reading-speed assumption most blogs use.
 * Reading time isn't a field the admin fills in — it's always derived
 * fresh from whatever the article body currently says, so it can never
 * drift out of sync with a heavily edited post.
 */
function computeReadingTimeMinutes(body: string): number {
  const text = body.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Compiles the form's `status` + `publishDate` pair into the single
 * `publishedAt` timestamp column: "draft" always stores NULL regardless
 * of the chosen date (so it never accidentally goes live from a stale
 * date left over from a previous draft), "published" stores that date at
 * local midnight — matching src/lib/data/blog.ts's `published()` filter
 * (NULL or a future date == not live yet).
 */
function resolvePublishedAt(input: BlogPostFormData): Date | null {
  if (input.status === "draft") return null;
  const parsed = new Date(`${input.publishDate}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function baseBlogPostValues(input: BlogPostFormData) {
  const body = isRichHtmlBody(input.body) ? sanitizeRichBody(input.body) : input.body;
  return {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    body,
    coverImageUrl: input.coverImageUrl,
    coverImageAlt: input.coverImageAlt,
    readingTimeMinutes: computeReadingTimeMinutes(body),
    tags: input.tags,
    publishedAt: resolvePublishedAt(input),
    category: input.category,
    author: input.author,
    quickAnswer: input.quickAnswer,
    metaTitle: input.metaTitle || null,
    metaDescription: input.metaDescription || null,
    canonicalUrl: input.canonicalUrl || null,
    ogImage: input.ogImage || null,
    noIndex: input.noIndex,
    noFollow: input.noFollow,
    ctaHeading: input.ctaHeading,
    ctaBody: input.ctaBody,
    ctaButtonText: input.ctaButtonText,
    ctaButtonHref: input.ctaButtonHref,
  };
}

export async function createBlogPost(input: BlogPostFormData): Promise<MutationResult> {
  if (await slugTaken(input.slug)) {
    return { success: false, error: "That slug is already used by another post." };
  }
  try {
    const [row] = await db.insert(blogPosts).values(baseBlogPostValues(input)).returning({ id: blogPosts.id });
    return { success: true, id: row.id };
  } catch (err) {
    console.error("[admin/blog] createBlogPost failed:", err);
    return { success: false, error: "Could not create the post. Please try again." };
  }
}

export async function updateBlogPost(id: string, input: BlogPostFormData): Promise<MutationResult> {
  if (await slugTaken(input.slug, id)) {
    return { success: false, error: "That slug is already used by another post." };
  }
  try {
    await db
      .update(blogPosts)
      .set({ ...baseBlogPostValues(input), updatedAt: new Date() })
      .where(eq(blogPosts.id, id));
    return { success: true, id };
  } catch (err) {
    console.error("[admin/blog] updateBlogPost failed:", err);
    return { success: false, error: "Could not save changes. Please try again." };
  }
}

export async function deleteBlogPost(id: string): Promise<MutationResult> {
  try {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return { success: true };
  } catch (err) {
    console.error("[admin/blog] deleteBlogPost failed:", err);
    return { success: false, error: "Could not delete the post. Please try again." };
  }
}

/** Publish now (if currently draft) or unpublish (back to draft, publishedAt NULL). */
export async function setBlogPostStatus(id: string, status: AdminBlogStatus): Promise<MutationResult> {
  try {
    const publishedAt = status === "published" ? new Date() : null;
    await db.update(blogPosts).set({ publishedAt, updatedAt: new Date() }).where(eq(blogPosts.id, id));
    return { success: true };
  } catch (err) {
    console.error("[admin/blog] setBlogPostStatus failed:", err);
    return { success: false, error: "Could not update status." };
  }
}
