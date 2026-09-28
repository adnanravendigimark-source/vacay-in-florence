"use server";

import { revalidatePath } from "next/cache";
import { updateAboutPageContent } from "@/lib/data/site-content";
import { getStaffContext } from "@/lib/require-user";
import type { AboutPageContent } from "@/lib/types";

export async function saveAboutPageContentAction(
  content: AboutPageContent,
): Promise<{ success: boolean; error?: string }> {
  const staff = await getStaffContext();
  if (!staff) return { success: false, error: "You must be signed in as an admin to save changes." };
  try {
    await updateAboutPageContent(content, staff.userId);
    revalidatePath("/about");
    revalidatePath("/admin/content/about");
    return { success: true };
  } catch (err) {
    console.error("[admin/content/about] save failed:", err);
    return { success: false, error: "Could not save changes. Please try again." };
  }
}
