/**
 * Default content for attraction-page sections that are the same across
 * every attraction unless an admin overrides them. No "server-only" here
 * on purpose — imported from server code (data layer, page wrappers) AND
 * from the client-side Attraction Editor and public AttractionHubView.
 */

export interface WhyChooseItem {
  icon: string;
  title: string;
  description: string;
}

/**
 * The 4 value-point cards shown in the "Why Choose Our {Attraction}
 * Experiences?" section. This is the long-standing hardcoded copy every
 * attraction page has always shown — kept here as the fallback so nothing
 * changes visually until an admin explicitly edits
 * attraction.whyChooseItems in the Page Sections tab.
 */
export const DEFAULT_ATTRACTION_WHY_CHOOSE_ITEMS: WhyChooseItem[] = [
  { icon: "⚡", title: "Skip the lines", description: "Save time and avoid the 2-hour queues" },
  { icon: "👤", title: "Expert guides", description: "Learn art and history from certified locals" },
  { icon: "🏷️", title: "Best prices", description: "Compare options and book with confidence" },
  { icon: "🔄", title: "Flexible booking", description: "Free 24h cancellation on most experiences" },
];
