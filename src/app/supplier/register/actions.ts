"use server";

import { redirect } from "next/navigation";
import { supplierRegisterSchema } from "@/lib/validation/supplier";
import { registerSupplier } from "@/lib/data/supplier/registration";

/**
 * Transactional supplier registration — creates a real users+suppliers
 * row pair (status "pending"), no auto-login. Mirrors the shape of the
 * existing customer registerAction (src/app/(public)/register/actions.ts)
 * for validation/error-via-redirect, but this one never signs the visitor
 * in: a pending supplier has nothing to see yet except the status page.
 */
export async function supplierRegisterAction(formData: FormData): Promise<void> {
  // formData.get() returns null (not undefined) for any field the caller's
  // form doesn't include — the simple form at src/app/supplier/register/
  // page.tsx only collects the 8 core fields, leaving the rest absent.
  // supplierRegisterSchema's optional fields accept `undefined` (via
  // .optional()) or "" (via .or(z.literal(""))), but not `null`, so every
  // absent field must be coalesced to undefined here or safeParse rejects
  // the whole submission outright, no matter what was actually filled in.
  const field = (name: string, ...fallbacks: string[]): string | undefined => {
    for (const key of [name, ...fallbacks]) {
      const value = formData.get(key);
      if (typeof value === "string") return value;
    }
    return undefined;
  };

  const parsed = supplierRegisterSchema.safeParse({
    name: field("name", "contactName"),
    email: field("email"),
    password: field("password"),
    confirmPassword: field("confirmPassword"),
    companyName: field("companyName", "businessName"),
    businessType: field("businessType"),
    registrationNumber: field("registrationNumber"),
    businessAddress: field("businessAddress"),
    city: field("city"),
    postalCode: field("postalCode"),
    contactPhone: field("contactPhone", "phone"),
    website: field("website"),
    country: field("country"),
    about: field("about", "businessDescription"),
    documentName: field("documentName"),
    documentUrl: field("documentUrl"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check the form and try again.";
    redirect(`/supplier/register?error=${encodeURIComponent(message)}`);
  }

  const result = await registerSupplier(parsed.data);
  if (!result.success) {
    redirect(`/supplier/register?error=${encodeURIComponent(result.error ?? "Something went wrong. Please try again.")}`);
  }

  redirect(`/supplier/pending?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function registerSupplierDirectAction(
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const parsed = supplierRegisterSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please review the form for errors.",
    };
  }

  return registerSupplier(parsed.data);
}
