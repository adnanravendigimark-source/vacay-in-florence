import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * Real profile-photo upload. Uses Vercel Blob when configured, with a seamless
 * local disk fallback to /public/uploads/avatars/ for reliable development and hosting.
 */

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be signed in to upload a photo." }, { status: 401 });
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
    return NextResponse.json({ error: "Please upload a JPG, PNG, WEBP, or GIF image." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be smaller than 5MB." }, { status: 400 });
  }

  const filename = `${session.user.id}-${Date.now()}.${ext}`;
  let finalUrl = "";

  // 1. Try Vercel Blob if token is present
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const pathname = `avatars/${filename}`;
      const blob = await put(pathname, file, {
        access: "public",
        contentType: file.type,
      });
      finalUrl = blob.url;
    } catch (err) {
      console.warn("Vercel blob upload failed, attempting local fallback:", err);
    }
  }

  // 2. Local disk fallback
  if (!finalUrl) {
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
      await mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, filename);
      const arrayBuffer = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(arrayBuffer));
      finalUrl = `/uploads/avatars/${filename}`;
    } catch (fsErr) {
      console.error("Local avatar upload failed:", fsErr);
      return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
    }
  }

  // 3. Update the user database row directly
  try {
    await db
      .update(users)
      .set({ avatarUrl: finalUrl, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));
  } catch (dbErr) {
    console.warn("Could not immediately update user avatar in DB:", dbErr);
  }

  return NextResponse.json({ url: finalUrl });
}
