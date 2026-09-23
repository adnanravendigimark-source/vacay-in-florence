"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useAuthModal } from "./auth-modal-context";

export function AuthModal() {
  const {
    isOpen,
    view,
    email,
    redirectTo,
    closeAuthModal,
    setView,
    setEmail,
  } = useAuthModal();

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local form inputs
  const [inputEmail, setInputEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status and error messages
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Sync initial email when modal opens or email changes in context, and
  // reset errors/password fields when the view changes. Both are cases of
  // 'adjusting state when a prop changes' — done during render (React's
  // recommended pattern for this) rather than via a setState-in-effect,
  // which would otherwise trigger an extra cascading render on every
  // email/view change.
  const [prevEmail, setPrevEmail] = useState(email);
  if (email !== prevEmail) {
    setPrevEmail(email);
    if (email) setInputEmail(email);
  }

  const [prevView, setPrevView] = useState(view);
  if (view !== prevView) {
    setPrevView(view);
    setError(null);
    setNotice(null);
    setPassword("");
    setConfirmPassword("");
  }

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        closeAuthModal();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeAuthModal]);

  if (!isOpen) return null;

  // Step 1: Check Email and advance (GetYourGuide-style single input)
  async function handleEmailContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = inputEmail.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setEmail(trimmedEmail);
    setIsCheckingEmail(true);

    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();
      if (data.exists) {
        setView("login");
      } else {
        setView("register");
      }
    } catch {
      // If network check fails, gracefully default to login
      setView("login");
    } finally {
      setIsCheckingEmail(false);
    }
  }

  // Step 2: Handle Credentials Login
  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          email: inputEmail.trim().toLowerCase(),
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Incorrect password or account not found. Please try again.");
          return;
        }

        // Successfully signed in
        closeAuthModal();
        router.refresh();
        if (redirectTo && redirectTo !== "/account") {
          router.push(redirectTo);
        }
      } catch {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  }

  // Step 2 (Alternate): Handle Modal Registration
  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register-modal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: inputEmail.trim().toLowerCase(),
            password,
            confirmPassword,
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error || "Failed to create account.");
          return;
        }

        // Auto sign in with the new credentials
        const signResult = await signIn("credentials", {
          email: inputEmail.trim().toLowerCase(),
          password,
          redirect: false,
        });

        if (signResult?.error) {
          // If auto-login had an issue, transition to login view
          setView("login");
          setNotice("Account created! Please enter your password to sign in.");
        } else {
          closeAuthModal();
          router.refresh();
        }
      } catch {
        setError("Network error while creating account. Please try again.");
      }
    });
  }

  // Handle Social Login alerts (live OAuth placeholders)
  function handleSocialLogin(provider: string) {
    alert(`${provider} Sign-In will connect once live OAuth credentials are configured in your environment.`);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Dimmed Blurred Backdrop */}
      <div
        onClick={closeAuthModal}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Centered Modal Card */}
      <div
        className="relative w-full max-w-[460px] bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200"
      >
        {/* Top Header Bar */}
        <div className="relative flex items-center justify-between px-6 pt-6 pb-2 border-b border-neutral-100">
          {/* Left Action: Close or Back */}
          {view === "email" ? (
            <button
              type="button"
              onClick={closeAuthModal}
              aria-label="Close modal"
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setView("email");
                setError(null);
              }}
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Centered Brand Title */}
          <h2
            id="auth-modal-title"
            className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight"
          >
            {view === "email" && "Log in or sign up"}
            {view === "login" && "Welcome back"}
            {view === "register" && "Create your account"}
            {view === "forgot" && "Reset password"}
          </h2>

          {/* Right Action: Close button on secondary steps, or brand mark */}
          {view !== "email" ? (
            <button
              type="button"
              onClick={closeAuthModal}
              aria-label="Close modal"
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6 sm:px-8 sm:py-7">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-xs font-medium text-red-700 flex items-start gap-2.5 animate-in fade-in">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-red-500 fill-none stroke-current stroke-2 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Notice Banner */}
          {notice && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 flex items-center gap-2">
              <span>{notice}</span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW 1: GetYourGuide-Style "Email Address" + Social Continue */}
          {/* ------------------------------------------------------------- */}
          {view === "email" && (
            <div>
              <form onSubmit={handleEmailContinue} className="space-y-4">
                <div>
                  <label
                    htmlFor="modal-email-input"
                    className="block text-xs font-bold text-neutral-700 mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="modal-email-input"
                    type="email"
                    required
                    autoComplete="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-[#a813c9] focus:ring-1 focus:ring-[#a813c9]"
                  />
                </div>

                {/* Primary Continue Button */}
                <button
                  type="submit"
                  disabled={isCheckingEmail}
                  className="w-full rounded-full bg-[#2b0934] hover:bg-[#3d0d4a] text-white py-3.5 text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCheckingEmail ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Checking account...</span>
                    </>
                  ) : (
                    <span>Continue with email</span>
                  )}
                </button>
              </form>

              {/* Clean 'OR' Divider */}
              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <span className="relative bg-white px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  or
                </span>
              </div>

              {/* Social Buttons Stack (Google, Apple, Facebook) */}
              <div className="space-y-3">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin("Google")}
                  className="w-full flex items-center justify-center gap-3 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 px-5 py-3 text-sm font-semibold text-neutral-700 shadow-2xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
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
                  <span>Continue with Google</span>
                </button>

                {/* Apple Button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin("Apple")}
                  className="w-full flex items-center justify-center gap-3 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 px-5 py-3 text-sm font-semibold text-neutral-800 shadow-2xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <svg className="h-4.5 w-4.5 fill-current text-black" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.79-11.97-14.24-6.42-9.67-11.49-20.73-15.21-33.18-3.73-12.44-5.6-24.3-5.6-35.58 0-14.12 3.5-25.96 10.5-35.53 7-9.56 16.03-14.43 27.09-14.61 5.34 0 10.96 1.34 16.85 4.02 5.9 2.68 9.77 4.09 11.62 4.22 1.55-.13 5.48-1.55 11.78-4.26 6.3-2.71 11.69-3.95 16.17-3.73 12.39.63 22.36 5.09 29.9 13.38-10.89 6.56-16.22 15.82-16 27.79.23 9.4 3.82 17.26 10.77 23.58 6.95 6.32 15.27 10.02 24.96 11.11-2.18 6.53-4.8 12.72-7.85 18.57zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.83-10.45 19.59-12.17.21 1.05.32 2.05.32 3 0 7.39-2.76 14.38-8.28 20.97-5.52 6.59-12.08 10.5-19.68 11.74-.21-.73-.32-1.68-.32-2.87z" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>

                {/* Facebook Button (matching GetYourGuide) */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin("Facebook")}
                  className="w-full flex items-center justify-center gap-3 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 px-5 py-3 text-sm font-semibold text-neutral-800 shadow-2xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <svg className="h-4.5 w-4.5 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Continue with Facebook</span>
                </button>
              </div>

              {/* Legal Terms & Privacy notice */}
              <p className="mt-7 text-center text-[12px] leading-relaxed text-neutral-500">
                By continuing, you log in or sign up and accept our{" "}
                <Link
                  href="/terms"
                  onClick={closeAuthModal}
                  className="underline text-neutral-700 hover:text-neutral-900 font-medium"
                >
                  Terms and Conditions
                </Link>
                . See our{" "}
                <Link
                  href="/privacy"
                  onClick={closeAuthModal}
                  className="underline text-neutral-700 hover:text-neutral-900 font-medium"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW 2: Existing User -> Enter Password to Sign In */}
          {/* ------------------------------------------------------------- */}
          {view === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Selected Email Badge with Edit Button */}
              <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2.5">
                <div className="truncate pr-2">
                  <span className="text-[11px] font-medium text-neutral-400 block uppercase tracking-wider">Signing in as</span>
                  <span className="text-sm font-semibold text-neutral-900 truncate block">{inputEmail}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setView("email")}
                  className="text-xs font-semibold text-[#a813c9] hover:underline shrink-0 cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="modal-login-password"
                    className="block text-xs font-bold text-neutral-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative flex items-center">
                  <input
                    id="modal-login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3.5 pr-11 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-[#a813c9] focus:ring-1 focus:ring-[#a813c9]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center gap-2 pt-1 text-xs text-neutral-600">
                <input
                  id="modal-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-[#2b0934] focus:ring-[#a813c9] accent-[#a813c9]"
                />
                <label htmlFor="modal-remember-me" className="cursor-pointer select-none">
                  Remember me on this browser
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-full bg-[#2b0934] hover:bg-[#3d0d4a] text-white py-3.5 text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>

              {/* Switch to Register link */}
              <div className="pt-4 text-center border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setView("register")}
                  className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Don&apos;t have an account? <span className="underline text-[#2b0934]">Create one</span>
                </button>
              </div>
            </form>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW 3: New User -> Name & Password to Register */}
          {/* ------------------------------------------------------------- */}
          {view === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Selected Email Badge */}
              <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2.5">
                <div className="truncate pr-2">
                  <span className="text-[11px] font-medium text-neutral-400 block uppercase tracking-wider">Creating account for</span>
                  <span className="text-sm font-semibold text-neutral-900 truncate block">{inputEmail}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setView("email")}
                  className="text-xs font-semibold text-[#a813c9] hover:underline shrink-0 cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="modal-reg-name"
                  className="block text-xs font-bold text-neutral-700"
                >
                  Full name
                </label>
                <input
                  id="modal-reg-name"
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Leonardo da Vinci"
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-[#a813c9] focus:ring-1 focus:ring-[#a813c9]"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="modal-reg-password"
                  className="block text-xs font-bold text-neutral-700"
                >
                  Password <span className="font-normal text-neutral-400">(min. 8 characters)</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    id="modal-reg-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 pr-11 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-[#a813c9] focus:ring-1 focus:ring-[#a813c9]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="modal-reg-confirm"
                  className="block text-xs font-bold text-neutral-700"
                >
                  Confirm password
                </label>
                <input
                  id="modal-reg-confirm"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-[#a813c9] focus:ring-1 focus:ring-[#a813c9]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-full bg-[#2b0934] hover:bg-[#3d0d4a] text-white py-3.5 text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create account</span>
                )}
              </button>

              {/* Switch to Login */}
              <div className="pt-3 text-center border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Already have an account? <span className="underline text-[#2b0934]">Sign in</span>
                </button>
              </div>
            </form>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW 4: Forgot Password */}
          {/* ------------------------------------------------------------- */}
          {view === "forgot" && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-600 leading-relaxed">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <div>
                <label
                  htmlFor="modal-forgot-email"
                  className="block text-xs font-bold text-neutral-700 mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="modal-forgot-email"
                  type="email"
                  required
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-[#a813c9] focus:ring-1 focus:ring-[#a813c9]"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setNotice("If an account exists for this email, password reset instructions have been sent.");
                  setTimeout(() => setView("login"), 2000);
                }}
                className="w-full rounded-full bg-[#2b0934] hover:bg-[#3d0d4a] text-white py-3.5 text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                Send reset link
              </button>

              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
                >
                  Back to sign in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
