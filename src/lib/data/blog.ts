import { eq, and, desc, lte, ne, sql, SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import type { BlogPostSummary, BlogCategorySummary } from "@/lib/types";
import { ensureBlogSearchIndexes } from "@/lib/db/blog-search-indexes";
import { tokenizeSearchQuery } from "@/lib/data/products";

function toSummary(row: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
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
    category: row.category,
    readingTimeMinutes: row.readingTimeMinutes,
    publishedAt: (row.publishedAt ?? new Date()).toISOString().slice(0, 10),
    image: { src: row.coverImageUrl, alt: row.coverImageAlt },
  };
}

// A post is live once it has a publishedAt timestamp that isn't in the
// future — lets content be queued ("publish next Tuesday") just by
// setting a future date, with no separate draft/status flag needed.
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
  return searchBlogPosts({ page, pageSize });
}

export interface SearchBlogPostsParams {
  q?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Fuzzy/partial-match WHERE condition across title, excerpt, and tags —
 * the blog's much smaller-scale counterpart to
 * src/lib/data/products.ts's buildSearchCondition. Reuses the same
 * tokenizeSearchQuery() so a query typed into the blog search box and
 * the experiences search box normalize identically, and the same
 * ILIKE + word_similarity combination (see products.ts for the full
 * rationale) rather than a second, subtly different search algorithm.
 */
function buildBlogSearchCondition(rawQuery: string): SQL {
  const tokens = tokenizeSearchQuery(rawQuery);
  const WORD_SIMILARITY_THRESHOLD = 0.42;

  const tokenConditions = tokens.map((token) => {
    const like = `%${token}%`;
    return sql`(
      ${blogPosts.title} ILIKE ${like}
      OR ${blogPosts.excerpt} ILIKE ${like}
      OR word_similarity(${token}, ${blogPosts.title}) > ${WORD_SIMILARITY_THRESHOLD}
    )`;
  });

  return tokenConditions.length > 0 ? sql.join(tokenConditions, sql` AND `) : sql`TRUE`;
}

export type SearchBlogPostsResult = PaginatedBlogPosts;

/**
 * Backs the /blog listing page, /blog/category/[slug], and the
 * /api/blog/search infinite-scroll route — one server-side, paginated,
 * always-filtered-to-published query. Deliberately server-side rather
 * than "fetch every post, filter in the browser" (the pattern the
 * Amsterdam reference repo's blog uses): that approach re-downloads the
 * entire post table on every page load and gets slower, not just
 * bigger, as the blog grows. This instead follows the same
 * server-paginated shape already established by searchProducts() for
 * /experiences, so the blog scales the same way the product catalog
 * does and both listing pages share one mental model.
 */
export async function searchBlogPosts(params: SearchBlogPostsParams = {}): Promise<SearchBlogPostsResult> {
  const page = Math.max(1, params.page ?? 1);
  // Capped well above /blog's own pageSize (9) — generateStaticParams in
  // blog/[slug]/page.tsx and the sitemap ask for the full published set
  // in one page, same reasoning as searchProducts' own cap.
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 9));

  const hasQuery = Boolean(params.q && params.q.trim().length > 0);
  if (hasQuery) {
    await ensureBlogSearchIndexes();
  }

  const conditions: SQL[] = [published()!];
  if (params.category) {
    conditions.push(eq(blogPosts.category, params.category));
  }
  if (hasQuery) {
    conditions.push(buildBlogSearchCondition(params.q!));
  }
  const where = and(...conditions) ?? published();

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(blogPosts).where(where);

  const rows = await db
    .select()
    .from(blogPosts)
    .where(where)
    .orderBy(desc(blogPosts.publishedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    items: rows.map(toSummary),
    total: count,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
  };
}

/**
 * Distinct published categories with live post counts, ordered by count
 * descending — backs the category filter pills on /blog. Grouped
 * straight off blog_posts.category (see schema.ts for why this is a
 * plain text column rather than a join to a categories table).
 */
export async function getBlogCategories(): Promise<BlogCategorySummary[]> {
  const rows = await db
    .select({ category: blogPosts.category, count: sql<number>`count(*)::int` })
    .from(blogPosts)
    .where(published())
    .groupBy(blogPosts.category)
    .orderBy(desc(sql`count(*)`));

  return rows.map((row) => ({
    name: row.category,
    slug: slugifyCategory(row.category),
    postCount: row.count,
  }));
}

export async function getBlogCategoryBySlug(slug: string): Promise<BlogCategorySummary | null> {
  const categories = await getBlogCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export function slugifyCategory(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export interface BlogPostSeo {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string | null;
  ogImage: string | null;
  noIndex: boolean;
  noFollow: boolean;
}

export interface BlogPostDetail extends BlogPostSummary {
  body: string;
  tags: string[];
  author: string;
  quickAnswer: string;
  seo: BlogPostSeo;
  cta: {
    heading: string;
    body: string;
    buttonText: string;
    buttonHref: string;
  };
}

function toDetail(row: typeof blogPosts.$inferSelect): BlogPostDetail {
  return {
    ...toSummary(row),
    body: row.body,
    tags: row.tags as string[],
    author: row.author,
    quickAnswer: row.quickAnswer,
    seo: {
      metaTitle: row.metaTitle?.trim() || row.title,
      metaDescription: row.metaDescription?.trim() || row.excerpt,
      canonicalUrl: row.canonicalUrl,
      ogImage: row.ogImage,
      noIndex: row.noIndex,
      noFollow: row.noFollow,
    },
    cta: {
      heading: row.ctaHeading,
      body: row.ctaBody,
      buttonText: row.ctaButtonText,
      buttonHref: row.ctaButtonHref,
    },
  };
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const [row] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), published()));
  if (!row) return null;
  return toDetail(row);
}

/**
 * Related posts for the bottom of an article — same category first
 * (most relevant to a reader who just finished this post), backfilled
 * with the most recent other posts if the category doesn't have enough
 * on its own. Simple two-query approach rather than a single fancy
 * ORDER BY: at blog-post volumes this is easier to read and just as
 * fast, and it's the same trade-off the reference repo's own
 * getRelatedPosts() makes (there, no category weighting at all).
 */
export async function getRelatedBlogPosts(currentSlug: string, category: string, limit = 3): Promise<BlogPostSummary[]> {
  const sameCategory = await db
    .select()
    .from(blogPosts)
    .where(and(published(), ne(blogPosts.slug, currentSlug), eq(blogPosts.category, category)))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);

  if (sameCategory.length >= limit) return sameCategory.map(toSummary);

  const excludeSlugs = [currentSlug, ...sameCategory.map((row) => row.slug)];
  const remaining = limit - sameCategory.length;
  const fillers = await db
    .select()
    .from(blogPosts)
    .where(
      and(
        published(),
        sql`${blogPosts.slug} NOT IN (${sql.join(excludeSlugs.map((s) => sql`${s}`), sql`, `)})`,
      ),
    )
    .orderBy(desc(blogPosts.publishedAt))
    .limit(remaining);

  return [...sameCategory, ...fillers].map(toSummary);
}
