import "server-only";
import { Resend } from "resend";

/**
 * Thin Resend wrapper + the handful of transactional emails this app
 * sends (see the auth overhaul described in
 * claude/account-isolation-and-email-verification-summary.md).
 *
 * Every sender here is deliberately best-effort: a Resend failure is
 * logged and returned as `{ ok: false }`, never thrown, so a flaky email
 * provider can't turn into a 500 on registration/login. Callers that
 * gate access on verification (register, staff invite) still create the
 * real, single-use verification_tokens row regardless of whether the
 * send succeeded, and the calling code surfaces that same link directly
 * in the response as an honest fallback — this project's established
 * "never fake a success state" convention (see the pre-existing
 * forgot-password action) extended to cover "the email might not have
 * arrived" rather than just "no provider is connected at all". This
 * matters concretely today: RESEND_FROM_EMAIL is still the shared,
 * unverified onboarding@resend.dev sender (see .env's comment), which
 * Resend only guarantees delivers to the Resend account owner's own
 * inbox — real delivery to arbitrary customer addresses needs a
 * verified sending domain (resend.com/domains).
 */

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL ?? "VACAY in Florence <onboarding@resend.dev>";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export interface SendResult {
  ok: boolean;
  error?: string;
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<SendResult> {
  if (!resend) {
    console.error("sendEmail: RESEND_API_KEY is not set; email not sent.", { to, subject });
    return { ok: false, error: "Email is not configured." };
  }

  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html });
    if (result.error) {
      console.error("sendEmail: Resend rejected the request:", result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true };
  } catch (error) {
    console.error("sendEmail: request to Resend failed:", error);
    return { ok: false, error: "Could not send email." };
  }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#f5f3ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;padding:36px;">
      <p style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#8a9a94;margin:0 0 20px;">VACAY in Florence</p>
      <h1 style="font-size:20px;line-height:1.3;color:#1b3b36;margin:0 0 16px;">${title}</h1>
      ${bodyHtml}
      <p style="font-size:12px;color:#9a9a9a;margin:32px 0 0;">If you didn't expect this email, you can safely ignore it.</p>
    </div>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${href}" style="display:inline-block;background:#1b3b36;color:#ffffff;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">${label}</a></p>
<p style="font-size:12px;color:#9a9a9a;word-break:break-all;">Or paste this link into your browser: <br />${href}</p>`;
}

export async function sendEmailVerificationEmail(to: string, name: string, token: string): Promise<SendResult> {
  const link = `${SITE_URL}/verify-email?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: "Confirm your email address",
    html: layout(
      "Confirm your email address",
      `<p style="font-size:14px;line-height:1.6;color:#333;">Hi ${escapeHtml(name)},</p>
       <p style="font-size:14px;line-height:1.6;color:#333;">Thanks for creating a VACAY in Florence account. Confirm your email address to activate your account — you won't be able to sign in until it's confirmed.</p>
       ${button(link, "Confirm email address")}
       <p style="font-size:12px;color:#9a9a9a;">This link expires in 24 hours.</p>`,
    ),
  });
}

export async function sendGoogleWelcomeEmail(to: string, name: string, token: string): Promise<SendResult> {
  const link = `${SITE_URL}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: "Welcome to VACAY in Florence",
    html: layout(
      "Your account is ready",
      `<p style="font-size:14px;line-height:1.6;color:#333;">Hi ${escapeHtml(name)},</p>
       <p style="font-size:14px;line-height:1.6;color:#333;">Your VACAY in Florence account was just created with your Google sign-in (${escapeHtml(to)}). You're all set — just use "Continue with Google" any time to sign back in.</p>
       <p style="font-size:14px;line-height:1.6;color:#333;">If you'd also like to be able to sign in with a password, you can set one now:</p>
       ${button(link, "Set a password")}
       <p style="font-size:12px;color:#9a9a9a;">This link expires in 24 hours.</p>`,
    ),
  });
}

export async function sendStaffInviteEmail(
  to: string,
  name: string,
  token: string,
  roleName: string,
): Promise<SendResult> {
  const link = `${SITE_URL}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: "Set your password — VACAY in Florence Admin",
    html: layout(
      "You've been added to the admin team",
      `<p style="font-size:14px;line-height:1.6;color:#333;">Hi ${escapeHtml(name)},</p>
       <p style="font-size:14px;line-height:1.6;color:#333;">You've been given <strong>${escapeHtml(roleName)}</strong> access on VACAY in Florence's admin panel. Set a password to sign in at /admin/login — this is a separate login from any customer account on the same email.</p>
       ${button(link, "Set your password")}
       <p style="font-size:12px;color:#9a9a9a;">This link expires in 24 hours.</p>`,
    ),
  });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<SendResult> {
  const link = `${SITE_URL}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: "Reset your password",
    html: layout(
      "Reset your password",
      `<p style="font-size:14px;line-height:1.6;color:#333;">Hi ${escapeHtml(name)},</p>
       <p style="font-size:14px;line-height:1.6;color:#333;">We received a request to reset your VACAY in Florence password.</p>
       ${button(link, "Reset password")}
       <p style="font-size:12px;color:#9a9a9a;">This link expires in 1 hour.</p>`,
    ),
  });
}
