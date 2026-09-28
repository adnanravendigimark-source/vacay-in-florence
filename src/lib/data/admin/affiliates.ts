import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { affiliates, leadSubmissions } from "@/lib/db/schema";

export type AffiliateStatus = "pending" | "approved" | "rejected" | "suspended";

export interface MutationResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface AdminAffiliateListItem {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  status: AffiliateStatus;
  website: string | null;
  commissionRateOverride: number | null;
  createdAt: Date;
}

export interface AdminAffiliateDetail extends AdminAffiliateListItem {
  contactPhone: string | null;
  notes: string | null;
}

export interface PendingAffiliateApplication {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  website: string | null;
  audienceSize: string | null;
  createdAt: Date;
}

function referralCodeFrom(name: string): string {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10) || "PARTNER";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}-${suffix}`;
}

async function uniqueReferralCode(name: string): Promise<string> {
  // Random suffix makes a collision astronomically unlikely, but check
  // anyway rather than trusting that.
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = referralCodeFrom(name);
    const [existing] = await db.select({ id: affiliates.id }).from(affiliates).where(eq(affiliates.referralCode, candidate));
    if (!existing) return candidate;
  }
  return `PARTNER-${Date.now().toString(36).toUpperCase()}`;
}

export async function listAdminAffiliates(): Promise<AdminAffiliateListItem[]> {
  const rows = await db.select().from(affiliates).orderBy(desc(affiliates.createdAt));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    referralCode: r.referralCode,
    status: r.status as AffiliateStatus,
    website: r.website,
    commissionRateOverride: r.commissionRateOverride,
    createdAt: r.createdAt,
  }));
}

export async function getAdminAffiliateById(id: string): Promise<AdminAffiliateDetail | null> {
  const [row] = await db.select().from(affiliates).where(eq(affiliates.id, id));
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    referralCode: row.referralCode,
    status: row.status as AffiliateStatus,
    website: row.website,
    commissionRateOverride: row.commissionRateOverride,
    contactPhone: row.contactPhone,
    notes: row.notes,
    createdAt: row.createdAt,
  };
}

export async function listPendingAffiliateApplications(): Promise<PendingAffiliateApplication[]> {
  const rows = await db
    .select()
    .from(leadSubmissions)
    .where(and(eq(leadSubmissions.type, "affiliate_application"), eq(leadSubmissions.status, "new")))
    .orderBy(desc(leadSubmissions.createdAt));

  return rows.map((r) => {
    const payload = (r.payload ?? {}) as { website?: string | null; audienceSize?: string | null };
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      company: r.company,
      message: r.message,
      website: payload.website ?? null,
      audienceSize: payload.audienceSize ?? null,
      createdAt: r.createdAt,
    };
  });
}

export interface AffiliateEditInput {
  name: string;
  contactPhone: string | null;
  website: string | null;
  commissionRateOverride: number | null;
  notes: string | null;
}

export async function updateAffiliate(id: string, input: AffiliateEditInput): Promise<MutationResult> {
  try {
    await db.update(affiliates).set(input).where(eq(affiliates.id, id));
    return { success: true, id };
  } catch (err) {
    console.error("[admin/affiliates] updateAffiliate failed:", err);
    return { success: false, error: "Could not save affiliate." };
  }
}

export async function setAffiliateStatus(id: string, status: AffiliateStatus): Promise<MutationResult> {
  try {
    await db.update(affiliates).set({ status }).where(eq(affiliates.id, id));
    return { success: true, id };
  } catch (err) {
    console.error("[admin/affiliates] setAffiliateStatus failed:", err);
    return { success: false, error: "Could not update status." };
  }
}

export async function approveAffiliateApplication(leadId: string): Promise<MutationResult> {
  try {
    const [lead] = await db.select().from(leadSubmissions).where(eq(leadSubmissions.id, leadId));
    if (!lead) return { success: false, error: "Application not found." };
    const payload = (lead.payload ?? {}) as { website?: string | null };

    // affiliates.email has a unique index — an applicant who already has
    // an affiliate row (e.g. re-applying) would otherwise 23505.
    const [existingByEmail] = await db.select({ id: affiliates.id }).from(affiliates).where(eq(affiliates.email, lead.email));
    if (existingByEmail) {
      await db.update(leadSubmissions).set({ status: "converted" }).where(eq(leadSubmissions.id, leadId));
      return { success: true, id: existingByEmail.id };
    }

    const referralCode = await uniqueReferralCode(lead.company?.trim() || lead.name);

    const result = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(affiliates)
        .values({
          name: lead.company?.trim() || lead.name,
          email: lead.email,
          referralCode,
          status: "approved",
          contactPhone: lead.phone,
          website: payload.website ?? null,
          notes: lead.message,
        })
        .returning({ id: affiliates.id });
      await tx.update(leadSubmissions).set({ status: "converted" }).where(eq(leadSubmissions.id, leadId));
      return created;
    });

    return { success: true, id: result.id };
  } catch (err) {
    console.error("[admin/affiliates] approveAffiliateApplication failed:", err);
    return { success: false, error: "Could not approve this application." };
  }
}

export async function rejectAffiliateApplication(leadId: string, reason: string): Promise<MutationResult> {
  try {
    const [lead] = await db.select().from(leadSubmissions).where(eq(leadSubmissions.id, leadId));
    if (!lead) return { success: false, error: "Application not found." };
    const payload = { ...((lead.payload as object) ?? {}), rejectionReason: reason || null };
    await db.update(leadSubmissions).set({ status: "rejected", payload }).where(eq(leadSubmissions.id, leadId));
    return { success: true, id: leadId };
  } catch (err) {
    console.error("[admin/affiliates] rejectAffiliateApplication failed:", err);
    return { success: false, error: "Could not reject this application." };
  }
}
