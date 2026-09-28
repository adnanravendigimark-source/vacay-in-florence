"use server";

import { revalidatePath } from "next/cache";
import { updateAboutPageContent } from "@/lib/data/site-content";
import { requirePermission } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import type { AboutPageContent } from "@/lib/types";

export async function saveAboutPageContentAction(
  content: AboutPageContent,
): Promise<{ success: boolean; error?: string }> {
  const staff = await requirePermission("content.manage", "/admin/content/about");
  try {
    await updateAboutPageContent(content, staff.userId);
    revalidatePath("/about");
    revalidatePath("/admin/content/about");
    await logAudit({ actorUserId: staff.userId, action: "content.update", entityType: "cms_block", entityId: "about" });
    return { success: true };
  } catch (err) {
    console.error("[admin/content/about] save failed:", err);
    return { success: false, error: "Could not save changes. Please try again." };
  }
}
