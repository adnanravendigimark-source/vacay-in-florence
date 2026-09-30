import "server-only";
import crypto from "node:crypto";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, suppliers, verificationTokens } from "@/lib/db/schema";
import type { SupplierRegisterInput } from "@/lib/validation/supplier";
import { sendEmailVerificationEmail } from "@/lib/email";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

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
 * Creates a supplier applicant's account: a `users` row with accountType
 * "supplier" (see schema.ts's users table comment on per-role email
 * isolation — a customer or staff account on the same email is a
 * separate row and never conflicts with this) plus a `suppliers` row
 * with status "pending" and `userId` set to the new user, inside one
 * transaction. No session is created — the caller redirects to
 * /supplier/pending. The account also can't sign in yet even once
 * approved: emailVerified starts null and a verification email is sent,
 * mirroring the customer registration flow (see authorizeSupplier in
 * src/lib/auth.ts, which requires both emailVerified and an approved
 * supplier row).
 */
export async function registerSupplier(
  input: SupplierRegisterInput,
): Promise<MutationResult & { verificationLink?: string }> {
  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, input.email), eq(users.accountType, "supplier")));
    if (existing) {
      return { success: false, error: "An account with that email already exists." };
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const slug = await uniqueSlug(input.companyName);

    const { supplier, userId } = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ email: input.email, name: input.name, passwordHash, accountType: "supplier" })
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

      return { supplier: row, userId: user.id };
    });

    const token = crypto.randomUUID();
    await db.insert(verificationTokens).values({
      userId,
      token,
      type: "email_verification",
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    });
    const sendResult = await sendEmailVerificationEmail(input.email, input.name, token);

    return {
      success: true,
      id: supplier.id,
      verificationLink: sendResult.ok ? undefined : `/verify-email?token=${token}`,
    };
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
  emailVerified?: boolean;
}

/**
 * Non-auth status lookup by email, used by two ungated pages: the
 * /supplier/pending status page (for a just-registered applicant with no
 * session yet) and /supplier/login's pre-check (so "account not found",
 * "verify your email first", and pending/rejected/suspended all show
 * their real reason instead of a bare "invalid credentials" — the
 * NextAuth provider itself (authorizeSupplier in src/lib/auth.ts)
 * independently re-verifies accountType, emailVerified, and approval
 * status itself and is the only thing that can ever return a session).
 */
export async function getSupplierLoginStatus(email: string): Promise<SupplierLoginStatus> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { found: false };

  const [row] = await db
    .select({ status: suppliers.status, name: suppliers.name, emailVerified: users.emailVerified })
    .from(users)
    .innerJoin(suppliers, eq(suppliers.userId, users.id))
    .where(and(eq(users.email, normalized), eq(users.accountType, "supplier")));

  if (!row) return { found: false };
  return {
    found: true,
    status: row.status as SupplierAccountStatus,
    supplierName: row.name,
    emailVerified: Boolean(row.emailVerified),
  };
}
