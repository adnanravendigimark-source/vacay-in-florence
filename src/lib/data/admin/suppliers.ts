import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { suppliers, leadSubmissions } from "@/lib/db/schema";

export type SupplierStatus = "pending" | "approved" | "rejected" | "suspended";

export interface MutationResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface AdminSupplierListItem {
  id: string;
  name: string;
  slug: string;
  status: SupplierStatus;
  contactEmail: string | null;
  contactPhone: string | null;
  country: string | null;
  commissionRateOverride: number | null;
  createdAt: Date;
}

export interface AdminSupplierDetail extends AdminSupplierListItem {
  contactName: string | null;
  website: string | null;
  taxId: string | null;
  notes: string | null;
}

export interface PendingSupplierApplication {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  website: string | null;
  experienceType: string | null;
  createdAt: Date;
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
  // Small roster expected — a loop here is fine, no need for a fancier
  // collision-avoidance scheme.
  while (true) {
    const [existing] = await db.select({ id: suppliers.id }).from(suppliers).where(eq(suppliers.slug, candidate));
    if (!existing) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

export async function listAdminSuppliers(): Promise<AdminSupplierListItem[]> {
  const rows = await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    status: r.status as SupplierStatus,
    contactEmail: r.contactEmail,
    contactPhone: r.contactPhone,
    country: r.country,
    commissionRateOverride: r.commissionRateOverride,
    createdAt: r.createdAt,
  }));
}

export async function getAdminSupplierById(id: string): Promise<AdminSupplierDetail | null> {
  const [row] = await db.select().from(suppliers).where(eq(suppliers.id, id));
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status as SupplierStatus,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    website: row.website,
    taxId: row.taxId,
    country: row.country,
    commissionRateOverride: row.commissionRateOverride,
    notes: row.notes,
    createdAt: row.createdAt,
  };
}

/** Applications submitted through the public "Become a Supplier" form, awaiting review. */
export async function listPendingSupplierApplications(): Promise<PendingSupplierApplication[]> {
  const rows = await db
    .select()
    .from(leadSubmissions)
    .where(and(eq(leadSubmissions.type, "supplier_application"), eq(leadSubmissions.status, "new")))
    .orderBy(desc(leadSubmissions.createdAt));

  return rows.map((r) => {
    const payload = (r.payload ?? {}) as { website?: string | null; experienceType?: string | null };
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      company: r.company,
      message: r.message,
      website: payload.website ?? null,
      experienceType: payload.experienceType ?? null,
      createdAt: r.createdAt,
    };
  });
}

export interface SupplierEditInput {
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  taxId: string | null;
  country: string | null;
  commissionRateOverride: number | null;
  notes: string | null;
}

export async function updateSupplier(id: string, input: SupplierEditInput): Promise<MutationResult> {
  try {
    await db.update(suppliers).set(input).where(eq(suppliers.id, id));
    return { success: true, id };
  } catch (err) {
    console.error("[admin/suppliers] updateSupplier failed:", err);
    return { success: false, error: "Could not save supplier." };
  }
}

export async function setSupplierStatus(id: string, status: SupplierStatus): Promise<MutationResult> {
  try {
    await db.update(suppliers).set({ status }).where(eq(suppliers.id, id));
    return { success: true, id };
  } catch (err) {
    console.error("[admin/suppliers] setSupplierStatus failed:", err);
    return { success: false, error: "Could not update status." };
  }
}

/**
 * Turns a pending "Become a Supplier" application into a real roster row
 * and marks the lead as converted, in one transaction — never a supplier
 * with no originating lead, and never a lead left in "new" once acted on.
 */
export async function approveSupplierApplication(leadId: string): Promise<MutationResult> {
  try {
    const [lead] = await db.select().from(leadSubmissions).where(eq(leadSubmissions.id, leadId));
    if (!lead) return { success: false, error: "Application not found." };
    const payload = (lead.payload ?? {}) as { website?: string | null };

    const name = lead.company?.trim() || lead.name;
    const slug = await uniqueSlug(name);

    const result = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(suppliers)
        .values({
          name,
          slug,
          status: "approved",
          contactName: lead.name,
          contactEmail: lead.email,
          contactPhone: lead.phone,
          website: payload.website ?? null,
          notes: lead.message,
        })
        .returning({ id: suppliers.id });
      await tx.update(leadSubmissions).set({ status: "converted" }).where(eq(leadSubmissions.id, leadId));
      return created;
    });

    return { success: true, id: result.id };
  } catch (err) {
    console.error("[admin/suppliers] approveSupplierApplication failed:", err);
    return { success: false, error: "Could not approve this application." };
  }
}

export async function rejectSupplierApplication(leadId: string, reason: string): Promise<MutationResult> {
  try {
    const [lead] = await db.select().from(leadSubmissions).where(eq(leadSubmissions.id, leadId));
    if (!lead) return { success: false, error: "Application not found." };
    const payload = { ...((lead.payload as object) ?? {}), rejectionReason: reason || null };
    await db.update(leadSubmissions).set({ status: "rejected", payload }).where(eq(leadSubmissions.id, leadId));
    return { success: true, id: leadId };
  } catch (err) {
    console.error("[admin/suppliers] rejectSupplierApplication failed:", err);
    return { success: false, error: "Could not reject this application." };
  }
}
