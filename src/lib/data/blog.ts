import { eq, and, desc, lte, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import type { BlogPostSummary } from "@/lib/types";

function toSummary(row: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readingTimeMinutes: number;
  publishedAt: Date | null;
  coverImageUrl: string;
  coverImageAlt: string;
}): BlogPostSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    readingTimeMinutes: row.readingTimeMinutes,
    publishedAt: (row.publishedAt ?? new Date()).toISOString().slice(0, 10),
    image: { src: row.coverImageUrl, alt: row.coverImageAlt },
  };
}

const published = () => and(sql`${blogPosts.publishedAt} IS NOT NULL`, lte(blogPosts.publishedAt, new Date()));

export async function getLatestBlogPosts(limit = 3): Promise<BlogPostSummary[]> {
  const rows = await db
    .select()
    .from(blogPosts)
    .where(published())
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);
  return rows.map(toSummary);
}

export interface PaginatedBlogPosts {
  items: BlogPostSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getBlogPosts(page = 1, pageSize = 9): Promise<PaginatedBlogPosts> {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(24, Math.max(1, pageSize));

  // ::int — Postgres count() is bigint; node-postgres would otherwise return a string.
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(blogPosts).where(published());

  const rows = await db
    .select()
    .from(blogPosts)
    .where(published())
    .orderBy(desc(blogPosts.publishedAt))
    .limit(safePageSize)
    .offset((safePage - 1) * safePageSize);

  return {
    items: rows.map(toSummary),
    total: count,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(count / safePageSize)),
  };
}

export interface BlogPostDetail extends BlogPostSummary {
  body: string;
  tags: string[];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const [row] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), published()));
  if (!row) return null;
  return {
    ...toSummary(row),
    body: row.body,
    tags: row.tags as string[],
  };
}

export async function getRelatedBlogPosts(currentSlug: string, limit = 3): Promise<BlogPostSummary[]> {
  const rows = await db
    .select()
    .from(blogPosts)
    .where(and(published(), ne(blogPosts.slug, currentSlug)))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);
  return rows.map(toSummary);
}
