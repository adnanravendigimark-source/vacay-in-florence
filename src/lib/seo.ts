/**
 * Small SEO resolution helpers for the /blog pages — canonical URL,
 * robots directives, Open Graph field fallbacks, and Article JSON-LD.
 *
 * Scoped to blog for now rather than a site-wide refactor: the rest of
 * the app (homepage, /experiences, legal pages) builds its own inline
 * metadata/JSON-LD per page today, and this doesn't touch any of that —
 * it only backs the new per-post SEO override fields on blog_posts.
 */

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.vacayinflorence.com";
}

export function resolveRobots(
  noIndex: boolean,
  noFollow: boolean = noIndex,
): { index: boolean; follow: boolean } {
  return { index: !noIndex, follow: !noFollow };
}

export function resolveCanonical(path: string, override?: string | null): string {
  const trimmed = (override ?? "").trim();
  if (trimmed) return trimmed;
  return path === "/" ? "" : path;
}

export interface OgOverrideFields {
  ogImage?: string | null;
}

export interface OgFallback {
  title: string;
  description: string;
  image?: string;
}

export function resolveOg(fields: OgOverrideFields, fallback: OgFallback) {
  return {
    title: fallback.title,
    description: fallback.description,
    image: fields.ogImage?.trim() || fallback.image || "",
  };
}

export function buildArticleJsonLd(article: {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  authorName: string;
  siteName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    ...(article.image ? { image: [article.image] } : {}),
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    // Organization, not Person — no individual byline is backed by a
    // real author record yet, and asserting one would be exactly the
    // kind of unsupported schema this project's SEO work avoids
    // elsewhere (see the AggregateRating note on the product page).
    author: { "@type": "Organization", name: article.authorName },
    publisher: { "@type": "Organization", name: article.siteName },
    mainEntityOfPage: { "@type": "WebPage", "@id": article.url },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path,
    })),
  };
}
