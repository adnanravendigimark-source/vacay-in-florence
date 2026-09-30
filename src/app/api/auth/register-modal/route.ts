import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validation/auth";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { sendEmailVerificationEmail } from "@/lib/email";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Creates a customer account (accountType "customer" — see schema.ts's
 * users table comment on per-role email isolation) and sends a
 * verification email; the account cannot sign in until that link is
 * used (see authorizeAgainstRole in src/lib/auth.ts). No auto-login
 * here anymore — register-form.tsx shows a "check your email" state
 * instead of immediately calling signIn(). The verification link is
 * also returned directly in the response as an honest fallback (this
 * project's established "never fake a success state" convention, see
 * forgot-password/actions.ts) in case the email doesn't arrive — the
 * RESEND_FROM_EMAIL sender is still the shared, unverified
 * onboarding@resend.dev address (see .env's comment), which only
 * reliably delivers to the Resend account owner's own inbox until a
 * real domain is verified.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const recaptchaOk = await verifyRecaptcha(body?.recaptchaToken);
    if (!recaptchaOk) {
      return NextResponse.json(
        { error: "Please complete the reCAPTCHA verification and try again." },
        { status: 400 }
      );
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid form input.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), eq(users.accountType, "customer")))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [created] = await db
      .insert(users)
      .values({ email, name, passwordHash, accountType: "customer" })
      .returning({ id: users.id });

    const token = crypto.randomUUID();
    await db.insert(verificationTokens).values({
      userId: created.id,
      token,
      type: "email_verification",
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    });

    const sendResult = await sendEmailVerificationEmail(email, name, token);

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      // Honest fallback if delivery is unreliable in this environment —
      // see the file doc comment above. Omitted once a verified sending
      // domain makes delivery reliable enough to drop it, at which point
      // this becomes exactly the "no email provider" placeholder pattern
      // forgot-password used to always show, but as a rare fallback.
      verificationLink: sendResult.ok ? undefined : `/verify-email?token=${token}`,
    });
  } catch (error) {
    console.error("register-modal error:", error);
    return NextResponse.json(
      { error: "Something went wrong creating your account. Please try again." },
      { status: 500 }
    );
  }
}
