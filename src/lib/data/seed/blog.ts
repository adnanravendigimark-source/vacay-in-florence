import type { BlogPostSummary } from "@/lib/types";

export const seedBlogPosts: BlogPostSummary[] = [
  {
    id: "post_48-hours-in-florence",
    slug: "48-hours-in-florence-perfect-itinerary",
    title: "48 Hours in Florence: The Perfect First-Time Itinerary",
    category: "Itineraries",
    excerpt:
      "How to fit the Duomo, the Uffizi, and a sunset at Piazzale Michelangelo into one tight weekend without missing the magic.",
    readingTimeMinutes: 6,
    publishedAt: "2025-09-20",
    image: { src: "/images/duomo-tour.jpg", alt: "Florence panoramic cityscape with the Duomo" },
  },
  {
    id: "post_skip-the-line-vs-standard",
    slug: "skip-the-line-vs-standard-tickets",
    title: "Skip-the-Line vs. Standard Tickets: What Actually Saves You Time",
    category: "Tickets & Tips",
    excerpt:
      "Real queue times at the Uffizi and the Accademia, and when a skip-the-line ticket is worth the extra cost.",
    readingTimeMinutes: 5,
    publishedAt: "2025-09-18",
    image: { src: "/images/uffizi-corridor.jpg", alt: "Uffizi Gallery Renaissance hallway and statues" },
  },
  {
    id: "post_best-day-trips",
    slug: "5-best-day-trips-from-florence",
    title: "5 Day Trips From Florence Worth the Train Ticket",
    category: "Day Trips",
    excerpt:
      "Siena, San Gimignano, Pisa, Chianti, and Cinque Terre — how far each one is and how to plan the day.",
    readingTimeMinutes: 7,
    publishedAt: "2025-08-27",
    image: { src: "/images/chianti-hills.jpg", alt: "Tuscan rolling hills with cypress trees and vineyards" },
  },
  {
    id: "post_food-wine-guide",
    slug: "the-ultimate-florentine-food-and-wine-guide",
    title: "The Ultimate Florentine Food & Wine Guide: What & Where to Eat",
    category: "Food & Wine",
    excerpt:
      "From Bistecca alla Fiorentina to lampredotto and Chianti Classico — discover authentic dining spots in Florence.",
    readingTimeMinutes: 6,
    publishedAt: "2025-08-15",
    image: { src: "/images/tuscan-food.jpg", alt: "Florentine food spread with wine and fresh ingredients" },
  },
  {
    id: "post_culture-history",
    slug: "hidden-renaissance-gems-beyond-the-duomo",
    title: "Hidden Renaissance Gems: Beyond the Duomo & Uffizi",
    category: "Culture & History",
    excerpt:
      "Explore lesser-known chapels, artisan workshops, and quiet cloisters where Florence's rich history lives on.",
    readingTimeMinutes: 8,
    publishedAt: "2025-08-04",
    image: { src: "/images/hero2-florence-panorama.jpg", alt: "Historic Florence terracotta rooftops" },
  },
  {
    id: "post_sunset-spots",
    slug: "top-10-sunset-spots-in-florence-local-guide",
    title: "Top 10 Sunset Spots in Florence: A Local's Guide",
    category: "Travel Tips",
    excerpt:
      "Where to catch golden hour over the Arno, from secret terrace rooftops to scenic hilltop gardens.",
    readingTimeMinutes: 5,
    publishedAt: "2025-07-28",
    image: { src: "/images/ponte-vecchio.jpg", alt: "Ponte Vecchio reflection in the river at dusk" },
  },
  {
    id: "post_duomo_climb",
    slug: "climbing-the-duomo-everything-you-need-to-know",
    title: "Climbing the Duomo: Everything You Need to Know",
    category: "Travel Tips",
    excerpt:
      "From ticket details to what to expect at the top — here's your complete guide to the Duomo dome climb.",
    readingTimeMinutes: 5,
    publishedAt: "2025-09-12",
    image: { src: "/images/hero2-duomo-terrace.jpg", alt: "Brunelleschi dome rooftop view" },
  },
];

