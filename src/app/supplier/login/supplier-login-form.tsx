"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { loginSchema } from "@/lib/validation/auth";
import { checkSupplierLoginStatusAction } from "./actions";
import { RecaptchaCheckbox, type RecaptchaCheckboxHandle } from "@/components/auth/recaptcha-checkbox";

interface StatusBannerInfo {
  title: string;
  body: string;
  type: "warning" | "error";
}

const STATUS_DETAILS: Record<string, StatusBannerInfo> = {
  pending: {
    title: "Your application is pending approval",
    body: "Your supplier account is currently under review by our admin team. You will be notified once it's approved.",
    type: "warning",
  },
  rejected: {
    title: "Application not approved",
    body: "Your supplier application was not approved. If you believe this is an error, please contact our support team.",
    type: "error",
  },
  suspended: {
    title: "Account suspended",
    body: "Your supplier account is currently suspended. Please contact partner support for more information.",
    type: "error",
  },
};

export function SupplierLoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [errorBanner, setErrorBanner] = useState<StatusBannerInfo | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<RecaptchaCheckboxHandle>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorBanner(null);
    setGenericError(null);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string) || "";
    const password = (formData.get("password") as string) || "";

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setGenericError(parsed.error.issues[0]?.message ?? "Please enter a valid email address and password.");
      return;
    }

    if (!recaptchaToken) {
      setGenericError("Please complete the reCAPTCHA verification.");
      return;
    }

    setPending(true);

    try {
      const status = await checkSupplierLoginStatusAction(parsed.data.email);
      if (status.found && status.emailVerified === false) {
        setPending(false);
        setErrorBanner({
          title: "Confirm your email address",
          body: "We sent a confirmation link to your email when you registered. Please confirm it before signing in.",
          type: "warning",
        });
        return;
      }
      if (status.found && status.status && status.status !== "approved") {
        setPending(false);
        setErrorBanner(
          STATUS_DETAILS[status.status] ?? {
            title: "Account Not Active",
            body: "Your supplier account isn't active yet.",
            type: "warning",
          }
        );
        return;
      }

      const result = await signIn("supplier-credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        recaptchaToken,
        redirect: false,
      });

      if (result?.error) {
        setPending(false);
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        setGenericError("Invalid email or password. Please check your credentials and try again.");
        return;
      }

      router.refresh();
      router.push(redirectTo);
    } catch {
      setPending(false);
      setGenericError("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Amber Pending / Error Notice Banner (Screen 7 reference) */}
      {errorBanner && (
        <div
          role="alert"
          className={`rounded-2xl p-4.5 border flex items-start gap-3.5 transition-all ${
            errorBanner.type === "warning"
              ? "bg-[#fef7e6] border-[#fde8be] text-[#8d5b0d]"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
              errorBanner.type === "warning"
                ? "bg-[#fae8c8] text-[#b47818]"
                : "bg-red-100 text-red-700"
            }`}
          >
            {errorBanner.type === "warning" ? "⚠️" : "✕"}
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight">{errorBanner.title}</h4>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed opacity-90">{errorBanner.body}</p>
          </div>
        </div>
      )}

      {/* Generic Error message */}
      {genericError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs sm:text-sm text-red-700 flex items-start gap-2.5"
        >
          <span className="text-base leading-none">⚠️</span>
          <span>{genericError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Email Address
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Enter your email"
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pr-11 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#1b3b36] focus:ring-1 focus:ring-[#1b3b36] outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer text-sm"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot Password Row */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-700">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded text-[#1b3b36] focus:ring-[#1b3b36] accent-[#1b3b36]"
            />
            <span>Remember me</span>
          </label>

          <Link
            href="/forgot-password?role=supplier"
            className="text-xs font-medium text-neutral-500 hover:text-[#1b3b36] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <RecaptchaCheckbox ref={recaptchaRef} onChange={setRecaptchaToken} />

        <button
          type="submit"
          disabled={pending || !recaptchaToken}
          className="w-full rounded-xl bg-[#1b3b36] hover:bg-[#132c28] active:scale-[0.99] text-white py-3.5 text-sm font-semibold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed mt-2"
        >
          {pending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </button>

        <div className="pt-2 text-center space-y-3">
          <Link
            href="/"
            className="inline-block text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Back to Home
          </Link>

          <p className="text-xs text-neutral-500 pt-2 border-t border-neutral-100">
            New supplier?{" "}
            <Link
              href="/supplier/register"
              className="font-semibold text-[#1b3b36] hover:underline"
            >
              Apply to become a supplier
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
