import type { CategorySummary } from "@/lib/types";

/**
 * Placeholder rows shaped exactly like the future `categories` table
 * (prisma/schema.prisma). Swapped for `prisma.category.findMany(...)` once
 * Neon is connected — see src/lib/data/categories.ts.
 */
export const seedCategories: CategorySummary[] = [
  {
    id: "cat_skip-the-line-attractions",
    slug: "skip-the-line-attractions",
    name: "Skip-the-Line Attractions",
    shortDescription: "Walk straight past the queue at Florence's landmarks.",
    icon: "landmark",
    image: { src: "/images/scenes/duomo.svg", alt: "Illustration of Florence's Duomo dome" },
    productCount: 14,
    featured: true,
    sortOrder: 1,
  },
  {
    id: "cat_museums-galleries",
    slug: "museums-galleries",
    name: "Museums & Galleries",
    shortDescription: "The Uffizi, the Accademia, and Florence's Renaissance art.",
    icon: "museum",
    image: { src: "/images/scenes/gallery-columns.svg", alt: "Illustration of a museum colonnade" },
    productCount: 11,
    featured: true,
    sortOrder: 2,
  },
  {
    id: "cat_guided-tours",
    slug: "guided-tours",
    name: "Guided Tours",
    shortDescription: "Small-group and private tours led by local guides.",
    icon: "tour-guide",
    image: { src: "/images/scenes/ponte-vecchio.svg", alt: "Illustration of the Ponte Vecchio bridge" },
    productCount: 19,
    featured: true,
    sortOrder: 3,
  },
  {
    id: "cat_food-wine-experiences",
    slug: "food-wine-experiences",
    name: "Food & Wine Experiences",
    shortDescription: "Chianti tastings, market tours, and cooking classes.",
    icon: "food-wine",
    image: { src: "/images/scenes/tuscan-hills.svg", alt: "Illustration of Tuscan hills and vineyards" },
    productCount: 9,
    featured: true,
    sortOrder: 4,
  },
  {
    id: "cat_day-trips-from-florence",
    slug: "day-trips-from-florence",
    name: "Day Trips from Florence",
    shortDescription: "Siena, San Gimignano, Pisa, and the Tuscan countryside.",
    icon: "day-trip",
    image: { src: "/images/scenes/cypress-road.svg", alt: "Illustration of a cypress-lined Tuscan road" },
    productCount: 8,
    featured: true,
    sortOrder: 5,
  },
  {
    id: "cat_outdoor-active",
    slug: "outdoor-active",
    name: "Outdoor & Active",
    shortDescription: "Bike rides, river cruises, and Tuscan countryside hikes.",
    icon: "outdoor",
    image: { src: "/images/scenes/river-arno.svg", alt: "Illustration of the Arno river" },
    productCount: 6,
    featured: true,
    sortOrder: 6,
  },
];
