"use server";

import { updateHomepageContent, HomepageContentInsert } from "@/lib/data/homepage";
import { getStaffContext } from "@/lib/require-user";

export async function saveHomepageContentAction(updates: Partial<HomepageContentInsert>) {
  const staff = await getStaffContext();
  const result = await updateHomepageContent(updates, staff?.userId ?? null);
  return result;
}
