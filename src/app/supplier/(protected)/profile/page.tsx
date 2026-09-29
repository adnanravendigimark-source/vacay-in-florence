import type { Metadata } from "next";
import { requireSupplier } from "@/lib/require-user";
import { getSupplierProfile } from "@/lib/data/supplier/profile";
import { PageHeader, Field, Input, Textarea, Button } from "@/components/admin/ui";
import { updateSupplierProfileAction, changeSupplierPasswordAction } from "./actions";
import { SupplierLogoField } from "./logo-field";

export const metadata: Metadata = {
  title: "Profile | Supplier",
  robots: { index: false, follow: false },
};

export default async function SupplierProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const supplier = await requireSupplier("/supplier/profile");
  const { error, success } = await searchParams;
  const profile = await getSupplierProfile(supplier.supplierId);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title="Profile" description="Your company details, contact information, and account security." />

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {success === "1" ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
          Profile saved.
        </p>
      ) : null}
      {success === "password" ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
          Password changed.
        </p>
      ) : null}

      <form action={updateSupplierProfileAction} className="rounded-2xl border border-[#EAE6DF] bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-ink">Company & business</h2>

        <SupplierLogoField initialValue={profile?.logoUrl ?? ""} />

        <Field label="Company / business name" required>
          <Input name="name" defaultValue={profile?.name ?? ""} required />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact name">
            <Input name="contactName" defaultValue={profile?.contactName ?? ""} />
          </Field>
          <Field label="Contact email">
            <Input name="contactEmail" type="email" defaultValue={profile?.contactEmail ?? ""} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact phone">
            <Input name="contactPhone" type="tel" defaultValue={profile?.contactPhone ?? ""} />
          </Field>
          <Field label="Website">
            <Input name="website" type="url" defaultValue={profile?.website ?? ""} />
          </Field>
        </div>

        <Field label="Country">
          <Input name="country" defaultValue={profile?.country ?? ""} />
        </Field>

        <Field label="About" hint="Shown to admin — a short description of your business">
          <Textarea name="about" rows={4} defaultValue={profile?.about ?? ""} />
        </Field>

        <Button type="submit" variant="primary" size="sm">
          Save profile
        </Button>
      </form>

      <div id="security" className="rounded-2xl border border-[#EAE6DF] bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-ink">Account</h2>
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-neutral-500">Name</p>
            <p className="mt-0.5 text-neutral-900">{profile?.accountName}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Login email</p>
            <p className="mt-0.5 text-neutral-900">{profile?.accountEmail}</p>
          </div>
        </div>

        <form action={changeSupplierPasswordAction} className="space-y-4 border-t border-[#F0ECE6] pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Change password</h3>
          <Field label="Current password" required>
            <Input name="currentPassword" type="password" autoComplete="current-password" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New password" required>
              <Input name="newPassword" type="password" autoComplete="new-password" required />
            </Field>
            <Field label="Confirm new password" required>
              <Input name="confirmPassword" type="password" autoComplete="new-password" required />
            </Field>
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Change password
          </Button>
        </form>
      </div>
    </div>
  );
}
