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
sqlite.pragma("busy_timeout = 5000");

if (process.env.NODE_ENV !== "production") {
  globalForDb.__sqlite__ = sqlite;
}

export const db = drizzle(sqlite, { schema });



