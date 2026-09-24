"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { leadSubmissions } from "@/lib/db/schema";
import { contactFormSchema } from "@/lib/validation/leads";

export async function submitContactAction(formData: FormData): Promise<void> {
  const parsed = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check the form and try again.";
    redirect(`/contact?error=${encodeURIComponent(message)}`);
  }

  await db.insert(leadSubmissions).values({
    type: "contact",
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    message: parsed.data.message || null,
  });

  redirect("/contact?success=1");
}
