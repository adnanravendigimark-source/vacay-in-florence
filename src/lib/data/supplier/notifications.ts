import "server-only";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { supplierNotifications } from "@/lib/db/schema";

export interface MutationResult {
  success: boolean;
  error?: string;
}

export interface SupplierNotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: Date;
}

export async function listSupplierNotifications(supplierId: string): Promise<SupplierNotificationItem[]> {
  return db
    .select()
    .from(supplierNotifications)
    .where(eq(supplierNotifications.supplierId, supplierId))
    .orderBy(desc(supplierNotifications.createdAt))
    .limit(100);
}

export async function getUnreadSupplierNotificationCount(supplierId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(supplierNotifications)
    .where(and(eq(supplierNotifications.supplierId, supplierId), eq(supplierNotifications.isRead, false)));
  return row?.count ?? 0;
}

/** Ownership-checked: only ever marks a notification read if it belongs to
 * this supplier, mirroring the ownership boundary every other supplier
 * mutation in this app enforces. */
export async function markSupplierNotificationRead(id: string, supplierId: string): Promise<MutationResult> {
  try {
    await db
      .update(supplierNotifications)
      .set({ isRead: true })
      .where(and(eq(supplierNotifications.id, id), eq(supplierNotifications.supplierId, supplierId)));
    return { success: true };
  } catch (err) {
    console.error("[data/supplier/notifications] markSupplierNotificationRead failed:", err);
    return { success: false, error: "Could not update this notification." };
  }
}

export async function markAllSupplierNotificationsRead(supplierId: string): Promise<MutationResult> {
  try {
    await db
      .update(supplierNotifications)
      .set({ isRead: true })
      .where(and(eq(supplierNotifications.supplierId, supplierId), eq(supplierNotifications.isRead, false)));
    return { success: true };
  } catch (err) {
    console.error("[data/supplier/notifications] markAllSupplierNotificationsRead failed:", err);
    return { success: false, error: "Could not update notifications." };
  }
}
