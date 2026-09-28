"use server";

import { revalidatePath } from "next/cache";
import { updateSiteSettings } from "@/lib/data/site-content";
import { requirePermission } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import type { SiteSettingsContent } from "@/lib/types";

export async function saveSiteSettingsAction(
  content: SiteSettingsContent,
): Promise<{ success: boolean; error?: string }> {
  const staff = await requirePermission("content.manage", "/admin/settings");
  try {
    await updateSiteSettings(content, staff.userId);
    // Every public page renders the footer, so every page needs revalidating.
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    await logAudit({ actorUserId: staff.userId, action: "content.update", entityType: "cms_block", entityId: "site-settings" });
    return { success: true };
  } catch (err) {
    console.error("[admin/settings] save failed:", err);
    return { success: false, error: "Could not save changes. Please try again." };
  }
}
