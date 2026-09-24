import "server-only";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

type LogAuditInput = {
  /** The staff user performing the action — StaffContext.userId. */
  actorUserId: string;
  /** Namespaced action key, e.g. "product.create", "order.status_change", "role.permissions_update". */
  action: string;
  /** e.g. "product", "order", "supplier", "role". */
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
};

/**
 * Writes one row to `audit_logs` — actor, action, entity, and a
 * before/after snapshot. Called once by every mutating admin Server
 * Action, right after the mutation itself succeeds (see the plan's
 * Phase 3+ CRUD actions). Release-blocking per the platform blueprint:
 * every catalog/booking/supplier/affiliate/role/content change an admin
 * makes must be reconstructable after the fact.
 *
 * Best-effort and non-throwing: a logging failure is reported to the
 * server console but never propagated, so a transient audit-log write
 * issue can never roll back or block the real mutation it's describing.
 */
export async function logAudit(input: LogAuditInput): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      before: input.before === undefined ? null : (input.before as object),
      after: input.after === undefined ? null : (input.after as object),
    });
  } catch (err) {
    console.error(`[audit] failed to log "${input.action}" on ${input.entityType}:`, err);
  }
}
