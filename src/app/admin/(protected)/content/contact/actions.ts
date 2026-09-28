"use server";

import { revalidatePath } from "next/cache";
import { updateContactPageContent } from "@/lib/data/site-content";
import { requirePermission } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import type { ContactPageContent } from "@/lib/types";

export async function saveContactPageContentAction(
  content: ContactPageContent,
): Promise<{ success: boolean; error?: string }> {
  const staff = await requirePermission("content.manage", "/admin/content/contact");
  try {
    await updateContactPageContent(content, staff.userId);
    revalidatePath("/contact");
    revalidatePath("/admin/content/contact");
    await logAudit({ actorUserId: staff.userId, action: "content.update", entityType: "cms_block", entityId: "contact" });
    return { success: true };
  } catch (err) {
    console.error("[admin/content/contact] save failed:", err);
    return { success: false, error: "Could not save changes. Please try again." };
  }
}
