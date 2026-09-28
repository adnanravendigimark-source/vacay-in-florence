"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { leadSubmissions } from "@/lib/db/schema";
import { affiliateApplicationSchema, checkRequiredLeadFields } from "@/lib/validation/leads";
import { getAffiliatePageContent } from "@/lib/data/site-content";

export async function submitAffiliateApplicationAction(formData: FormData): Promise<void> {
  const raw = {
    name: (formData.get("name") as string) ?? "",
    email: (formData.get("email") as string) ?? "",
    phone: (formData.get("phone") as string) ?? "",
    message: (formData.get("message") as string) ?? "",
    company: (formData.get("company") as string) ?? "",
    website: (formData.get("website") as string) ?? "",
    audienceSize: (formData.get("audienceSize") as string) ?? "",
  };

  const content = await getAffiliatePageContent();
  const requiredError = checkRequiredLeadFields(content.fields, raw);
  if (requiredError) {
    redirect(`/affiliates?error=${encodeURIComponent(requiredError)}`);
  }

  const parsed = affiliateApplicationSchema.safeParse(raw);
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
