"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSupplierAction, setSupplierStatusAction } from "@/app/admin/(protected)/suppliers/actions";
import type { AdminSupplierDetail, SupplierStatus } from "@/lib/data/admin/suppliers";
import { Field, Input, Textarea, Select, Button, useToast } from "@/components/admin/ui";

const STATUSES: SupplierStatus[] = ["pending", "approved", "rejected", "suspended"];

export function SupplierEditor({ supplier }: { supplier: AdminSupplierDetail }) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({
    name: supplier.name,
    contactName: supplier.contactName ?? "",
    contactEmail: supplier.contactEmail ?? "",
    contactPhone: supplier.contactPhone ?? "",
    website: supplier.website ?? "",
    taxId: supplier.taxId ?? "",
    country: supplier.country ?? "",
    commissionRateOverride: supplier.commissionRateOverride != null ? String(supplier.commissionRateOverride) : "",
    notes: supplier.notes ?? "",
  });
  const [status, setStatus] = useState<SupplierStatus>(supplier.status);

  const update = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    startTransition(async () => {
      const result = await updateSupplierAction(supplier.id, {
        name: form.name.trim(),
        contactName: form.contactName.trim() || null,
        contactEmail: form.contactEmail.trim() || null,
        contactPhone: form.contactPhone.trim() || null,
        website: form.website.trim() || null,
        taxId: form.taxId.trim() || null,
        country: form.country.trim() || null,
        commissionRateOverride: form.commissionRateOverride.trim() ? Number(form.commissionRateOverride) : null,
        notes: form.notes.trim() || null,
      });
      if (!result.success) showToast(result.error ?? "Could not save.", "error");
      else {
        showToast("Supplier saved.", "success");
        router.refresh();
      }
    });
  };

  const changeStatus = (next: SupplierStatus) => {
    setStatus(next);
    startTransition(async () => {
      const result = await setSupplierStatusAction(supplier.id, next);
      if (!result.success) {
        showToast(result.error ?? "Could not update status.", "error");
        setStatus(supplier.status);
      } else {
        showToast(`Status set to ${next}.`, "success");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
        <Field label="Status">
          <Select value={status} onChange={(e) => changeStatus(e.target.value as SupplierStatus)} disabled={isPending}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#EAE6DF] bg-white p-5 sm:grid-cols-2">
        <Field label="Business name">
          <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
        </Field>
        <Field label="Contact name">
          <Input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
        </Field>
        <Field label="Contact email">
          <Input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
        </Field>
        <Field label="Contact phone">
          <Input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} />
        </Field>
        <Field label="Website">
          <Input value={form.website} onChange={(e) => update("website", e.target.value)} />
        </Field>
        <Field label="Country">
          <Input value={form.country} onChange={(e) => update("country", e.target.value)} />
        </Field>
        <Field label="Tax ID">
          <Input value={form.taxId} onChange={(e) => update("taxId", e.target.value)} />
        </Field>
        <Field label="Commission override (%)" hint="Leave blank to use the site default.">
          <Input
            type="number"
            step="0.1"
            value={form.commissionRateOverride}
            onChange={(e) => update("commissionRateOverride", e.target.value)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Notes">
            <Textarea rows={4} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
