import "server-only";

/**
 * Server-side verification for a Google reCAPTCHA v2 ("I'm not a robot"
 * checkbox) response token. Called from every auth surface that renders
 * the checkbox (see src/components/auth/recaptcha-checkbox.tsx) before
 * any credential check or account-creation write happens — a missing or
 * failed verification fails the whole request the same way a wrong
 * password does (generic error, no user enumeration).
 *
 * RECAPTCHA_SECRET_KEY lives only in the server environment — never sent
 * to the client, unlike NEXT_PUBLIC_RECAPTCHA_SITE_KEY which the checkbox
 * widget needs in the browser.
 */
export async function verifyRecaptcha(token: string | null | undefined): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    // Not configured yet (e.g. mid-setup, or a preview environment without
    // the secret). Fail closed rather than silently skipping verification
    // — an auth form that "looks" protected but isn't would be worse than
    // one that visibly refuses until the key is set.
    console.error("verifyRecaptcha: RECAPTCHA_SECRET_KEY is not set; rejecting.");
    return false;
  }

  if (!token) return false;

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });

    if (!res.ok) {
      console.error("verifyRecaptcha: siteverify responded", res.status);
      return false;
    }

    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) {
      console.warn("verifyRecaptcha: verification failed", data["error-codes"]);
    }
    return data.success === true;
  } catch (error) {
    console.error("verifyRecaptcha: request to siteverify failed:", error);
    return false;
  }
}
