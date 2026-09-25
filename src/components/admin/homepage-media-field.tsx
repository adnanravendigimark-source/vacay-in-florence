"use client";

import { useRef, useState } from "react";
import { useToast } from "@/components/admin/ui/toast";

// Text-URL + real file-upload picker for the Homepage Editor's image and
// video fields, styled to match the editor's own inputs (rather than the
// generic admin ui/ImageField, which uses a different visual language).
// The URL field always works on its own; Upload is an added convenience
// that POSTs the chosen file to /api/admin/upload (Vercel Blob) and fills
// the same field with the resulting public URL.
export function HomepageMediaField({
  label,
  value,
  onChange,
  kind = "image",
  folder,
  placeholder,
  compact = false,
}: {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  kind?: "image" | "video";
  folder: string;
  placeholder?: string;
  compact?: boolean;
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
      formData.set("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Upload failed (${res.status})`);
      }
      const { url } = await res.json();
      onChange(url);
      showToast(`${kind === "video" ? "Video" : "Image"} uploaded.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed — paste a URL instead.", "error");
    } finally {
      setIsUploading(false);
    }
  }

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept={kind === "video" ? "video/mp4,video/webm,video/quicktime" : "image/*"}
      hidden
      onChange={handleFileSelected}
    />
  );

  if (compact) {
    return (
      <div className="flex gap-1.5 min-w-0">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? (kind === "video" ? "Video URL" : "Image URL")}
          className="text-xs bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg flex-1 min-w-0"
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          title="Upload from your computer"
          className="shrink-0 text-[10px] font-semibold text-[#183D2B] border border-[#EAE6DF] bg-white px-2 py-1.5 rounded-lg hover:bg-[#FAF8F5] disabled:opacity-50"
        >
          {isUploading ? "…" : "Upload"}
        </button>
        {fileInput}
      </div>
    );
  }

  return (
    <div>
      {label ? <label className="block text-xs font-semibold text-neutral-700 mb-1">{label}</label> : null}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? (kind === "video" ? "/video/… or https://…" : "/images/… or https://…")}
          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-[#FAF8F5] disabled:opacity-50"
        >
          {isUploading ? "Uploading…" : "Upload"}
        </button>
        {fileInput}
      </div>
      {value && kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary URL (local or uploaded), not an optimizable local asset
        <img src={value} alt="" className="mt-2 h-16 w-16 rounded-lg object-cover ring-1 ring-[#EAE6DF]" />
      ) : null}
      {value && kind === "video" ? (
        <video src={value} muted preload="metadata" className="mt-2 h-16 w-28 rounded-lg object-cover ring-1 ring-[#EAE6DF]" />
      ) : null}
    </div>
  );
}
