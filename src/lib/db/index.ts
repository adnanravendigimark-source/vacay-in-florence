import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

/**
 * Singleton DB client. Next.js dev-mode module reloading would otherwise
 * open a fresh SQLite connection (and file handle) on every hot reload;
 * stashing the instance on `globalThis` avoids that, mirroring the usual
 * Prisma-client-singleton pattern.
 */
const globalForDb = globalThis as unknown as {
  __sqlite__?: InstanceType<typeof Database>;
};

const sqlite =
  globalForDb.__sqlite__ ??
  new Database(process.env.DATABASE_URL_SQLITE ?? "./local.db");

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

if (process.env.NODE_ENV !== "production") {
  globalForDb.__sqlite__ = sqlite;
}

export const db = drizzle(sqlite, { schema });

// Auto-initialize schema & seed data if tables are missing (e.g. on fresh Vercel build container)
try {
  const tableCheck = sqlite
    .prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='categories'")
    .get() as { count: number } | undefined;

  if (!tableCheck || tableCheck.count === 0) {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id text PRIMARY KEY NOT NULL,
        slug text NOT NULL,
        name text NOT NULL,
        short_description text NOT NULL,
        icon text NOT NULL,
        image_url text NOT NULL,
        image_alt text NOT NULL,
        parent_id text,
        featured integer DEFAULT false NOT NULL,
        sort_order integer DEFAULT 0 NOT NULL,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        updated_at integer DEFAULT (unixepoch()) NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_idx ON categories (slug);
      CREATE INDEX IF NOT EXISTS categories_featured_sort_idx ON categories (featured, sort_order);

      CREATE TABLE IF NOT EXISTS suppliers (
        id text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        slug text NOT NULL,
        created_at integer DEFAULT (unixepoch()) NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS suppliers_slug_idx ON suppliers (slug);

      CREATE TABLE IF NOT EXISTS products (
        id text PRIMARY KEY NOT NULL,
        slug text NOT NULL,
        title text NOT NULL,
        short_description text NOT NULL,
        description text NOT NULL,
        highlights text DEFAULT '[]' NOT NULL,
        inclusions text DEFAULT '[]' NOT NULL,
        exclusions text DEFAULT '[]' NOT NULL,
        meeting_point text,
        cancellation_policy text NOT NULL,
        category_id text NOT NULL,
        supplier_id text NOT NULL,
        status text DEFAULT 'draft' NOT NULL,
        featured integer DEFAULT false NOT NULL,
        featured_rank integer,
        duration_label text NOT NULL,
        price_from_amount real NOT NULL,
        price_from_currency text DEFAULT 'EUR' NOT NULL,
        rating_average real,
        review_count integer DEFAULT 0 NOT NULL,
        badges text DEFAULT '[]' NOT NULL,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        updated_at integer DEFAULT (unixepoch()) NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE no action ON DELETE no action,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON UPDATE no action ON DELETE no action
      );
      CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products (slug);
      CREATE INDEX IF NOT EXISTS products_supplier_idx ON products (supplier_id);
      CREATE INDEX IF NOT EXISTS products_category_idx ON products (category_id);
      CREATE INDEX IF NOT EXISTS products_status_featured_idx ON products (status, featured, featured_rank);

      CREATE TABLE IF NOT EXISTS product_images (
        id text PRIMARY KEY NOT NULL,
        product_id text NOT NULL,
        url text NOT NULL,
        alt text NOT NULL,
        sort_order integer DEFAULT 0 NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE no action ON DELETE cascade
      );
      CREATE INDEX IF NOT EXISTS product_images_product_sort_idx ON product_images (product_id, sort_order);

      CREATE TABLE IF NOT EXISTS product_options (
        id text PRIMARY KEY NOT NULL,
        product_id text NOT NULL,
        name text NOT NULL,
        description text,
        price_amount real NOT NULL,
        price_currency text DEFAULT 'EUR' NOT NULL,
        sort_order integer DEFAULT 0 NOT NULL,
        is_active integer DEFAULT true NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE no action ON DELETE cascade
      );
      CREATE INDEX IF NOT EXISTS product_options_product_idx ON product_options (product_id, sort_order);

      CREATE TABLE IF NOT EXISTS availability (
        id text PRIMARY KEY NOT NULL,
        product_id text NOT NULL,
        date text NOT NULL,
        capacity_total integer NOT NULL,
        capacity_booked integer DEFAULT 0 NOT NULL,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        updated_at integer DEFAULT (unixepoch()) NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE no action ON DELETE cascade
      );
      CREATE UNIQUE INDEX IF NOT EXISTS availability_product_date_idx ON availability (product_id, date);
      CREATE INDEX IF NOT EXISTS availability_date_idx ON availability (date);

      CREATE TABLE IF NOT EXISTS blog_posts (
        id text PRIMARY KEY NOT NULL,
        slug text NOT NULL,
        title text NOT NULL,
        excerpt text NOT NULL,
        body text NOT NULL,
        cover_image_url text NOT NULL,
        cover_image_alt text NOT NULL,
        reading_time_minutes integer DEFAULT 4 NOT NULL,
        tags text DEFAULT '[]' NOT NULL,
        published_at integer,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        updated_at integer DEFAULT (unixepoch()) NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);
      CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts (published_at);

      CREATE TABLE IF NOT EXISTS cms_blocks (
        id text PRIMARY KEY NOT NULL,
        key text NOT NULL,
        content text NOT NULL,
        updated_at integer DEFAULT (unixepoch()) NOT NULL,
        updated_by text
      );
      CREATE UNIQUE INDEX IF NOT EXISTS cms_blocks_key_idx ON cms_blocks (key);

      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY NOT NULL,
        email text NOT NULL,
        password_hash text NOT NULL,
        name text NOT NULL,
        email_verified integer,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        updated_at integer DEFAULT (unixepoch()) NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email);

      CREATE TABLE IF NOT EXISTS carts (
        id text PRIMARY KEY NOT NULL,
        user_id text,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        updated_at integer DEFAULT (unixepoch()) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id text PRIMARY KEY NOT NULL,
        cart_id text NOT NULL,
        product_id text NOT NULL,
        product_option_id text,
        date text NOT NULL,
        participants text NOT NULL,
        currency text DEFAULT 'EUR' NOT NULL,
        subtotal_amount real NOT NULL,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        updated_at integer DEFAULT (unixepoch()) NOT NULL,
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON UPDATE no action ON DELETE cascade,
        FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE no action ON DELETE no action,
        FOREIGN KEY (product_option_id) REFERENCES product_options(id) ON UPDATE no action ON DELETE no action
      );
      CREATE INDEX IF NOT EXISTS cart_items_cart_idx ON cart_items (cart_id);

      CREATE TABLE IF NOT EXISTS orders (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        status text DEFAULT 'pending_payment' NOT NULL,
        total_amount real NOT NULL,
        currency text DEFAULT 'EUR' NOT NULL,
        customer_name text NOT NULL,
        customer_email text NOT NULL,
        customer_phone text,
        notes text,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        updated_at integer DEFAULT (unixepoch()) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
      );
      CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id);
      CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);

      CREATE TABLE IF NOT EXISTS order_items (
        id text PRIMARY KEY NOT NULL,
        order_id text NOT NULL,
        product_id text NOT NULL,
        product_title text NOT NULL,
        date text NOT NULL,
        participants text NOT NULL,
        currency text DEFAULT 'EUR' NOT NULL,
        subtotal_amount real NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON UPDATE no action ON DELETE cascade,
        FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE no action ON DELETE no action
      );
      CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);

      CREATE TABLE IF NOT EXISTS lead_submissions (
        id text PRIMARY KEY NOT NULL,
        type text NOT NULL,
        name text NOT NULL,
        email text NOT NULL,
        phone text,
        company text,
        message text,
        payload text,
        status text DEFAULT 'new' NOT NULL,
        created_at integer DEFAULT (unixepoch()) NOT NULL
      );
      CREATE INDEX IF NOT EXISTS lead_submissions_type_status_idx ON lead_submissions (type, status);

      CREATE TABLE IF NOT EXISTS verification_tokens (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        token text NOT NULL,
        type text NOT NULL,
        expires_at integer NOT NULL,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade
      );
      CREATE UNIQUE INDEX IF NOT EXISTS verification_tokens_token_idx ON verification_tokens (token);
      CREATE INDEX IF NOT EXISTS verification_tokens_user_type_idx ON verification_tokens (user_id, type);
    `);

    // Dynamic import to avoid circular dependency and seed the database
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { seedDatabase } = require("./seed");
    seedDatabase(db);
  }
} catch (err) {
  console.warn("Auto DB Init warning:", err);
}


