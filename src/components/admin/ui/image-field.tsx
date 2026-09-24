"use client";

import { useRef, useState } from "react";
import { Field } from "./field";
import { Input } from "./input";
import { useToast } from "./toast";

// Image input for admin forms (product/category/blog-post images): a
// plain URL text field that works immediately with zero new
// infrastructure, PLUS a real upload button that fills the same field.
// Per the approved plan, both must exist side by side rather than
// picking one — the URL path never depends on the upload path working.
// The upload button posts to /api/admin/upload (wired for real in
// Phase 8 with Vercel Blob); until then it fails gracefully with a
// toast and the URL field keeps working on its own.
export function ImageField({
  label,
  value,
  onChange,
  hint,
  required,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  required?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Upload failed (${res.status})`);
      }
      const { url } = await res.json();
      onChange(url);
      showToast("Image uploaded.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed — paste an image URL instead.", "error");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Field label={label} hint={hint} required={required}>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          required={required}
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
        >
          {isUploading ? "Uploading…" : "Upload"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileSelected} />
      </div>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary external URL, not an optimizable local asset
        <img src={value} alt="" className="mt-2 h-24 w-24 rounded-xl object-cover ring-1 ring-stone" />
      ) : null}
    </Field>
  );
}
