"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAffiliateAction, setAffiliateStatusAction } from "@/app/admin/(protected)/affiliates/actions";
import type { AdminAffiliateDetail, AffiliateStatus } from "@/lib/data/admin/affiliates";
import { Field, Input, Textarea, Select, Button, useToast } from "@/components/admin/ui";

const STATUSES: AffiliateStatus[] = ["pending", "approved", "rejected", "suspended"];

export function AffiliateEditor({ affiliate }: { affiliate: AdminAffiliateDetail }) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({
    name: affiliate.name,
    contactPhone: affiliate.contactPhone ?? "",
    website: affiliate.website ?? "",
    commissionRateOverride: affiliate.commissionRateOverride != null ? String(affiliate.commissionRateOverride) : "",
    notes: affiliate.notes ?? "",
  });
  const [status, setStatus] = useState<AffiliateStatus>(affiliate.status);

  const update = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    startTransition(async () => {
      const result = await updateAffiliateAction(affiliate.id, {
        name: form.name.trim(),
        contactPhone: form.contactPhone.trim() || null,
        website: form.website.trim() || null,
        commissionRateOverride: form.commissionRateOverride.trim() ? Number(form.commissionRateOverride) : null,
        notes: form.notes.trim() || null,
      });
      if (!result.success) showToast(result.error ?? "Could not save.", "error");
      else {
        showToast("Affiliate saved.", "success");
        router.refresh();
      }
    });
  };

  const changeStatus = (next: AffiliateStatus) => {
    setStatus(next);
    startTransition(async () => {
      const result = await setAffiliateStatusAction(affiliate.id, next);
      if (!result.success) {
        showToast(result.error ?? "Could not update status.", "error");
        setStatus(affiliate.status);
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
          <Select value={status} onChange={(e) => changeStatus(e.target.value as AffiliateStatus)} disabled={isPending}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Select>
        </Field>
        <p className="mt-3 text-xs text-neutral-500">
          Referral code: <code className="rounded bg-[#F0ECE6] px-1.5 py-0.5 text-neutral-700">{affiliate.referralCode}</code>
          {" · "}Email: {affiliate.email}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#EAE6DF] bg-white p-5 sm:grid-cols-2">
        <Field label="Name">
          <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
        </Field>
        <Field label="Phone">
          <Input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} />
        </Field>
        <Field label="Website">
          <Input value={form.website} onChange={(e) => update("website", e.target.value)} />
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
