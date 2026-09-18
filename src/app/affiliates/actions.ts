"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { leadSubmissions } from "@/lib/db/schema";
import { affiliateApplicationSchema } from "@/lib/validation/leads";

export async function submitAffiliateApplicationAction(formData: FormData): Promise<void> {
  const parsed = affiliateApplicationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    message: formData.get("message") ?? "",
    company: formData.get("company") ?? "",
    website: formData.get("website") ?? "",
    audienceSize: formData.get("audienceSize") ?? "",
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check the form and try again.";
    redirect(`/affiliates?error=${encodeURIComponent(message)}`);
  }

  await db.insert(leadSubmissions).values({
    type: "affiliate_application",
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    company: parsed.data.company || null,
    message: parsed.data.message || null,
    payload: {
      website: parsed.data.website || null,
      audienceSize: parsed.data.audienceSize || null,
    },
  });

  redirect("/affiliates?success=1");
}
