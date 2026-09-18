import type { ProductBadge } from "@/lib/types";

const BADGE_LABEL: Record<ProductBadge, string> = {
  "free-cancellation": "Free cancellation",
  "skip-the-line": "Skip the line",
  "best-seller": "Best seller",
  "small-group": "Small group",
  "instant-confirmation": "Instant confirmation",
};

export function ProductBadgePill({ badge }: { badge: ProductBadge }) {
  const isHighlight = badge === "best-seller";
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium " +
        (isHighlight ? "bg-terracotta text-white" : "bg-cream-deep text-ink-soft")
      }
    >
      {BADGE_LABEL[badge]}
    </span>
  );
}
