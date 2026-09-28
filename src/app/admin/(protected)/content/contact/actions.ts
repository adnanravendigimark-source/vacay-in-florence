"use server";

import { revalidatePath } from "next/cache";
import { updateContactPageContent } from "@/lib/data/site-content";
import { getStaffContext } from "@/lib/require-user";
import type { ContactPageContent } from "@/lib/types";

export async function saveContactPageContentAction(
  content: ContactPageContent,
): Promise<{ success: boolean; error?: string }> {
  const staff = await getStaffContext();
  if (!staff) return { success: false, error: "You must be signed in as an admin to save changes." };
  try {
    await updateContactPageContent(content, staff.userId);
    revalidatePath("/contact");
    revalidatePath("/admin/content/contact");
    return { success: true };
  } catch (err) {
    console.error("[admin/content/contact] save failed:", err);
    return { success: false, error: "Could not save changes. Please try again." };
  }
}
