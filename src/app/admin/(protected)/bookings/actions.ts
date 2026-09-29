"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { notifySupplier } from "@/lib/supplier-notifications";
import { db } from "@/lib/db";
import { orderItems, products } from "@/lib/db/schema";
import { setOrderStatus, type MutationResult, type OrderStatus } from "@/lib/data/admin/bookings";

/** Every distinct supplier with at least one item on this order — an
 * order can span multiple suppliers, so a status change (e.g. cancel)
 * notifies each of them once, not once per item. */
async function suppliersForOrder(orderId: string): Promise<Set<string>> {
  const rows = await db
    .select({ supplierId: products.supplierId })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));
  return new Set(rows.map((r) => r.supplierId));
}

export async function setOrderStatusAction(id: string, status: OrderStatus): Promise<MutationResult> {
  const staff = await requirePermission("bookings.manage", "/admin/bookings");
  const result = await setOrderStatus(id, status);
  if (result.success) {
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${id}`);
    // Also affects what the customer sees under Account > Bookings.
    revalidatePath("/account/bookings");
    revalidatePath(`/account/bookings/${id}`);
    revalidatePath("/supplier/bookings");
    revalidatePath(`/supplier/bookings/${id}`);
    await logAudit({
      actorUserId: staff.userId,
      action: "order.status_change",
      entityType: "order",
      entityId: id,
      after: { status },
    });
    if (status === "cancelled") {
      const supplierIds = await suppliersForOrder(id);
      for (const supplierId of supplierIds) {
        await notifySupplier({
          supplierId,
          type: "booking_cancelled",
          title: "A booking was cancelled",
          entityType: "order",
          entityId: id,
        });
      }
    }
  }
  return result;
}
