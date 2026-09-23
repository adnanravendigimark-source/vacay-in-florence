"use client";

import { useEffect } from "react";

// Root-level error boundary. This catches errors thrown by the root
// layout itself (rare, but without this file Next.js/Turbopack has no
// error UI to fall back to at all — see the comment in src/app/error.tsx
// for why that missing boundary surfaces as next-auth ClientFetchErrors
// in the console). global-error.tsx replaces the entire root layout when
// it renders, so it must define its own <html> and <body>, and it
// intentionally uses inline styles rather than Tailwind classes since it
// may render before the app's own stylesheet is available.
export default function GlobalError({
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
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "2rem",
            backgroundColor: "#fbfaf7",
            color: "#1c1a17",
          }}
        >
          <h1 style={{ fontSize: "1.375rem", fontWeight: 600, margin: "0 0 0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ maxWidth: 380, color: "#6b675f", margin: "0 0 1.5rem", fontSize: "0.9375rem" }}>
            A critical error occurred loading VACAY Florence. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              borderRadius: 999,
              backgroundColor: "#2b0934",
              color: "#fff",
              padding: "0.75rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
