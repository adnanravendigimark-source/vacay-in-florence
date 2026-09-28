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

export type CategoryStatus = "draft" | "published";

export interface CategorySummary {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  icon: CategoryIcon;
  image: PlaceholderImage;
  /** Falls back to `image` on the public site when not set. */
  heroImage: PlaceholderImage | null;
  productCount: number;
  featured: boolean;
  sortOrder: number;
  status: CategoryStatus;
  highlights: string[];
  badgeText: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  noIndex: boolean;
  noFollow: boolean;
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
  category: string;
  readingTimeMinutes: number;
  publishedAt: string;
  image: PlaceholderImage;
}

export interface BlogCategorySummary {
  name: string;
  slug: string;
  postCount: number;
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
// CMS static pages (About, Contact, legal pages, Supplier/Affiliate) — all
// share the same cms_blocks pattern (key -> jsonb), see
// src/lib/data/site-content.ts. SeoFields is the shared per-page SEO shape:
// these are fixed-route pages (their URL is the folder structure, not a
// stored slug), so admin controls the meta title/description/OG image and
// indexing, not the URL itself.
// ---------------------------------------------------------------------------

export interface SeoFields {
  title: string;
  description: string;
  ogImage?: string | null;
  noIndex?: boolean;
}

export interface AboutPageContent {
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
  };
  story: { heading: string; paragraphs: string[] };
  valuesHeading: string;
  values: { id: string; title: string; description: string }[];
  stats: { label: string; value: string }[];
  cta: { heading: string; body: string; buttonLabel: string; buttonHref: string };
  seo: SeoFields;
}

/** Shared shape for Privacy Policy, Terms & Conditions, Cancellation & Refund Policy. */
export interface LegalPageContent {
  title: string;
  effectiveDate: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
  seo: SeoFields;
}

/** Contact Us — a mailto card + info cards, intentionally no live form. */
export interface SiteSettingsContent {
  tagline: string;
  copyrightName: string;
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
    pinterest: string;
  };
}

export interface ContactPageContent {
  hero: { badge: string; headline: string; subheadline: string };
  email: string;
  emailLabel: string;
  emailNote: string;
  infoCards: { id: string; icon: "help" | "partnership" | "mail"; title: string; description: string }[];
  existingBookingNote: string;
  ctaEyebrow: string;
  ctaButtonLabel: string;
  ctaButtonHref: string;
  seo: SeoFields;
}

/**
 * One configurable field on the Supplier/Affiliate application form. `id`
 * is a stable key matching the underlying FormData field name and the
 * zod/validation + lead-payload code — it is fixed, not admin-editable;
 * only label/placeholder/required/visible are. `name` and `email` are
 * always required and visible (a lead is useless without them) and are
 * not offered as togglable in the admin UI, even though they appear in
 * this same list for label/placeholder editing.
 */
export interface LeadFormFieldConfig {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
  visible: boolean;
}

/** Shared shape for the Become a Supplier and Become an Affiliate pages. */
export interface LeadPageContent {
  hero: { eyebrow: string; headline: string; subheadline: string };
  benefits: { id: string; title: string; description: string }[];
  formHeading: string;
  formSubheading: string;
  submitButtonLabel: string;
  successMessage: string;
  fields: LeadFormFieldConfig[];
  seo: SeoFields;
}

/**
 * CMS-managed copy for the /blog hero banner — same cms_blocks pattern
 * (key "blog") as HomepageContent/AboutPageContent, see
 * src/lib/data/site-content.ts.
 */
export interface BlogPageContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  searchPlaceholder: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
}
