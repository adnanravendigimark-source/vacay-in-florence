"use server";

import { revalidatePath } from "next/cache";
import { updateSupplierPageContent, updateAffiliatePageContent } from "@/lib/data/site-content";
import { requirePermission } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import type { LeadPageContent } from "@/lib/types";

export type LeadPageKey = "become-a-supplier" | "affiliates";

const PUBLIC_PATHS: Record<LeadPageKey, string> = {
  "become-a-supplier": "/become-a-supplier",
  affiliates: "/affiliates",
};

/** Shared save action for the Supplier and Affiliate page editors (see lead-page-editor.tsx). */
export async function saveLeadPageContentAction(
  key: LeadPageKey,
  content: LeadPageContent,
): Promise<{ success: boolean; error?: string }> {
  const staff = await requirePermission("content.manage", `/admin/content/${key}`);
  try {
    if (key === "become-a-supplier") {
      await updateSupplierPageContent(content, staff.userId);
    } else {
      await updateAffiliatePageContent(content, staff.userId);
    }
    revalidatePath(PUBLIC_PATHS[key]);
    revalidatePath(`/admin/content/${key}`);
    await logAudit({ actorUserId: staff.userId, action: "content.update", entityType: "cms_block", entityId: key });
    return { success: true };
  } catch (err) {
    console.error(`[admin/content] save failed for ${key}:`, err);
    return { success: false, error: "Could not save changes. Please try again." };
  }
}
