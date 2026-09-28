import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";

export interface AdminAuditLogRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  before: unknown;
  after: unknown;
  createdAt: Date;
}

/**
 * Most recent first, capped at 300 — a viewer, not an export tool. The
 * table can grow unbounded over the site's life, so this never pulls the
 * whole thing into memory; a proper archival/export story is future work
 * if the log ever needs to go back further than this.
 */
export async function listAuditLog(limit = 300): Promise<AdminAuditLogRow[]> {
  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      before: auditLogs.before,
      after: auditLogs.after,
      createdAt: auditLogs.createdAt,
      actorName: users.name,
      actorEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorUserId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
  return rows;
}
