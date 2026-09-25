import {
  pgTable,
  text,
  integer,
  boolean,
  doublePrecision,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * VACAY Florence — production schema (Neon Postgres via node-postgres).
 *
 * Ported from the original SQLite (better-sqlite3) local-dev schema, per
 * the approved plan: "SQLite now, real Neon Postgres later." The table
 * and column shapes are unchanged from the SQLite version; only the
 * dialect-specific column-type functions changed (text -> text,
 * integer(mode:boolean) -> boolean, integer(mode:timestamp) -> timestamp,
 * real -> doublePrecision, text(mode:json) -> jsonb).
 *
 * ID strategy: text UUIDs generated at the application layer
 * (crypto.randomUUID() via $defaultFn) — unchanged, so no id remapping
 * was needed when moving off SQLite.
 *
 * Money: stored as `doublePrecision` (amount) + `text` (currency) pairs
 * mirroring the `Money` type in src/lib/types.ts. Fine for a
 * single-currency (EUR) MVP; would move to integer minor-units if
 * multi-currency rounding ever becomes a real requirement — not needed
 * yet, so not built now.
 */

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestamps = {
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
};

// ---------------------------------------------------------------------------
// Catalog: categories, suppliers, products
// ---------------------------------------------------------------------------

export const categories = pgTable(
  "categories",
  {
    id: id(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    shortDescription: text("short_description").notNull(),
    icon: text("icon").notNull(),
    imageUrl: text("image_url").notNull(),
    imageAlt: text("image_alt").notNull(),
    parentId: text("parent_id"),
    featured: boolean("featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    // Per-category SEO overrides — same pattern as products/blogPosts.
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    canonicalUrl: text("canonical_url"),
    ogImage: text("og_image"),
    noIndex: boolean("no_index").notNull().default(false),
    noFollow: boolean("no_follow").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("categories_slug_idx").on(t.slug),
    index("categories_featured_sort_idx").on(t.featured, t.sortOrder),
    // Trigram index backing fuzzy/partial category-name matching in the
    // smart search bar (see src/lib/data/search.ts) — lets `similarity()`
    // and `word_similarity()` lookups on `name` use an index scan instead
    // of a full table scan. Requires the `pg_trgm` extension, ensured at
    // runtime by src/lib/db/search-indexes.ts.
    index("categories_name_trgm_idx").using("gin", sql`${t.name} gin_trgm_ops`),
  ],
);

// pending | approved | rejected
export const suppliers = pgTable(
  "suppliers",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    // Existing seeded suppliers default to "approved" via the column
    // default below (drizzle-kit backfills existing rows on migration) —
    // no behavior change to the public site, which never reads this.
    status: text("status").notNull().default("approved"),
    contactName: text("contact_name"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    website: text("website"),
    taxId: text("tax_id"),
    country: text("country"),
    commissionRateOverride: doublePrecision("commission_rate_override"),
    notes: text("notes"),
    userId: text("user_id").references(() => users.id),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("suppliers_slug_idx").on(t.slug), index("suppliers_status_idx").on(t.status)],
);

// pending | approved | rejected | suspended
export const affiliates = pgTable(
  "affiliates",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    referralCode: text("referral_code").notNull(),
    status: text("status").notNull().default("pending"),
    contactPhone: text("contact_phone"),
    website: text("website"),
    commissionRateOverride: doublePrecision("commission_rate_override"),
    notes: text("notes"),
    userId: text("user_id").references(() => users.id),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("affiliates_referral_code_idx").on(t.referralCode),
    uniqueIndex("affiliates_email_idx").on(t.email),
    index("affiliates_status_idx").on(t.status),
  ],
);

// draft | pending_review | live | paused
export const products = pgTable(
  "products",
  {
    id: id(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    shortDescription: text("short_description").notNull(),
    description: text("description").notNull(),
    // JSON string[] — bullet lists rendered on the product detail page.
    highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
    inclusions: jsonb("inclusions").$type<string[]>().notNull().default([]),
    exclusions: jsonb("exclusions").$type<string[]>().notNull().default([]),
    meetingPoint: text("meeting_point"),
    // City / country, kept separate from the free-text venue/address above
    // so the location map and geocoding fallback (src/lib/geocoding.ts)
    // have a structured address to work with, and so this project isn't
    // implicitly hardcoded to Florence if it ever lists products elsewhere.
    meetingCity: text("meeting_city"),
    meetingCountry: text("meeting_country"),
    // Coordinates for the meeting point, used to render the real, dynamic
    // location map on the product page. Nullable — a product without
    // coordinates yet is server-side geocoded from meetingPoint/City/Country
    // on read (see getProductBySlug), and the result written back here so
    // the same address is never re-geocoded on every page view. Only shows
    // a non-fake empty state if geocoding has no address to work with, or
    // fails.
    meetingLat: doublePrecision("meeting_lat"),
    meetingLng: doublePrecision("meeting_lng"),
    cancellationPolicy: text("cancellation_policy").notNull(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    status: text("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    featuredRank: integer("featured_rank"),
    durationLabel: text("duration_label").notNull(),
    priceFromAmount: doublePrecision("price_from_amount").notNull(),
    priceFromCurrency: text("price_from_currency").notNull().default("EUR"),
    ratingAverage: doublePrecision("rating_average"),
    reviewCount: integer("review_count").notNull().default(0),
    // Editorial trust badges (admin-curated), e.g. "best-seller",
    // "skip-the-line" — rendered on ProductCardSummary. Kept as a JSON
    // array rather than a join table since these are simple flags, not
    // entities with their own attributes.
    badges: jsonb("badges").$type<string[]>().notNull().default([]),
    // Optional promo/walkthrough video for the product detail page's
    // gallery — same plain-mp4-URL convention as the homepage hero's
    // heroVideoUrl (src/lib/db/schema.ts homepageContent), not an embed.
    videoUrl: text("video_url"),
    // Per-product SEO overrides, all optional — same pattern as
    // blogPosts below, resolved against sensible fallbacks by
    // src/lib/seo.ts so existing products with no overrides set still
    // get correct metadata.
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    canonicalUrl: text("canonical_url"),
    ogImage: text("og_image"),
    noIndex: boolean("no_index").notNull().default(false),
    noFollow: boolean("no_follow").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_supplier_idx").on(t.supplierId),
    index("products_category_idx").on(t.categoryId),
    index("products_status_featured_idx").on(t.status, t.featured, t.featuredRank),
    // Trigram indexes power the smart search bar's partial-match and
    // spelling-tolerant search (similarity()/word_similarity() over
    // title + shortDescription) without falling back to a sequential
    // scan as the catalog grows. See src/lib/data/search.ts.
    index("products_title_trgm_idx").using("gin", sql`${t.title} gin_trgm_ops`),
    index("products_short_description_trgm_idx").using("gin", sql`${t.shortDescription} gin_trgm_ops`),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("product_images_product_sort_idx").on(t.productId, t.sortOrder)],
);

// Bookable variants of a product, e.g. "Adult", "Morning slot".
export const productOptions = pgTable(
  "product_options",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    priceAmount: doublePrecision("price_amount").notNull(),
    priceCurrency: text("price_currency").notNull().default("EUR"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [index("product_options_product_idx").on(t.productId, t.sortOrder)],
);

// One row per product per calendar date. capacityBooked is incremented
// atomically inside the order-creation transaction — this is the single
// source of truth checkout re-validates against before an order is
// allowed to reach pending_payment.
export const availability = pgTable(
  "availability",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // ISO date, YYYY-MM-DD
    capacityTotal: integer("capacity_total").notNull(),
    capacityBooked: integer("capacity_booked").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("availability_product_date_idx").on(t.productId, t.date),
    index("availability_date_idx").on(t.date),
  ],
);

// ---------------------------------------------------------------------------
// Content: blog + CMS-managed homepage copy
// ---------------------------------------------------------------------------

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: id(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    coverImageUrl: text("cover_image_url").notNull(),
    coverImageAlt: text("cover_image_alt").notNull(),
    readingTimeMinutes: integer("reading_time_minutes").notNull().default(4),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    publishedAt: timestamp("published_at", { mode: "date" }),

    // Taxonomy + attribution — category drives the /blog/category/[slug]
    // filter pills (grouped by this text column rather than a dedicated
    // categories table: post volume doesn't justify the extra join, and
    // this mirrors how the Amsterdam reference repo's blog models category
    // too). Author is a display label, not a user/account FK — the blog
    // has no per-author accounts yet.
    category: text("category").notNull().default("Travel Tips"),
    author: text("author").notNull().default("VACAY Florence Editorial"),

    // Optional single-sentence callout rendered at the top of the article
    // (an AI-search/snippet-friendly direct answer) — empty string means
    // "don't render it".
    quickAnswer: text("quick_answer").notNull().default(""),

    // Per-post SEO overrides, all optional — resolved against sensible
    // fallbacks (title/excerpt/cover image) by src/lib/seo.ts so existing
    // posts with no overrides set still get correct metadata.
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    canonicalUrl: text("canonical_url"),
    ogImage: text("og_image"),
    noIndex: boolean("no_index").notNull().default(false),
    noFollow: boolean("no_follow").notNull().default(false),

    // Bottom-of-article conversion card — defaults point at the general
    // catalog so every post has a working CTA even before anyone
    // customizes it per post.
    ctaHeading: text("cta_heading").notNull().default("Ready to plan your Florence trip?"),
    ctaBody: text("cta_body")
      .notNull()
      .default("Browse skip-the-line tickets, guided tours, and day trips — booked in minutes, free cancellation up to 24h before."),
    ctaButtonText: text("cta_button_text").notNull().default("Browse experiences"),
    ctaButtonHref: text("cta_button_href").notNull().default("/experiences"),

    ...timestamps,
  },
  (t) => [
    uniqueIndex("blog_posts_slug_idx").on(t.slug),
    index("blog_posts_published_idx").on(t.publishedAt),
    index("blog_posts_category_idx").on(t.category),
  ],
);

// Small typed key/value store the Master Admin uses to edit homepage copy
// without a page builder. `content` is validated against the matching
// TypeScript shape in src/lib/types.ts (HomepageContent) at the read edge.
export const cmsBlocks = pgTable("cms_blocks", {
  id: id(),
  key: text("key").notNull(),
  content: jsonb("content").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  updatedBy: text("updated_by"),
}, (t) => [uniqueIndex("cms_blocks_key_idx").on(t.key)]);

// ---------------------------------------------------------------------------
// Roles & permissions (RBAC) — Master Admin creates/edits roles and assigns
// permissions to them entirely from the dashboard; nothing about "what a
// role can do" is hardcoded in application code beyond the fixed catalog of
// possible permission keys seeded into `permissions` itself. `users.roleId`
// is null for an ordinary customer (today's only user type) and points at
// a row here for any staff account. See src/lib/require-user.ts for the
// enforcement side (requireAdmin/requirePermission).
// ---------------------------------------------------------------------------

export const roles = pgTable(
  "roles",
  {
    id: id(),
    name: text("name").notNull(),
    description: text("description"),
    // System roles (Super Admin) can be edited but not deleted from the UI —
    // protects the platform from ever being left with zero admin access.
    isSystem: boolean("is_system").notNull().default(false),
    ...timestamps,
  },
  (t) => [uniqueIndex("roles_name_idx").on(t.name)],
);

// Fixed catalog of possible permissions (seeded once). Which ROLES have
// which permissions is fully DB-editable; the catalog of what permissions
// *exist* is a short, deliberately-curated list maintained in code/seed,
// mirroring every admin module.
export const permissions = pgTable(
  "permissions",
  {
    id: id(),
    key: text("key").notNull(),
    label: text("label").notNull(),
    category: text("category").notNull(),
  },
  (t) => [uniqueIndex("permissions_key_idx").on(t.key)],
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("role_permissions_pair_idx").on(t.roleId, t.permissionId)],
);

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const users = pgTable(
  "users",
  {
    id: id(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    // Null = ordinary customer (every account before this column existed,
    // and every new signup by default). Non-null = a staff account whose
    // permissions come from the referenced role. See roles/permissions
    // above and src/lib/require-user.ts.
    roleId: text("role_id").references(() => roles.id),
    // Real account-profile fields (src/app/(public)/account/profile) —
    // all nullable/optional, since every existing account predates them.
    // Stored as plain text rather than a typed `date` column for
    // dateOfBirth: it's a simple "YYYY-MM-DD" from a <input type="date">,
    // and a text column sidesteps timezone-shift surprises for a field
    // nothing else in the app computes with.
    phone: text("phone"),
    dateOfBirth: text("date_of_birth"),
    nationality: text("nationality"),
    avatarUrl: text("avatar_url"),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email), index("users_role_idx").on(t.roleId)],
);

// email_verification | password_reset
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    type: text("type").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("verification_tokens_token_idx").on(t.token),
    index("verification_tokens_user_type_idx").on(t.userId, t.type),
  ],
);

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export const carts = pgTable("carts", {
  id: id(),
  // Nullable: guest carts exist before login, referenced by an httpOnly
  // cookie holding the cart id. Merged into the user's cart on login.
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const cartItems = pgTable(
  "cart_items",
  {
    id: id(),
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    productOptionId: text("product_option_id").references(() => productOptions.id),
    date: text("date").notNull(), // ISO date the experience is booked for
    // JSON snapshot of the selected option breakdown, e.g.
    // [{ optionId, optionName, quantity, unitPriceAmount }]
    participants: jsonb("participants")
      .$type<{ optionId: string; optionName: string; quantity: number; unitPriceAmount: number }[]>()
      .notNull(),
    currency: text("currency").notNull().default("EUR"),
    subtotalAmount: doublePrecision("subtotal_amount").notNull(),
    ...timestamps,
  },
  (t) => [index("cart_items_cart_idx").on(t.cartId)],
);

// ---------------------------------------------------------------------------
// Orders (booking flow stops at order review — no payment table yet)
// ---------------------------------------------------------------------------

// pending_payment | confirmed | cancelled | failed
export const orders = pgTable(
  "orders",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    status: text("status").notNull().default("pending_payment"),
    totalAmount: doublePrecision("total_amount").notNull(),
    currency: text("currency").notNull().default("EUR"),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone"),
    notes: text("notes"),
    ...timestamps,
  },
  (t) => [
    index("orders_user_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: id(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    productTitle: text("product_title").notNull(), // snapshot at booking time
    date: text("date").notNull(),
    participants: jsonb("participants")
      .$type<{ optionId: string; optionName: string; quantity: number; unitPriceAmount: number }[]>()
      .notNull(),
    currency: text("currency").notNull().default("EUR"),
    subtotalAmount: doublePrecision("subtotal_amount").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

// ---------------------------------------------------------------------------
// Public-form leads: contact, supplier applications, affiliate applications
// ---------------------------------------------------------------------------

// contact | supplier_application | affiliate_application
export const leadSubmissions = pgTable(
  "lead_submissions",
  {
    id: id(),
    type: text("type").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    message: text("message"),
    // Extra per-type fields (e.g. website URL, expected volume) that don't
    // deserve their own columns yet — kept as JSON rather than three
    // separate lead tables.
    payload: jsonb("payload"),
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("lead_submissions_type_status_idx").on(t.type, t.status)],
);
// ---------------------------------------------------------------------------
// CMS: Homepage Content
// ---------------------------------------------------------------------------

export const homepageContent = pgTable(
  "homepage_content",
  {
    id: text("id").primaryKey().default("default"),

    // 1. Hero Section
    heroEnabled: boolean("hero_enabled").notNull().default(true),
    heroBadge: text("hero_badge").notNull().default("OFFICIAL FLORENCE TICKETS & TOURS"),
    heroHeading: text("hero_heading").notNull().default("Unforgettable Experiences in Florence"),
    heroSubheading: text("hero_subheading").notNull().default("Skip the 2-hour queues at the Duomo and Uffizi. Guaranteed entrance timeslots, expert local guides, and 100% free 24-hour cancellation."),
    heroPrimaryButtonText: text("hero_primary_button_text").notNull().default("Explore Experiences"),
    heroPrimaryButtonLink: text("hero_primary_button_link").notNull().default("/experiences"),
    heroSecondaryButtonText: text("hero_secondary_button_text").notNull().default("Todays Availability"),
    heroSecondaryButtonLink: text("hero_secondary_button_link").notNull().default("/experiences"),
    heroBackgroundImage: text("hero_background_image").notNull().default("/images/florence-hero.jpg"),
    heroImageAlt: text("hero_image_alt").notNull().default("Florence cathedral panorama"),
    heroVideoUrl: text("hero_video_url").default("/video/hero-florence.mp4"),
    heroTrendingTags: jsonb("hero_trending_tags").$type<{ label: string; href: string }[]>(),

    // 2. Top Categories Section
    categoriesEnabled: boolean("categories_enabled").notNull().default(true),
    categoriesBadge: text("categories_badge").notNull().default("TOP CATEGORIES"),
    categoriesTitle: text("categories_title").notNull().default("Explore Florence by Theme"),
    categoriesSubtitle: text("categories_subtitle").notNull().default("Find skip-the-line museum admissions, walking tours, Tuscan day trips, and culinary masterclasses."),
    categoriesItems: jsonb("categories_items").$type<{ id: string; name: string; slug: string; imageUrl: string; enabled: boolean }[]>(),
    categoriesLimit: integer("categories_limit").notNull().default(6),

    // 3. Featured Experiences Section
    experiencesEnabled: boolean("experiences_enabled").notNull().default(true),
    experiencesBadge: text("experiences_badge").notNull().default("CURATED EXPERIENCES"),
    experiencesTitle: text("experiences_title").notNull().default("Handcrafted Tours & Skip-The-Line Admissions"),
    experiencesSubtitle: text("experiences_subtitle").notNull().default("Handcrafted tours and skip-the-line admissions chosen by local Florentines."),
    experiencesItems: jsonb("experiences_items").$type<{ id: string; title: string; slug: string; imageUrl: string; badgeText: string; duration: string; priceFrom: string; enabled: boolean }[]>(),

    // 4. Landmark Spotlight Section
    landmarkEnabled: boolean("landmark_enabled").notNull().default(true),
    landmarkBadge: text("landmark_badge").notNull().default("FLORENTINE MONUMENTS"),
    landmarkTitle: text("landmark_title").notNull().default("Four Must-Experience Monuments in Florence"),
    landmarkSubtitle: text("landmark_subtitle").notNull().default("From the heights of Brunelleschi dome to Michelangelo David, discover the crown jewels of the Renaissance with reserved priority entry."),

    // 5. Itinerary Builder Section
    itineraryEnabled: boolean("itinerary_enabled").notNull().default(true),
    itineraryBadge: text("itinerary_badge").notNull().default("VACATION PLANNER"),
    itineraryTitle: text("itinerary_title").notNull().default("Build Your Florence Day-by-Day"),
    itinerarySubtitle: text("itinerary_subtitle").notNull().default("Select your trip length and travel style to see curated morning, afternoon, and evening recommendations."),

    // 6. Why Choose Us Section
    whyUsEnabled: boolean("why_us_enabled").notNull().default(true),
    whyUsBadge: text("why_us_badge").notNull().default("THE VACAY FLORENCE DIFFERENCE"),
    whyUsTitle: text("why_us_title").notNull().default("Why Travelers Choose VACAY Over the Ticket Box Office"),
    whyUsSubtitle: text("why_us_subtitle").notNull().default("Skip the stress, bypass the lines, and enjoy guaranteed entry to Florence museums and sights."),
    whyUsComparisonRows: jsonb("why_us_comparison_rows").$type<{ feature: string; gate: string; vacay: string; highlight: boolean }[]>(),
    whyUsStats: jsonb("why_us_stats").$type<{ value: string; label: string }[]>(),
    whyUsCtaText: text("why_us_cta_text").notNull().default("Browse All Fast-Pass Tickets"),
    whyUsCtaLink: text("why_us_cta_link").notNull().default("/experiences"),

    // 7. Traveler Reviews / Testimonials Section
    testimonialsEnabled: boolean("testimonials_enabled").notNull().default(true),
    testimonialsBadge: text("testimonials_badge").notNull().default("VERIFIED TRAVELER FEEDBACK"),
    testimonialsTitle: text("testimonials_title").notNull().default("Loved by Over 45,000 Visitors"),
    testimonialsSubtitle: text("testimonials_subtitle").notNull().default("Read candid reviews from culture lovers, families, and solo explorers who discovered Florence through VACAY."),
    testimonialsItems: jsonb("testimonials_items").$type<{ name: string; location: string; rating: number; experienceTitle: string; quote: string; date: string }[]>(),

    // 8. VIP Conversion / CTA Section
    ctaEnabled: boolean("cta_enabled").notNull().default(true),
    ctaBadge: text("cta_badge").notNull().default("LIMITED SUMMER AVAILABILITY"),
    ctaTitle: text("cta_title").notNull().default("Do Not Risk Sold-Out Florentine Museums"),
    ctaSubtitle: text("cta_subtitle").notNull().default("Uffizi and Accademia peak tickets sell out up to 3 weeks in advance. Reserve your priority time slot today with free cancellation protection."),
    ctaButtonText: text("cta_button_text").notNull().default("Check Live Availability"),
    ctaButtonLink: text("cta_button_link").notNull().default("/experiences"),
    ctaSecondaryButtonText: text("cta_secondary_button_text").notNull().default("Browse Day Trips"),
    ctaSecondaryButtonLink: text("cta_secondary_button_link").notNull().default("/experiences/category/day-trips"),
    ctaBackgroundImage: text("cta_background_image").notNull().default("/images/florence-hero.jpg"),

    // 9. FAQ Section
    faqEnabled: boolean("faq_enabled").notNull().default(true),
    faqBadge: text("faq_badge").notNull().default("HELPFUL INFORMATION"),
    faqTitle: text("faq_title").notNull().default("Frequently Asked Questions"),
    faqSubtitle: text("faq_subtitle").notNull().default("Everything you need to know about tickets, meeting points, dress codes, and cancellations."),
    faqItems: jsonb("faq_items").$type<{ question: string; answer: string }[]>(),

    // 10. SEO & Meta
    seoMetaTitle: text("seo_meta_title").notNull().default("VACAY Florence — Skip-the-Line Tickets, Tours & Experiences"),
    seoMetaDescription: text("seo_meta_description").notNull().default("Book skip-the-line tickets, guided tours, and day trips in Florence with instant confirmation, free cancellation, and verified reviews."),
    seoCanonicalUrl: text("seo_canonical_url").notNull().default("/"),
    seoOgImage: text("seo_og_image").notNull().default("/images/florence-hero.jpg"),

    // 11. Popular Destinations (Landmark) cards — curated list shown in the
    // Landmark Spotlight section. Admin-owned editorial content (rating/
    // review figures are values the admin explicitly sets, same pattern as
    // whyUsStats/testimonialsItems below), not automated/fabricated stats.
    landmarkItems: jsonb("landmark_items").$type<
      {
        id: string;
        name: string;
        tag: string;
        description: string;
        image: string;
        imageAlt: string;
        href: string;
        price: string;
        rating: string;
        reviews: string;
        queueWithout: string;
        queueWithUs: string;
      }[]
    >(),

    // 12. Florence Itinerary Builder — multi-day trip plans, each with an
    // hour-by-hour list of steps.
    itineraryPlans: jsonb("itinerary_plans").$type<
      {
        id: string;
        title: string;
        subtitle: string;
        badge: string;
        pillLabel: string;
        steps: {
          time: string;
          title: string;
          description: string;
          tag: string;
          href?: string;
          actionText?: string;
          image: string;
        }[];
      }[]
    >(),

    // 13. Mobile Ticket / Digital Pass Showcase Section
    mobileEnabled: boolean("mobile_enabled").notNull().default(true),
    mobileBadge: text("mobile_badge").notNull().default("INSTANT DIGITAL WALLET VOUCHERS"),
    mobileTitle: text("mobile_title").notNull().default("No Printing. No Lines. Scan & Walk Right In."),
    mobileSubtitle: text("mobile_subtitle").notNull().default("Every booking instantly generates an official digital fast-pass for your Apple Wallet or Google Wallet. Simply hold your phone to the scanner at the monument gate and bypass hundreds waiting in line."),

    // 14. Travel Guide / Blog Teaser Section
    travelGuideEnabled: boolean("travel_guide_enabled").notNull().default(true),
    travelGuideBadge: text("travel_guide_badge").notNull().default("TRAVEL GUIDE & BLOG"),
    travelGuideTitle: text("travel_guide_title").notNull().default("Plan Your Perfect Florence Trip"),
    travelGuideSubtitle: text("travel_guide_subtitle").notNull().default("Travel tips, city guides, hidden gems and more."),

    // Extra testimonial trust badge (the "4.9 / 5.0 (14,200+ Reviews)" pill)
    testimonialsRatingValue: text("testimonials_rating_value").notNull().default("4.9 / 5.0"),
    testimonialsRatingCount: text("testimonials_rating_count").notNull().default("14,200+ Reviews"),

    // Promo code shown/copied in the VIP Conversion Banner
    ctaPromoCode: text("cta_promo_code").notNull().default("FLORENCE10"),

    ...timestamps,
  }
);

// ---------------------------------------------------------------------------
// Governance: audit log
// ---------------------------------------------------------------------------

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: id(),
    actorUserId: text("actor_user_id").references(() => users.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    before: jsonb("before"),
    after: jsonb("after"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_logs_entity_idx").on(t.entityType, t.entityId),
    index("audit_logs_created_idx").on(t.createdAt),
    index("audit_logs_actor_idx").on(t.actorUserId),
  ],
);

