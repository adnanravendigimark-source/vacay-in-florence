import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

/**
 * Upload for the "Upload Business Documents" step of the self-registration
 * wizard (src/app/supplier/register/supplier-register-flow.tsx). Runs
 * before any account exists, so — unlike src/app/api/admin/upload/route.ts
 * — this is deliberately unauthenticated: there is no staff or supplier
 * session to check yet. It validates the file server-side (type + size —
 * the client's <input accept> is a UX hint only) and stores it under a
 * dedicated, non-guessable path so an unauthenticated caller can't collide
 * with or overwrite another applicant's file. The returned URL is saved on
 * the new suppliers row (documentUrl) once registration completes, and
 * shown to admin as the applicant's compliance document.
 */

const MAX_BYTES = 10 * 1024 * 1024; // 10MB — matches the wizard's stated "Max 10MB"

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export async function POST(req: Request) {
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

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Please upload a PDF, JPG, PNG, DOC, or DOCX file." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File must be smaller than ${Math.round(MAX_BYTES / (1024 * 1024))}MB.` },
      { status: 400 },
    );
  }

  const random = Math.random().toString(36).slice(2, 10);
  const pathname = `supplier-applications/${Date.now()}-${random}.${ext}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url, filename: file.name, size: file.size });
  } catch (err) {
    console.error("Supplier registration document upload failed", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
