"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { leadSubmissions } from "@/lib/db/schema";
import { supplierApplicationSchema, checkRequiredLeadFields } from "@/lib/validation/leads";
import { getSupplierPageContent } from "@/lib/data/site-content";

export async function submitSupplierApplicationAction(formData: FormData): Promise<void> {
  const raw = {
    name: (formData.get("name") as string) ?? "",
    email: (formData.get("email") as string) ?? "",
    phone: (formData.get("phone") as string) ?? "",
    message: (formData.get("message") as string) ?? "",
    company: (formData.get("company") as string) ?? "",
    website: (formData.get("website") as string) ?? "",
    experienceType: (formData.get("experienceType") as string) ?? "",
  };

  // "Required" is decided by the live, admin-configurable field list, not a
  // fixed schema — see checkRequiredLeadFields for why.
  const content = await getSupplierPageContent();
  const requiredError = checkRequiredLeadFields(content.fields, raw);
  if (requiredError) {
    redirect(`/become-a-supplier?error=${encodeURIComponent(requiredError)}`);
  }

  const parsed = supplierApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check the form and try again.";
    redirect(`/become-a-supplier?error=${encodeURIComponent(message)}`);
  }

  await db.insert(leadSubmissions).values({
    type: "supplier_application",
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    company: parsed.data.company || null,
    message: parsed.data.message || null,
    // website/experienceType don't warrant their own columns — see the
    // `payload` comment in schema.ts.
    payload: {
      website: parsed.data.website || null,
      experienceType: parsed.data.experienceType || null,
    },
  });

  redirect("/become-a-supplier?success=1");
}
