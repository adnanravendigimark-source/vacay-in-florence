/**
 * Default "Good to know" tips shown on a public experience page when that
 * experience has no custom tips saved yet (product.goodToKnow is empty).
 * Shared by the public page's fallback rendering and the admin editor's
 * starting values, so editing an experience for the first time shows real,
 * editable text that matches what's currently live instead of a blank field.
 */
export const DEFAULT_GOOD_TO_KNOW_TIPS: string[] = [
  "Show your voucher (mobile or printed) at the entrance",
  "Arrive 10–15 minutes early",
  "Bring a valid photo ID matching your booking name",
];

/**
 * The exact set of badge values the public experience page recognizes and
 * renders as pills (see BADGE_META in
 * src/app/(public)/experiences/[slug]/page.tsx and formatLabel in
 * src/components/ui/badge.tsx). products.badges is a loosely-typed jsonb
 * string array in the database, so nothing stops bad data from being saved
 * directly — but the admin editor only lets you toggle these known values
 * on/off (rather than typing free text) specifically so every badge an
 * admin picks is guaranteed to actually show up on the public page. Keep
 * this list in sync with BADGE_META if a new badge type is ever added.
 */
export const PRODUCT_BADGE_OPTIONS: { value: string; label: string }[] = [
  { value: "best-seller", label: "Best seller" },
  { value: "top-rated", label: "Top rated" },
  { value: "popular", label: "Popular" },
  { value: "new", label: "New" },
  { value: "skip-the-line", label: "Skip the line" },
  { value: "free-cancellation", label: "Free cancellation" },
  { value: "instant-confirmation", label: "Instant confirmation" },
  { value: "small-group", label: "Small group" },
  { value: "food-wine", label: "Food & Wine" },
];

/**
 * Currencies selectable on a product's price fields in the admin editor.
 * NOTE: this only changes what symbol/code is stored and displayed on the
 * experience's own price tag (list page, hero price, pricing tiers) — cart,
 * checkout, order confirmation, and account pages all format prices with a
 * hardcoded "EUR" (see e.g. src/app/(public)/cart/page.tsx), so picking a
 * different currency here does not change what a customer is actually
 * charged or sees at checkout. Real multi-currency support would need those
 * hardcoded formatters fixed too.
 */
export const CURRENCY_OPTIONS: { value: string; label: string }[] = [
  { value: "EUR", label: "€ EUR" },
  { value: "USD", label: "$ USD" },
  { value: "GBP", label: "£ GBP" },
  { value: "CHF", label: "Fr CHF" },
  { value: "CAD", label: "$ CAD" },
  { value: "AUD", label: "$ AUD" },
];
