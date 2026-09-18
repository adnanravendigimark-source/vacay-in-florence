import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { seedDatabase } from "./seed";
import fs from "node:fs";
import path from "node:path";

export function initializeDatabase() {
  const dbPath = process.env.DATABASE_URL_SQLITE ?? "./local.db";
  console.log(`[db:init] Initializing database at ${dbPath}...`);

  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");

  const migrationPath = path.join(process.cwd(), "drizzle", "0000_magenta_roxanne_simpson.sql");
  if (fs.existsSync(migrationPath)) {
    const migrationSql = fs.readFileSync(migrationPath, "utf-8");
    const statements = migrationSql.split("--> statement-breakpoint");
    for (const stmt of statements) {
      const trimmed = stmt.trim();
      if (trimmed) {
        try {
          sqlite.exec(trimmed);
        } catch {
          // Ignore if table/index already exists
        }
      }
    }
  }

  const db = drizzle(sqlite, { schema });
  try {
    seedDatabase(db);
    console.log("[db:init] Database successfully initialized and seeded.");
  } catch (err) {
    console.error("[db:init] Warning during seed:", err);
  } finally {
    sqlite.close();
  }
}

initializeDatabase();
