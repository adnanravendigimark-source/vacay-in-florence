import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";

// Next.js falls back to its own bare, unstyled 404 for any route with no
// not-found.js boundary — no header/footer chrome, no site branding.
// This gives unmatched URLs the same look as every other page.
export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <Container className="py-14 sm:py-20">
      <EmptyState
        title="We can't find that page"
        description="The page you're looking for may have been moved or no longer exists. Try heading back to the homepage or browsing our experiences."
        actionLabel="Back to homepage"
        actionHref="/"
        icon={
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
            <circle cx="11" cy="11" r="7.5" />
            <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" strokeLinecap="round" />
          </svg>
        }
      />
    </Container>
  );
}
