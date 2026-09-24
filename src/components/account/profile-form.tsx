"use client";

import { useRef, useState } from "react";

interface ProfileFormProps {
  initialUser: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  };
  error?: string;
  success?: string;
  formAction: (formData: FormData) => void;
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function getInitials(name: string | null | undefined): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function ProfileForm({ initialUser, error, success, formAction }: ProfileFormProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl ?? "");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setUploadError(null);

    if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
      setUploadError("Please choose a JPG, PNG, WEBP, or GIF image.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError("That image is larger than 5MB. Please choose a smaller file.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/account/avatar/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setUploadError(data.error || "Upload failed. Please try again.");
        return;
      }

      setAvatarUrl(data.url);
    } catch {
      setUploadError("Upload failed. Please check your connection and try again.");
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
    }
  }

  const displayedPhoto = localPreview || avatarUrl;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Personal Information Form (8 cols) */}
      <div className="lg:col-span-8 rounded-3xl bg-white border border-stone shadow-[0_4px_25px_rgba(43,9,52,0.03)] p-6 sm:p-7">
        <div className="pb-5 border-b border-stone">
          <h2 className="font-display text-xl font-medium text-ink tracking-tight">
            Personal Information
          </h2>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
            Your personal information has been saved successfully.
          </div>
        )}

        <form action={formAction} className="mt-6 space-y-4.5">
          {/* Full Name */}
          <div>
            <label htmlFor="profile-name" className="block text-xs font-medium text-ink mb-1.5">
              Full name
            </label>
            <input
              id="profile-name"
              type="text"
              name="name"
              defaultValue={initialUser.name ?? ""}
              required
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone text-xs sm:text-[13px] text-ink focus:outline-none focus:border-[#2b0934] focus:ring-1 focus:ring-[#2b0934] transition shadow-2xs"
            />
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="profile-email" className="block text-xs font-medium text-ink mb-1.5">
              Email address
            </label>
            <input
              id="profile-email"
              type="email"
              name="email"
              defaultValue={initialUser.email ?? ""}
              required
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone text-xs sm:text-[13px] text-ink focus:outline-none focus:border-[#2b0934] focus:ring-1 focus:ring-[#2b0934] transition shadow-2xs"
            />
          </div>

          {/* Avatar URL — set only via the uploader on the right, never typed manually */}
          <input type="hidden" name="avatarUrl" value={avatarUrl} />

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center gap-2 bg-[#2b0934] hover:bg-[#3d0d4a] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-all duration-150 shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span>Save Changes</span>
              <span className="text-sm">&rarr;</span>
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Profile Photo preview + uploader (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-3xl bg-white border border-stone p-6 shadow-[0_4px_25px_rgba(43,9,52,0.03)] flex flex-col items-center text-center">
          {displayedPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-supplied/uploaded URL, not a static/optimizable local asset
            <img
              src={displayedPhoto}
              alt={initialUser.name ?? "Profile photo"}
              className={`w-20 h-20 rounded-full object-cover ring-4 ring-brand-light shadow-xs mb-4 bg-stone/40 ${uploading ? "opacity-50" : ""}`}
            />
          ) : (
            <div className="w-20 h-20 rounded-full ring-4 ring-brand-light shadow-xs mb-4 bg-[#2b0934] text-white flex items-center justify-center font-display text-2xl">
              {getInitials(initialUser.name)}
            </div>
          )}
          <p className="font-display text-base font-medium text-ink">{initialUser.name || "—"}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelected}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-4 inline-flex items-center gap-1.5 border border-stone-dark text-ink text-xs font-semibold px-4 py-2 rounded-full hover:bg-stone/30 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>{uploading ? "Uploading…" : initialUser.avatarUrl ? "Change Photo" : "Upload Photo"}</span>
          </button>

          {uploadError ? (
            <p className="mt-2.5 text-[11px] text-[#D94F3D] max-w-[190px]">{uploadError}</p>
          ) : (
            <p className="mt-2.5 text-[11px] text-neutral-400 leading-relaxed max-w-[190px]">
              JPG, PNG, WEBP, or GIF — up to 5MB.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
