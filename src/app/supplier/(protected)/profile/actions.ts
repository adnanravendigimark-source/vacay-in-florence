"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireSupplier } from "@/lib/require-user";
import { logAudit } from "@/lib/audit";
import { supplierProfileSchema } from "@/lib/validation/supplier";
import { changePasswordSchema } from "@/lib/validation/auth";
import { updateSupplierProfile } from "@/lib/data/supplier/profile";

export async function updateSupplierProfileAction(formData: FormData): Promise<void> {
  const supplier = await requireSupplier("/supplier/profile");

  const parsed = supplierProfileSchema.safeParse({
    name: formData.get("name"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    website: formData.get("website"),
    country: formData.get("country"),
    logoUrl: formData.get("logoUrl"),
    about: formData.get("about"),
  });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check the form and try again.";
    redirect(`/supplier/profile?error=${encodeURIComponent(message)}`);
  }

  const result = await updateSupplierProfile(supplier.supplierId, parsed.data);
  if (!result.success) {
    redirect(`/supplier/profile?error=${encodeURIComponent(result.error ?? "Something went wrong.")}`);
  }

  revalidatePath("/supplier/profile");
  revalidatePath("/supplier/dashboard");
  await logAudit({
    actorUserId: supplier.userId,
    action: "supplier.profile_update",
    entityType: "supplier",
    entityId: supplier.supplierId,
    after: { name: parsed.data.name },
  });

  redirect("/supplier/profile?success=1");
}

export async function changeSupplierPasswordAction(formData: FormData): Promise<void> {
  const supplier = await requireSupplier("/supplier/profile");

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check the form and try again.";
    redirect(`/supplier/profile?error=${encodeURIComponent(message)}#security`);
  }

  const [user] = await db.select().from(users).where(eq(users.id, supplier.userId));
  if (!user) redirect("/supplier/profile?error=Account%20not%20found.#security");

  const currentMatches = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!currentMatches) {
    redirect(`/supplier/profile?error=${encodeURIComponent("Current password is incorrect.")}#security`);
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, user.id));

  await logAudit({
    actorUserId: supplier.userId,
    action: "supplier.password_change",
    entityType: "user",
    entityId: supplier.userId,
  });

  redirect("/supplier/profile?success=password#security");
}
