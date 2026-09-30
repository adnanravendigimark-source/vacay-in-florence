import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * Used only by the customer-facing auth-modal.tsx (its GetYourGuide-style
 * single-email-input step) to decide whether to show the login or
 * register view next. Scoped to accountType "customer" — under the
 * account-isolation model a staff or supplier account on this same email
 * is irrelevant to this decision; a visitor typing an email that belongs
 * only to an admin/supplier account should still land on "register" here
 * so they can create their own separate customer account.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!rawEmail || !rawEmail.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, rawEmail), eq(users.accountType, "customer")))
      .limit(1);

    return NextResponse.json({ exists: Boolean(user) });
  } catch (error) {
    console.error("check-email error:", error);
    return NextResponse.json({ exists: false }, { status: 200 });
  }
}
