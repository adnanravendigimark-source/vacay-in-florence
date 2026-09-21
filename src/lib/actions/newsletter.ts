"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { leadSubmissions } from "@/lib/db/schema";
import { newsletterSubscribeSchema } from "@/lib/validation/leads";

export interface NewsletterState {
  status: "idle" | "error" | "success";
  message?: string;
}

/**
 * Footer newsletter signup. Rendered on every page (see SiteFooter), so
 * this returns state via useActionState instead of redirecting — a
 * redirect would need to know which page the visitor was on. Stored as
 * a `lead_submissions` row (type "newsletter"), same table the Contact /
 * Become a Supplier / Affiliate forms already use, rather than a new
 * table for one extra lead type.
 */
export async function subscribeNewsletterAction(
  _prevState: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const parsed = newsletterSubscribeSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }

  const [existing] = await db
    .select({ id: leadSubmissions.id })
    .from(leadSubmissions)
    .where(and(eq(leadSubmissions.type, "newsletter"), eq(leadSubmissions.email, parsed.data.email)));

  if (!existing) {
    await db.insert(leadSubmissions).values({
      type: "newsletter",
      name: "Newsletter subscriber",
      email: parsed.data.email,
    });
  }

  return { status: "success", message: "You're subscribed — thanks!" };
}
