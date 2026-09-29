import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { suppliers, users } from "@/lib/db/schema";
import type { SupplierProfileInput } from "@/lib/validation/supplier";

export interface MutationResult {
  success: boolean;
  error?: string;
}

export interface SupplierProfileRecord {
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  country: string | null;
  logoUrl: string | null;
  about: string | null;
  accountName: string;
  accountEmail: string;
}

export async function getSupplierProfile(supplierId: string): Promise<SupplierProfileRecord | null> {
  const [row] = await db
    .select({
      name: suppliers.name,
      contactName: suppliers.contactName,
      contactEmail: suppliers.contactEmail,
      contactPhone: suppliers.contactPhone,
      website: suppliers.website,
      country: suppliers.country,
      logoUrl: suppliers.logoUrl,
      about: suppliers.about,
      accountName: users.name,
      accountEmail: users.email,
    })
    .from(suppliers)
    .innerJoin(users, eq(suppliers.userId, users.id))
    .where(eq(suppliers.id, supplierId));
  return row ?? null;
}

/**
 * Self-service profile update — intentionally touches only the fields a
 * supplier is allowed to change themselves (company/contact/business
 * details, logo, about text). `status`, `commissionRateOverride`, `slug`,
 * `userId`, and admin's private `notes` are never reachable through this
 * function, unlike the admin-side updateSupplier (src/lib/data/admin/
 * suppliers.ts) which a supplier has no access to at all.
 */
export async function updateSupplierProfile(supplierId: string, input: SupplierProfileInput): Promise<MutationResult> {
  try {
    await db
      .update(suppliers)
      .set({
        name: input.name,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        website: input.website,
        country: input.country,
        logoUrl: input.logoUrl,
        about: input.about,
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, supplierId));
    return { success: true };
  } catch (err) {
    console.error("[data/supplier/profile] updateSupplierProfile failed:", err);
    return { success: false, error: "Could not save your profile. Please try again." };
  }
}
