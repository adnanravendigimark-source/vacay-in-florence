import "server-only";
import { db } from "@/lib/db";
import { products, categories, blogPosts } from "@/lib/db/schema";

export type SeoEntityType = "experience" | "category" | "blog_post";

export interface SeoAuditRow {
  entityType: SeoEntityType;
  id: string;
  title: string;
  slug: string;
  publicPath: string;
  editHref: string;
  hasMetaTitle: boolean;
  hasMetaDescription: boolean;
  noIndex: boolean;
}

/**
 * One flat list across every entity type that carries its own SEO
 * override fields (products/categories/blog_posts all gained the same
 * metaTitle/metaDescription/canonicalUrl/ogImage/noIndex/noFollow columns
 * — see schema.ts) — a completeness audit with deep links into each
 * entity's own SEO tab, not a duplicate editor.
 */
export async function listSeoAudit(): Promise<SeoAuditRow[]> {
  const [productRows, categoryRows, blogRows] = await Promise.all([
    db.select({ id: products.id, title: products.title, slug: products.slug, metaTitle: products.metaTitle, metaDescription: products.metaDescription, noIndex: products.noIndex }).from(products),
    db.select({ id: categories.id, title: categories.name, slug: categories.slug, metaTitle: categories.metaTitle, metaDescription: categories.metaDescription, noIndex: categories.noIndex }).from(categories),
    db.select({ id: blogPosts.id, title: blogPosts.title, slug: blogPosts.slug, metaTitle: blogPosts.metaTitle, metaDescription: blogPosts.metaDescription, noIndex: blogPosts.noIndex }).from(blogPosts),
  ]);

  const rows: SeoAuditRow[] = [
    ...productRows.map((r) => ({
      entityType: "experience" as const,
      id: r.id,
      title: r.title,
      slug: r.slug,
      publicPath: `/experiences/${r.slug}`,
      editHref: `/admin/experiences/${r.id}`,
      hasMetaTitle: !!r.metaTitle?.trim(),
      hasMetaDescription: !!r.metaDescription?.trim(),
      noIndex: r.noIndex,
    })),
    ...categoryRows.map((r) => ({
      entityType: "category" as const,
      id: r.id,
      title: r.title,
      slug: r.slug,
      publicPath: `/experiences/category/${r.slug}`,
      editHref: `/admin/categories/${r.id}`,
      hasMetaTitle: !!r.metaTitle?.trim(),
      hasMetaDescription: !!r.metaDescription?.trim(),
      noIndex: r.noIndex,
    })),
    ...blogRows.map((r) => ({
      entityType: "blog_post" as const,
      id: r.id,
      title: r.title,
      slug: r.slug,
      publicPath: `/blog/${r.slug}`,
      editHref: `/admin/blog/${r.id}`,
      hasMetaTitle: !!r.metaTitle?.trim(),
      hasMetaDescription: !!r.metaDescription?.trim(),
      noIndex: r.noIndex,
    })),
  ];

  return rows;
}
