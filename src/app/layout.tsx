import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/auth/session-provider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.vacayinflorence.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VACAY Florence — Skip-the-Line Tickets, Tours & Experiences",
    template: "%s | VACAY Florence",
  },
  description:
    "Book skip-the-line tickets, guided tours, and day trips in Florence with instant confirmation, free cancellation, and verified reviews.",
  openGraph: {
    type: "website",
    siteName: "VACAY Florence",
    locale: "en_US",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon.svg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#c1502e",
  width: "device-width",
  initialScale: 1,
};

// Trimmed to the bare shell every route needs (HTML/body, global metadata,
// the NextAuth session provider). The public marketing chrome
// (SiteHeader/SiteFooter/AuthModal*) previously lived here but moved to
// src/app/(public)/layout.tsx so the admin panel (src/app/admin/*) can
// render its own shell instead of inheriting the public site's header,
// footer, and login modal. Route groups don't affect URLs, so every
// public route keeps the exact same address it had before this split.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
