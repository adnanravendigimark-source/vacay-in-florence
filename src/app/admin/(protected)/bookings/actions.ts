"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { setOrderStatus, type MutationResult, type OrderStatus } from "@/lib/data/admin/bookings";

export async function setOrderStatusAction(id: string, status: OrderStatus): Promise<MutationResult> {
  const staff = await requirePermission("bookings.manage", "/admin/bookings");
  const result = await setOrderStatus(id, status);
  if (result.success) {
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${id}`);
    // Also affects what the customer sees under Account > Bookings.
    revalidatePath("/account/bookings");
    revalidatePath(`/account/bookings/${id}`);
    await logAudit({
      actorUserId: staff.userId,
      action: "order.status_change",
      entityType: "order",
      entityId: id,
      after: { status },
    });
  }
  return result;
}
