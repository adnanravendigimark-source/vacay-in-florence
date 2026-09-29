"use server";

import { revalidatePath } from "next/cache";
import { requireSupplier } from "@/lib/require-user";
import {
  markSupplierNotificationRead,
  markAllSupplierNotificationsRead,
  type MutationResult,
} from "@/lib/data/supplier/notifications";

export async function markNotificationReadAction(id: string): Promise<MutationResult> {
  const supplier = await requireSupplier("/supplier/notifications");
  const result = await markSupplierNotificationRead(id, supplier.supplierId);
  if (result.success) revalidatePath("/supplier/notifications");
  return result;
}

export async function markAllNotificationsReadAction(): Promise<MutationResult> {
  const supplier = await requireSupplier("/supplier/notifications");
  const result = await markAllSupplierNotificationsRead(supplier.supplierId);
  if (result.success) revalidatePath("/supplier/notifications");
  return result;
}
