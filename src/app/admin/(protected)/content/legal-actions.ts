"use server";

import { revalidatePath } from "next/cache";
import { updateLegalPageContent, type LegalPageKey } from "@/lib/data/site-content";
import { getStaffContext } from "@/lib/require-user";
import type { LegalPageContent } from "@/lib/types";

const PUBLIC_PATHS: Record<LegalPageKey, string> = {
  "privacy-policy": "/privacy",
  "terms-conditions": "/terms",
  "cancellation-policy": "/cancellation-policy",
};

/** Shared save action for all 3 legal-page editors (see legal-page-editor.tsx). */
export async function saveLegalPageContentAction(
  key: LegalPageKey,
  content: LegalPageContent,
): Promise<{ success: boolean; error?: string }> {
  const staff = await getStaffContext();
  if (!staff) return { success: false, error: "You must be signed in as an admin to save changes." };
  try {
    await updateLegalPageContent(key, content, staff.userId);
    revalidatePath(PUBLIC_PATHS[key]);
    revalidatePath(`/admin/content/${key === "privacy-policy" ? "privacy" : key === "terms-conditions" ? "terms" : "cancellation-policy"}`);
    return { success: true };
  } catch (err) {
    console.error(`[admin/content] save failed for ${key}:`, err);
    return { success: false, error: "Could not save changes. Please try again." };
  }
}
