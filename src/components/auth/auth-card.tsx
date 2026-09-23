"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { VacayLogo } from "@/components/ui/vacay-logo";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  activeTab?: "login" | "register" | "forgot" | "reset";
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  activeTab = "login",
}: AuthCardProps) {
  const isRegister = activeTab === "register";

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row">
      {/* Left Column: Full-Bleed Travel Photo (Desktop 50%, Mobile Top Banner) */}
      <div className="relative w-full lg:w-1/2 h-64 sm:h-80 lg:h-screen lg:sticky lg:top-0 overflow-hidden select-none shrink-0 bg-neutral-900">
        <img
          src="/images/auth-florence-duomo.jpg"
          alt="Florence skyline at golden sunset featuring the Brunelleschi Duomo cathedral, Giotto's Campanile, terracotta rooftops, and the Arno river"
          className="h-full w-full object-cover object-center brightness-[0.98] contrast-[1.02] transition-transform duration-1000 ease-out hover:scale-105"
        />

        {/* Subtle Ambient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 lg:from-black/40 lg:to-transparent" />

        {/* Back Link Overlay on Image */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-md px-4 py-2 text-xs font-semibold text-neutral-900 shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <span>&larr;</span>
            <span>Back to site</span>
          </Link>
        </div>

        {/* Floating Brand Note on Desktop Bottom */}
        <div className="hidden lg:block absolute bottom-8 left-8 right-8 z-20">
          <div className="rounded-2xl bg-black/35 backdrop-blur-md p-5 border border-white/20 text-white max-w-md">
            <span className="font-['Caveat',cursive] text-2xl font-bold text-amber-200 drop-shadow-sm block mb-1">
              Real Experiences Last Forever
            </span>
            <p className="text-xs text-neutral-200/90 leading-relaxed font-light">
              Bypass 2-hour queues, savor authentic Chianti cellars, and explore Florence with verified local historians.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Clean, Minimalist & High-Conversion Auth Console */}
      <div className="w-full lg:w-1/2 flex-1 flex flex-col justify-center px-6 py-10 sm:px-12 md:px-16 lg:px-20 xl:px-24 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Brand Logo Emblem */}
          <div className="mb-6 flex items-center justify-between">
            <VacayLogo variant="dark" />
            <Link
              href="/"
              className="lg:hidden text-xs font-semibold text-neutral-500 hover:text-neutral-900"
            >
              &larr; Home
            </Link>
          </div>

          {/* Main Titles matching the reference */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-600 mt-1 leading-tight">
                {subtitle}
              </h2>
            )}
          </div>

          {/* Social Auth Buttons (Google & Apple) on Login & Register */}
          {(activeTab === "login" || activeTab === "register") && (
            <>
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => alert("Google Sign-In will connect to your account once live OAuth keys are configured in your environment.")}
                  className="w-full flex items-center justify-center gap-3 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 px-6 py-3 text-sm font-semibold text-neutral-700 shadow-2xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  {/* Official Google 4-Color Icon */}
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>{isRegister ? "Sign up with Google" : "Sign in with Google"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert("Apple Sign-In will connect to your Apple ID once Apple Developer credentials are configured.")}
                  className="w-full flex items-center justify-center gap-3 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 px-6 py-3 text-sm font-semibold text-neutral-800 shadow-2xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  {/* Apple Black SVG Icon */}
                  <svg className="h-4.5 w-4.5 fill-current text-black" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.79-11.97-14.24-6.42-9.67-11.49-20.73-15.21-33.18-3.73-12.44-5.6-24.3-5.6-35.58 0-14.12 3.5-25.96 10.5-35.53 7-9.56 16.03-14.43 27.09-14.61 5.34 0 10.96 1.34 16.85 4.02 5.9 2.68 9.77 4.09 11.62 4.22 1.55-.13 5.48-1.55 11.78-4.26 6.3-2.71 11.69-3.95 16.17-3.73 12.39.63 22.36 5.09 29.9 13.38-10.89 6.56-16.22 15.82-16 27.79.23 9.4 3.82 17.26 10.77 23.58 6.95 6.32 15.27 10.02 24.96 11.11-2.18 6.53-4.8 12.72-7.85 18.57zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.83-10.45 19.59-12.17.21 1.05.32 2.05.32 3 0 7.39-2.76 14.38-8.28 20.97-5.52 6.59-12.08 10.5-19.68 11.74-.21-.73-.32-1.68-.32-2.87z" />
                  </svg>
                  <span>{isRegister ? "Sign up with Apple" : "Sign in with Apple"}</span>
                </button>
              </div>

              {/* Clean 'OR' Divider */}
              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <span className="relative bg-white px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  or
                </span>
              </div>
            </>
          )}

          {/* Core Credentials Form */}
          <div>{children}</div>

          {/* Bottom Switcher Card matching the reference */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            {footer ? (
              <div className="text-left space-y-3 text-sm">{footer}</div>
            ) : isRegister ? (
              <div className="text-left space-y-3">
                <p className="text-sm font-medium text-neutral-700">Already have an account?</p>
                <Link
                  href="/login"
                  className="block w-full text-center rounded-full border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 px-6 py-3 text-sm font-semibold text-neutral-900 transition-all cursor-pointer"
                >
                  Log in
                </Link>
              </div>
            ) : (
              <div className="text-left space-y-3">
                <p className="text-sm font-medium text-neutral-700">Don&apos;t have an account?</p>
                <Link
                  href="/register"
                  className="block w-full text-center rounded-full border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 px-6 py-3 text-sm font-semibold text-neutral-900 transition-all cursor-pointer"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>

          {/* Footer Security Badge */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-neutral-400">
              🔒 256-Bit SSL Encrypted • Zero Booking Fees • VACAY Florence Official
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormField({
  label,
  name,
  type = "text",
  required = true,
  defaultValue,
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-xs font-bold text-neutral-700">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={name}
          name={name}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          required={required}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 ${
            isPassword ? "pr-11" : ""
          }`}
        />

        {/* Right Password Visibility Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3.5 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-2xl bg-amber-50 border border-amber-200/80 p-3.5 text-xs text-amber-900"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber-600 fill-current shrink-0 mt-0.5">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span className="font-medium leading-relaxed">{message}</span>
    </div>
  );
}

export function FormNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="flex items-start gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-3.5 text-xs text-emerald-900"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4 text-emerald-600 fill-current shrink-0 mt-0.5">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span className="font-medium leading-relaxed">{message}</span>
    </div>
  );
}

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-neutral-900 hover:bg-black text-white px-6 py-3.5 text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <span>Processing&hellip;</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}

export function FormTextArea({
  label,
  name,
  required = true,
  rows = 5,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-xs font-bold text-neutral-700">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-neutral-300 bg-white p-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
      />
    </div>
  );
}
