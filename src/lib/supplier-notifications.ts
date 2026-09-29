import "server-only";
import { db } from "@/lib/db";
import { supplierNotifications } from "@/lib/db/schema";

export type SupplierNotificationType =
  | "application_approved"
  | "application_rejected"
  | "experience_approved"
  | "experience_rejected"
  | "new_booking"
  | "booking_cancelled"
  | "payout_recorded"
  | "admin_message";

interface NotifySupplierInput {
  supplierId: string;
  type: SupplierNotificationType;
  title: string;
  body?: string | null;
  entityType?: string | null;
  entityId?: string | null;
}

/**
 * Best-effort, non-throwing in-app notification insert — same shape as
 * logAudit() (src/lib/audit.ts). Called from every mutation site that
 * changes something a supplier cares about (application/experience review,
 * bookings, payouts). Never blocks or fails the caller's own mutation.
 */
export async function notifySupplier(input: NotifySupplierInput): Promise<void> {
  try {
    await db.insert(supplierNotifications).values({
      supplierId: input.supplierId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
    });
  } catch (err) {
    console.error(`[supplier-notifications] failed to notify supplier ${input.supplierId} ("${input.type}"):`, err);
  }
}
