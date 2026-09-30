import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Upload for the "Upload Business Documents" step of the self-registration
 * wizard (src/app/supplier/register/supplier-register-flow.tsx).
 */

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export async function POST(req: Request) {
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
  const filename = `${Date.now()}-${random}.${ext}`;
  let finalUrl = "";

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const pathname = `supplier-applications/${filename}`;
      const blob = await put(pathname, file, {
        access: "public",
        contentType: file.type,
      });
      finalUrl = blob.url;
    } catch (err) {
      console.warn("Vercel Blob supplier upload failed, attempting local fallback:", err);
    }
  }

  if (!finalUrl) {
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "supplier-applications");
      await mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, filename);
      const arrayBuffer = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(arrayBuffer));
      finalUrl = `/uploads/supplier-applications/${filename}`;
    } catch (fsErr) {
      console.error("Local supplier registration upload failed:", fsErr);
      return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
    }
  }

  return NextResponse.json({ url: finalUrl, filename: file.name, size: file.size });
}
