"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";

// App Router route-segment error boundary. Without this file, Next.js/
// Turbopack has no compiled error UI to fall back to when a page throws
// (e.g. a transient DB connection error) — in dev this can surface as a
// bare "missing required error components, refreshing..." page, and any
// client-side fetch made while the app is in that state (such as
// next-auth's SessionProvider polling /api/auth/session) gets that raw
// HTML back instead of JSON, which is what throws next-auth's
// ClientFetchError in the console.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-14 sm:py-20">
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-dark bg-cream-deep/50 px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-terracotta ring-1 ring-stone-dark">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="7.5" x2="12" y2="13" strokeLinecap="round" />
            <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-medium text-ink">Something went wrong</h2>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">
          We hit an unexpected error loading this page. Try again, or head back to the homepage.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center rounded-full bg-cypress px-6 py-3 text-sm font-semibold text-white transition hover:bg-cypress/90 cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-stone-dark bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-cream"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </Container>
  );
}
