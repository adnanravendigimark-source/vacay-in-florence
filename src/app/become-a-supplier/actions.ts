"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { leadSubmissions } from "@/lib/db/schema";
import { supplierApplicationSchema } from "@/lib/validation/leads";

export async function submitSupplierApplicationAction(formData: FormData): Promise<void> {
  const parsed = supplierApplicationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    message: formData.get("message") ?? "",
    company: formData.get("company"),
    website: formData.get("website") ?? "",
    experienceType: formData.get("experienceType"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check the form and try again.";
    redirect(`/become-a-supplier?error=${encodeURIComponent(message)}`);
  }

  await db.insert(leadSubmissions).values({
    type: "supplier_application",
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    company: parsed.data.company,
    message: parsed.data.message || null,
    // website/experienceType don't warrant their own columns — see the
    // `payload` comment in schema.ts.
    payload: {
      website: parsed.data.website || null,
      experienceType: parsed.data.experienceType,
    },
  });

  redirect("/become-a-supplier?success=1");
}
