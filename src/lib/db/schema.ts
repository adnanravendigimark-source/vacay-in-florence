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
    ...timestamps,
  },
  (t) => [
    uniqueIndex("categories_slug_idx").on(t.slug),
    index("categories_featured_sort_idx").on(t.featured, t.sortOrder),
  ],
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("suppliers_slug_idx").on(t.slug)],
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
    ...timestamps,
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_supplier_idx").on(t.supplierId),
    index("products_category_idx").on(t.categoryId),
    index("products_status_featured_idx").on(t.status, t.featured, t.featuredRank),
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
    ...timestamps,
  },
  (t) => [
    uniqueIndex("blog_posts_slug_idx").on(t.slug),
    index("blog_posts_published_idx").on(t.publishedAt),
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
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
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
