"use server";

import { updateHomepageContent, HomepageContentInsert } from "@/lib/data/homepage";
import { requirePermission } from "@/lib/require-user";

export async function saveHomepageContentAction(updates: Partial<HomepageContentInsert>) {
  const staff = await requirePermission("content.manage", "/admin/content/homepage");
  const result = await updateHomepageContent(updates, staff.userId);
  return result;
}
