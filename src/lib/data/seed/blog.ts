import type { BlogPostSummary } from "@/lib/types";

/**
 * Placeholder rows shaped like the future `blog_posts` table. Swapped for
 * `prisma.blogPost.findMany(...)` once Neon is connected — see
 * src/lib/data/blog.ts.
 */
export const seedBlogPosts: BlogPostSummary[] = [
  {
    id: "post_48-hours-in-florence",
    slug: "48-hours-in-florence-perfect-itinerary",
    title: "48 Hours in Florence: The Perfect First-Time Itinerary",
    excerpt:
      "How to fit the Duomo, the Uffizi, and a sunset at Piazzale Michelangelo into one tight weekend without rushing.",
    readingTimeMinutes: 6,
    publishedAt: "2026-09-10",
    image: { src: "/images/scenes/duomo.svg", alt: "Illustration of Florence's Duomo dome" },
  },
  {
    id: "post_skip-the-line-vs-standard",
    slug: "skip-the-line-vs-standard-tickets",
    title: "Skip-the-Line vs. Standard Tickets: What Actually Saves You Time",
    excerpt:
      "Real queue times at the Uffizi and the Accademia, and when a skip-the-line ticket is worth the extra cost.",
    readingTimeMinutes: 5,
    publishedAt: "2026-09-03",
    image: { src: "/images/scenes/gallery-columns.svg", alt: "Illustration of a museum colonnade" },
  },
  {
    id: "post_best-day-trips",
    slug: "5-best-day-trips-from-florence",
    title: "5 Day Trips From Florence Worth the Train Ticket",
    excerpt:
      "Siena, San Gimignano, Pisa, Chianti, and Cinque Terre — how far each one is and how to plan the day around it.",
    readingTimeMinutes: 7,
    publishedAt: "2026-08-27",
    image: { src: "/images/scenes/cypress-road.svg", alt: "Illustration of a cypress-lined Tuscan road" },
  },
];
