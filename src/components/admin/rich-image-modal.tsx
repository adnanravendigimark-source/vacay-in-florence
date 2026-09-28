"use client";

import { useRef, useState } from "react";
import { Field, Input, Button, Modal, useToast } from "@/components/admin/ui";

export interface RichImageModalData {
  url: string;
  alt: string;
  caption: string;
}

// The insert/edit dialog for RichTextEditor's "Image" toolbar button and
// for clicking an existing image/figure inside the article — a URL
// field plus a real upload button (both fill the same field, same
// convention as ImageField elsewhere in the admin), alt text (SEO +
// screen readers), and an optional caption that renders as a
// <figcaption> under the photo. Mirrors the Amsterdam reference repo's
// RichImageModal, minus its crop/media-library machinery, which nothing
// else in this admin panel has either — every other image field here is
// URL + upload only, so this stays consistent with that.
export function RichImageModal({
  initialValues,
  isEditing = false,
  onInsert,
  onDelete,
  onClose,
}: {
  initialValues?: RichImageModalData;
  isEditing?: boolean;
  onInsert: (data: RichImageModalData) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [url, setUrl] = useState(initialValues?.url || "");
  const [alt, setAlt] = useState(initialValues?.alt || "");
  const [caption, setCaption] = useState(initialValues?.caption || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "blog");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Upload failed (${res.status})`);
      }
      const { url: uploadedUrl } = await res.json();
      setUrl(uploadedUrl);
      showToast("Image uploaded.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed — paste an image URL instead.", "error");
    } finally {
      setIsUploading(false);
    }
  }

  function handleSave() {
    if (!url.trim()) {
      showToast("Add an image first — upload a file or paste a URL.", "error");
      return;
    }
    onInsert({ url: url.trim(), alt: alt.trim(), caption: caption.trim() });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? "Edit image" : "Insert image"}
      footer={
        <>
          {isEditing && onDelete ? (
            <Button variant="ghost" onClick={onDelete} className="mr-auto">
              Remove from article
            </Button>
          ) : null}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!url.trim() || isUploading}>
            {isEditing ? "Save changes" : "Insert image"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Image">
          <div className="flex gap-2">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… or upload a file" />
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
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary external URL
            <img src={url} alt="" className="mt-2 h-28 w-full max-w-xs rounded-xl border border-stone object-cover" />
          ) : null}
        </Field>

        <Field label="Alt text" hint="Describe what's shown, for SEO and screen readers.">
          <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Sunset view of the Duomo from Piazzale Michelangelo" />
        </Field>

        <Field label="Caption (optional)" hint="Shown under the photo on the article.">
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Shown under the photo" />
        </Field>
      </div>
    </Modal>
  );
}
