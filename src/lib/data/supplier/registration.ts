import "server-only";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, suppliers } from "@/lib/db/schema";
import type { SupplierRegisterInput } from "@/lib/validation/supplier";

export interface MutationResult {
  success: boolean;
  id?: string;
  error?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "supplier";
  let candidate = root;
  let n = 1;
  while (true) {
    const [existing] = await db.select({ id: suppliers.id }).from(suppliers).where(eq(suppliers.slug, candidate));
    if (!existing) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

/**
 * Creates a real, immediately-usable account for a new supplier applicant:
 * a `users` row (roleId left null — a supplier is never staff) plus a
 * `suppliers` row with status "pending" and `userId` set to the new user,
 * inside one transaction. No session is created here — the caller redirects
 * to /supplier/pending, which reads status fresh from the DB rather than
 * trusting anything client-side. Mirrors the existing customer
 * `registerAction` (src/app/(public)/register/actions.ts) for the
 * duplicate-email check and bcrypt cost.
 */
export async function registerSupplier(input: SupplierRegisterInput): Promise<MutationResult> {
  try {
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email));
    if (existing) {
      return { success: false, error: "An account with that email already exists." };
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const slug = await uniqueSlug(input.companyName);

    const supplier = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ email: input.email, name: input.name, passwordHash })
        .returning({ id: users.id });

      const [row] = await tx
        .insert(suppliers)
        .values({
          name: input.companyName,
          slug,
          status: "pending",
          contactName: input.name,
          contactEmail: input.email,
          contactPhone: input.contactPhone,
          website: input.website,
          country: input.country,
          taxId: input.registrationNumber,
          about: input.about,
          // Real, separate columns — never folded into `notes`, which is
          // admin's own internal field and gets fully overwritten by the
          // admin "Notes" box and "Edit Supplier" form (saveSupplierNote /
          // updateSupplier both do `set({ notes })`). Application data
          // stored there would be destroyed the first time an admin saves
          // either of those.
          businessType: input.businessType,
          businessAddress: input.businessAddress,
          city: input.city,
          postalCode: input.postalCode,
          documentUrl: input.documentUrl,
          documentName: input.documentName,
          userId: user.id,
        })
        .returning({ id: suppliers.id });

      return row;
    });

    return { success: true, id: supplier.id };
  } catch (err) {
    console.error("[data/supplier/registration] registerSupplier failed:", err);
    return { success: false, error: "Could not submit your application. Please try again." };
  }
}

export type SupplierAccountStatus = "pending" | "approved" | "rejected" | "suspended";

export interface SupplierLoginStatus {
  found: boolean;
  status?: SupplierAccountStatus;
  supplierName?: string;
}

/**
 * Non-auth status lookup by email, used by two ungated pages: the
 * /supplier/pending status page (for a just-registered applicant with no
 * session yet) and /supplier/login's pre-check (so a pending/rejected/
 * suspended supplier sees the real reason instead of a bare "invalid
 * credentials" — the NextAuth provider itself never returns a session for
 * a non-approved supplier no matter what this reports).
 */
export async function getSupplierLoginStatus(email: string): Promise<SupplierLoginStatus> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { found: false };

  const [row] = await db
    .select({ status: suppliers.status, name: suppliers.name })
    .from(users)
    .innerJoin(suppliers, eq(suppliers.userId, users.id))
    .where(eq(users.email, normalized));

  if (!row) return { found: false };
  return { found: true, status: row.status as SupplierAccountStatus, supplierName: row.name };
}
