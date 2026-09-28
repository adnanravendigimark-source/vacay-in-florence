"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Field, Input, Button, useToast } from "@/components/admin/ui";
import type { SiteSettingsContent } from "@/lib/types";
import { saveSiteSettingsAction } from "@/app/admin/(protected)/settings/actions";

export function SiteSettingsEditor({ initialData }: { initialData: SiteSettingsContent }) {
  const [data, setData] = useState<SiteSettingsContent>(initialData);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const save = () => {
    startTransition(async () => {
      const result = await saveSiteSettingsAction(data);
      if (result.success) showToast("Website settings saved and live on the site.", "success");
      else showToast(result.error ?? "Could not save changes.", "error");
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <div className="flex flex-col gap-4 border-b border-[#F0ECE6] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-medium text-neutral-400">
            <Link href="/admin" className="hover:text-[#2b0934]">
              Dashboard
            </Link>{" "}
            / Website Settings
          </p>
          <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
            Website Settings
          </h1>
          <p className="mt-1 max-w-xl text-xs text-neutral-500 sm:text-[13px]">
            The site identity shown in the footer on every page — tagline, copyright name, and social links.
          </p>
        </div>
        <Button onClick={save} disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-neutral-400">Identity</h2>
        <div className="grid gap-4">
          <Field label="Footer tagline">
            <Input value={data.tagline} onChange={(e) => setData({ ...data, tagline: e.target.value })} />
          </Field>
          <Field label="Copyright name" hint='Shown as "© 2026 [this]. All rights reserved."'>
            <Input value={data.copyrightName} onChange={(e) => setData({ ...data, copyrightName: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
        <h2 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">Social links</h2>
        <p className="mb-4 text-xs text-neutral-500">Leave a field blank to hide that icon from the footer.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Facebook">
            <Input
              value={data.social.facebook}
              onChange={(e) => setData({ ...data, social: { ...data.social, facebook: e.target.value } })}
              placeholder="https://facebook.com/…"
            />
          </Field>
          <Field label="Instagram">
            <Input
              value={data.social.instagram}
              onChange={(e) => setData({ ...data, social: { ...data.social, instagram: e.target.value } })}
              placeholder="https://instagram.com/…"
            />
          </Field>
          <Field label="YouTube">
            <Input
              value={data.social.youtube}
              onChange={(e) => setData({ ...data, social: { ...data.social, youtube: e.target.value } })}
              placeholder="https://youtube.com/…"
            />
          </Field>
          <Field label="Pinterest">
            <Input
              value={data.social.pinterest}
              onChange={(e) => setData({ ...data, social: { ...data.social, pinterest: e.target.value } })}
              placeholder="https://pinterest.com/…"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
