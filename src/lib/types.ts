/**
 * Shared domain types for the VACAY Florence platform.
 *
 * These interfaces mirror the shape of the Postgres tables defined in
 * prisma/schema.prisma (categories, products, product_images, blog_posts,
 * cms_blocks). Components only ever import from here and from
 * `lib/data/*` — never from a data source directly — so swapping the mock
 * repositories in `lib/data` for real Prisma queries against Neon later
 * requires no change to any component.
 */

export type Money = {
  amount: number;
  currency: "EUR";
};

export type CategoryIcon =
  | "landmark"
  | "museum"
  | "tour-guide"
  | "food-wine"
  | "day-trip"
  | "outdoor";

export interface CategorySummary {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  icon: CategoryIcon;
  image: PlaceholderImage;
  productCount: number;
  featured: boolean;
  sortOrder: number;
}

export type ProductBadge =
  | "free-cancellation"
  | "skip-the-line"
  | "best-seller"
  | "small-group"
  | "instant-confirmation";

export interface PlaceholderImage {
  src: string;
  alt: string;
}

export interface ProductCardSummary {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  categorySlug: string;
  categoryName: string;
  supplierName: string;
  durationLabel: string;
  ratingAverage: number | null;
  reviewCount: number;
  priceFrom: Money;
  badges: ProductBadge[];
  image: PlaceholderImage;
}

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readingTimeMinutes: number;
  publishedAt: string;
  image: PlaceholderImage;
}

export interface TrustHighlight {
  id: string;
  title: string;
  description: string;
  icon: "shield" | "clock" | "star" | "support" | "confirmation";
}

export interface HomepageContent {
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    stats: { label: string; value: string }[];
  };
  trust: {
    heading: string;
    subheading: string;
    highlights: TrustHighlight[];
  };
  cta: {
    heading: string;
    subheading: string;
    primaryCta: { label: string; href: string };
  };
}

// ---------------------------------------------------------------------------
// About Us + legal pages (CMS-managed, same cms_blocks pattern as
// HomepageContent — see src/lib/data/site-content.ts)
// ---------------------------------------------------------------------------

export interface AboutPageContent {
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
  };
  story: { heading: string; paragraphs: string[] };
  values: { id: string; title: string; description: string }[];
  stats: { label: string; value: string }[];
}

/** Shared shape for Privacy Policy, Terms & Conditions, Cancellation & Refund Policy. */
export interface LegalPageContent {
  title: string;
  effectiveDate: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}
