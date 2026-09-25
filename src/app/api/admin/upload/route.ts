import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getStaffContext } from "@/lib/require-user";

/**
 * General-purpose admin media upload, backed by Vercel Blob. Used by every
 * admin form's image/video picker (ImageField, and the Homepage Editor's
 * media fields) — the client posts the raw file here and gets back a public
 * URL to save into whichever DB column that field edits. Requires a signed-in
 * *staff* session (never trusts a client-supplied user id or role), validates
 * the file server-side (type + size — the client's <input accept> is a UX
 * hint only), and stores it under a path scoped to an admin-chosen folder
 * plus the uploader's id so files are traceable and never collide.
 */

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

function sanitizeFolder(raw: FormDataEntryValue | null): string {
  const value = typeof raw === "string" ? raw : "misc";
  const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return cleaned.slice(0, 40) || "misc";
}

export async function POST(req: Request) {
  const staff = await getStaffContext();
  if (!staff) {
    return NextResponse.json({ error: "You must be signed in as an admin to upload files." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "File uploads aren't configured yet. Please contact support." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file was provided." }, { status: 400 });
  }

  const folder = sanitizeFolder(formData.get("folder"));

  const isImage = file.type in ALLOWED_IMAGE_TYPES;
  const isVideo = file.type in ALLOWED_VIDEO_TYPES;

  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "Please upload a JPG, PNG, WEBP, GIF image, or an MP4/WEBM/MOV video." },
      { status: 400 },
    );
  }

  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File must be smaller than ${Math.round(maxBytes / (1024 * 1024))}MB.` },
      { status: 400 },
    );
  }

  const ext = isImage ? ALLOWED_IMAGE_TYPES[file.type] : ALLOWED_VIDEO_TYPES[file.type];
  const pathname = `admin/${folder}/${Date.now()}-${staff.userId}.${ext}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Admin upload failed", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
