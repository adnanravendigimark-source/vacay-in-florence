import { db } from "./index";
import * as schema from "./schema";
import {
  categories,
  suppliers,
  products,
  productImages,
  productOptions,
  availability,
  blogPosts,
  cmsBlocks,
} from "./schema";
import { sql } from "drizzle-orm";
import {
  homepageContent,
  aboutPageContent,
  privacyPolicyContent,
  termsContent,
  cancellationPolicyContent,
} from "../data/seed/site-content";

/**
 * Seeds the local SQLite database with realistic demo data — the same
 * catalog the old `src/lib/data/seed/*.ts` mock arrays described, now as
 * real rows, with the real photography the redesign added wired in
 * (replacing the placeholder `/images/scenes/*.svg` illustrations).
 *
 * Idempotent: safe to re-run. Clears dependent tables in FK order first
 * rather than upserting row-by-row, since this is fixture data, not
 * anything a real user has created (carts/orders/users are untouched).
 *
 * Run with: npm run db:seed
 */

import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import { type PgTable } from "drizzle-orm/pg-core";

export async function seedDatabase(targetDb: NodePgDatabase<typeof schema> = db) {
  // Clear catalog + content tables only (never users/carts/orders — those
  // hold real account data once people start using the site).
  await targetDb.delete(productImages);
  await targetDb.delete(productOptions);
  await targetDb.delete(availability);
  await targetDb.delete(products);
  await targetDb.delete(categories);
  await targetDb.delete(suppliers);
  await targetDb.delete(blogPosts);
  await targetDb.delete(cmsBlocks);

  // ---------------------------------------------------------------------
  // Suppliers
  // ---------------------------------------------------------------------
  const supplierRows = [
    { name: "Florence Heritage Tours", slug: "florence-heritage-tours" },
    { name: "Uffizi & Accademia Direct", slug: "uffizi-accademia-direct" },
    { name: "Opera del Duomo Partners", slug: "opera-del-duomo-partners" },
    { name: "Arno Walking Co.", slug: "arno-walking-co" },
    { name: "Tuscany Vine Trails", slug: "tuscany-vine-trails" },
    { name: "Tuscan Horizons", slug: "tuscan-horizons" },
    { name: "Palazzo Pitti Access", slug: "palazzo-pitti-access" },
    { name: "Cucina Fiorentina", slug: "cucina-fiorentina" },
    { name: "Florence by Bike", slug: "florence-by-bike" },
  ];

  const insertedSuppliers = await targetDb.insert(suppliers).values(supplierRows).returning();
  const supplierBySlug = new Map(insertedSuppliers.map((s) => [s.slug, s]));

  // ---------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------
  const categoryRows = [
    {
      slug: "skip-the-line-attractions",
      name: "Skip-the-Line Attractions",
      shortDescription: "Walk straight past the queue at Florence's landmarks.",
      icon: "landmark",
      featured: true,
      sortOrder: 1,
      image: "/images/duomo-tour.jpg",
      imageAlt: "The Duomo dome above Florence's rooftops",
    },
    {
      slug: "museums-galleries",
      name: "Museums & Galleries",
      shortDescription: "The Uffizi, the Accademia, and Florence's Renaissance art.",
      icon: "museum",
      featured: true,
      sortOrder: 2,
      image: "/images/uffizi-corridor.jpg",
      imageAlt: "A gallery corridor inside the Uffizi",
    },
    {
      slug: "guided-tours",
      name: "Guided Tours",
      shortDescription: "Small-group and private tours led by local guides.",
      icon: "tour-guide",
      featured: true,
      sortOrder: 3,
      image: "/images/ponte-vecchio.jpg",
      imageAlt: "The Ponte Vecchio bridge over the Arno",
    },
    {
      slug: "food-wine-experiences",
      name: "Food & Wine Experiences",
      shortDescription: "Chianti tastings, market tours, and cooking classes.",
      icon: "food-wine",
      featured: true,
      sortOrder: 4,
      image: "/images/italian-cooking.jpg",
      imageAlt: "Fresh ingredients for a Tuscan cooking class",
    },
    {
      slug: "day-trips-from-florence",
      name: "Day Trips from Florence",
      shortDescription: "Siena, San Gimignano, Pisa, and the Tuscan countryside.",
      icon: "day-trip",
      featured: true,
      sortOrder: 5,
      image: "/images/chianti-hills.jpg",
      imageAlt: "Rolling hills of the Chianti countryside",
    },
    {
      slug: "outdoor-active",
      name: "Outdoor & Active",
      shortDescription: "Bike rides, river cruises, and Tuscan countryside hikes.",
      icon: "outdoor",
      featured: true,
      sortOrder: 6,
      image: "/images/adventure-banner.jpg",
      imageAlt: "Cyclists along the Arno river at sunset",
    },
  ];

  const insertedCategories = await targetDb
    .insert(categories)
    .values(
      categoryRows.map(({ image, imageAlt, ...rest }) => ({
        ...rest,
        imageUrl: image,
        imageAlt,
      })),
    )
    .returning();
  const categoryBySlug = new Map(insertedCategories.map((c) => [c.slug, c]));

  // ---------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------
  type ProductSeed = {
    slug: string;
    title: string;
    shortDescription: string;
    description: string;
    highlights: string[];
    inclusions: string[];
    exclusions: string[];
    meetingPoint: string;
    cancellationPolicy: string;
    categorySlug: string;
    supplierSlug: string;
    durationLabel: string;
    priceFromAmount: number;
    ratingAverage: number;
    reviewCount: number;
    featured: boolean;
    featuredRank: number | null;
    badges: string[];
    images: string[];
    options: { name: string; description: string; priceAmount: number }[];
  };

  const productSeeds: ProductSeed[] = [
    {
      slug: "uffizi-gallery-skip-the-line-ticket",
      title: "Uffizi Gallery Skip-the-Line Ticket",
      shortDescription: "Botticelli, da Vinci, and Michelangelo without the two-hour queue.",
      description:
        "The Uffizi holds one of the world's great Renaissance art collections, and its ticket line is one of the longest in Florence. This skip-the-line entry gets you past it and into rooms hung with Botticelli's Birth of Venus, da Vinci's Annunciation, and Caravaggio's Medusa on a self-paced visit.\n\nYour ticket is scanned at a dedicated entrance — no printed voucher swap, no second queue. A short audio guide app link is included so you can go at your own speed, or add a live guide from the options below.",
      highlights: [
        "Guaranteed entry time, no waiting in the general admission line",
        "See Botticelli's Birth of Venus and Primavera up close",
        "Self-paced visit — stay as long as you like once inside",
        "Free companion audio-guide app included",
      ],
      inclusions: ["Skip-the-line entry ticket", "Digital audio guide app access"],
      exclusions: ["Hotel pickup and drop-off", "Food and drinks", "Gratuities"],
      meetingPoint: "Uffizi Gallery, Door 3 (groups entrance), Piazzale degli Uffizi, Florence",
      cancellationPolicy: "Free cancellation up to 24 hours before your entry time for a full refund.",
      categorySlug: "museums-galleries",
      supplierSlug: "florence-heritage-tours",
      durationLabel: "2 hours",
      priceFromAmount: 29,
      ratingAverage: 4.7,
      reviewCount: 12480,
      featured: true,
      featuredRank: 1,
      badges: ["skip-the-line", "instant-confirmation", "best-seller"],
      images: ["/images/uffizi-corridor.jpg"],
      options: [
        { name: "Adult", description: "Ages 18+", priceAmount: 29 },
        { name: "Youth (18-25, EU citizen)", description: "Reduced-rate EU youth ticket", priceAmount: 15 },
      ],
    },
    {
      slug: "accademia-gallery-michelangelos-david-ticket",
      title: "Accademia Gallery: Michelangelo's David Ticket",
      shortDescription: "Stand in front of the original David with a guaranteed entry slot.",
      description:
        "Michelangelo's David has stood in the Accademia's purpose-built tribune since 1873, and this ticket gets you a guaranteed time slot in front of it without gambling on same-day availability. The gallery also holds Michelangelo's unfinished Prisoners and a collection of Florentine Gothic paintings.\n\nEntry is timed but the visit itself isn't rushed — once inside, take as long as you want with David and the rest of the collection.",
      highlights: [
        "Guaranteed entry slot — the Accademia sells out most days",
        "Face-to-face time with the original David, not a copy",
        "See Michelangelo's unfinished Prisoners sculptures",
        "Small, uncrowded gallery compared to the Uffizi",
      ],
      inclusions: ["Timed entry ticket"],
      exclusions: ["Guided tour (available as an add-on)", "Hotel pickup", "Gratuities"],
      meetingPoint: "Galleria dell'Accademia, Via Ricasoli 58-60, Florence",
      cancellationPolicy: "Free cancellation up to 24 hours before your entry time for a full refund.",
      categorySlug: "museums-galleries",
      supplierSlug: "uffizi-accademia-direct",
      durationLabel: "1.5 hours",
      priceFromAmount: 24,
      ratingAverage: 4.8,
      reviewCount: 9210,
      featured: true,
      featuredRank: 2,
      badges: ["skip-the-line", "instant-confirmation", "best-seller"],
      images: ["/images/uffizi-corridor.jpg"],
      options: [
        { name: "Adult", description: "Ages 18+", priceAmount: 24 },
        { name: "Child (under 18)", description: "Free entry, ticket still required", priceAmount: 4 },
      ],
    },
    {
      slug: "duomo-and-brunelleschis-dome-climb",
      title: "Duomo & Brunelleschi's Dome Climb",
      shortDescription: "463 steps up through the dome for the best rooftop view in Florence.",
      description:
        "Brunelleschi's dome is still the largest brick dome ever built, and the climb between its inner and outer shells is the only way to see how it was done — and to reach the best rooftop view of Florence's skyline. The route passes the interior fresco of the Last Judgment before the final stretch of narrow spiral stairs.\n\nThis isn't wheelchair or stroller accessible, and there's no elevator — allow a reasonable level of fitness and, if you're not comfortable with tight spaces, know that a few sections of the passage are narrow.",
      highlights: [
        "463 steps to the top of Florence's most famous dome",
        "Close-up view of the Last Judgment fresco from inside the drum",
        "Panoramic rooftop view over the whole historic center",
        "Small-group entry slots to avoid stairwell bottlenecks",
      ],
      inclusions: ["Timed dome climb entry", "Access to the Duomo complex (Baptistery, Crypt)"],
      exclusions: ["Bell tower climb (separate ticket)", "Guide", "Hotel pickup"],
      meetingPoint: "Piazza del Duomo, at the dome entrance on the north side of the Cathedral",
      cancellationPolicy: "Free cancellation up to 48 hours before your entry time; non-refundable inside 48 hours.",
      categorySlug: "skip-the-line-attractions",
      supplierSlug: "opera-del-duomo-partners",
      durationLabel: "3 hours",
      priceFromAmount: 45,
      ratingAverage: 4.9,
      reviewCount: 6340,
      featured: true,
      featuredRank: 3,
      badges: ["skip-the-line", "small-group", "best-seller"],
      images: ["/images/duomo-tour.jpg"],
      options: [{ name: "Adult", description: "Ages 18+", priceAmount: 45 }],
    },
    {
      slug: "florence-old-town-walking-tour-with-local-guide",
      title: "Florence Old Town Walking Tour with a Local Guide",
      shortDescription: "Piazza della Signoria, Ponte Vecchio, and the streets in between.",
      description:
        "A local guide walks you through Florence's historic center on foot, connecting Piazza della Signoria, the Ponte Vecchio, and the smaller streets and workshops most visitors walk straight past. Expect Medici history, Renaissance context, and honest recommendations for where to eat afterward.\n\nGroups are kept small so you can actually hear the guide and ask questions along the way.",
      highlights: [
        "Small-group tour, kept intentionally under 12 people",
        "Piazza della Signoria, Palazzo Vecchio exterior, and Ponte Vecchio",
        "Local guide with Medici-era history and present-day context",
        "Free cancellation if your plans change",
      ],
      inclusions: ["Local guide", "Small-group walking tour"],
      exclusions: ["Museum or monument entry tickets", "Food and drinks", "Hotel pickup"],
      meetingPoint: "Piazza della Signoria, at the base of the Neptune Fountain",
      cancellationPolicy: "Free cancellation up to 24 hours before the tour start time.",
      categorySlug: "guided-tours",
      supplierSlug: "arno-walking-co",
      durationLabel: "2.5 hours",
      priceFromAmount: 32,
      ratingAverage: 4.8,
      reviewCount: 4120,
      featured: false,
      featuredRank: null,
      badges: ["free-cancellation", "small-group"],
      images: ["/images/ponte-vecchio.jpg"],
      options: [
        { name: "Adult", description: "Ages 18+", priceAmount: 32 },
        { name: "Child (6-17)", description: "Accompanied by an adult", priceAmount: 18 },
      ],
    },
    {
      slug: "chianti-countryside-and-wine-tasting-day-trip",
      title: "Chianti Countryside & Wine Tasting Day Trip",
      shortDescription: "Three vineyards, a Tuscan lunch, and rolling hills along the way.",
      description:
        "A full day out of Florence into the Chianti hills, with stops at three family-run vineyards for tastings, a sit-down Tuscan lunch, and enough time on the road to actually see the cypress-lined countryside rather than just pass through it.\n\nTransport is by comfortable minivan with a small group, so it's a relaxed day rather than a rushed checklist.",
      highlights: [
        "Three vineyard tastings across the Chianti region",
        "Sit-down Tuscan lunch included",
        "Small-group minivan transport, hotel pickup available in central Florence",
        "Free cancellation up to 24 hours ahead",
      ],
      inclusions: ["Round-trip transport from central Florence", "Three vineyard tastings", "Tuscan lunch"],
      exclusions: ["Additional wine purchases", "Gratuities"],
      meetingPoint: "Central pickup point confirmed by email after booking (central Florence hotels included)",
      cancellationPolicy: "Free cancellation up to 24 hours before departure for a full refund.",
      categorySlug: "food-wine-experiences",
      supplierSlug: "tuscany-vine-trails",
      durationLabel: "8 hours",
      priceFromAmount: 89,
      ratingAverage: 4.9,
      reviewCount: 3050,
      featured: true,
      featuredRank: 4,
      badges: ["free-cancellation", "best-seller"],
      images: ["/images/chianti-hills.jpg"],
      options: [{ name: "Adult (18+, wine tasting included)", description: "Includes all tastings", priceAmount: 89 }],
    },
    {
      slug: "tuscany-full-day-tour-san-gimignano-siena-pisa",
      title: "Tuscany Full-Day Tour: San Gimignano, Siena & Pisa",
      shortDescription: "Three iconic towns in one comfortable, guided day out of Florence.",
      description:
        "One long, well-paced day covering three of Tuscany's most recognizable towns: San Gimignano's medieval towers, Siena's Piazza del Campo, and Pisa's Leaning Tower. A guide travels with the group throughout, with enough free time in each stop to wander on your own.\n\nIt's a full day — expect an early departure and a return to Florence in the evening.",
      highlights: [
        "San Gimignano, Siena, and Pisa in a single guided day",
        "Free time in each town to explore independently",
        "Comfortable coach transport between stops",
        "Guide included for context and logistics throughout",
      ],
      inclusions: ["Round-trip transport from Florence", "Guide", "Free time in each town"],
      exclusions: ["Lunch", "Entry tickets to individual monuments", "Gratuities"],
      meetingPoint: "Santa Maria Novella train station area, exact pickup point confirmed after booking",
      cancellationPolicy: "Free cancellation up to 24 hours before departure for a full refund.",
      categorySlug: "day-trips-from-florence",
      supplierSlug: "tuscan-horizons",
      durationLabel: "11 hours",
      priceFromAmount: 79,
      ratingAverage: 4.6,
      reviewCount: 5870,
      featured: true,
      featuredRank: 5,
      badges: ["free-cancellation", "instant-confirmation", "best-seller"],
      images: ["/images/chianti-hills.jpg"],
      options: [
        { name: "Adult", description: "Ages 18+", priceAmount: 79 },
        { name: "Child (6-17)", description: "Accompanied by an adult", priceAmount: 55 },
      ],
    },
    {
      slug: "boboli-gardens-and-pitti-palace-entry",
      title: "Boboli Gardens & Pitti Palace Entry",
      shortDescription: "The Medici family's gardens and grand residence, skip-the-line.",
      description:
        "The Pitti Palace was the Medici family's main residence, and the Boboli Gardens behind it are one of the earliest and largest examples of the Italian formal garden style. This ticket covers skip-the-line entry to both, with grounds large enough for a genuinely unhurried afternoon.",
      highlights: [
        "Skip-the-line entry to both the Palace and the Gardens",
        "Large formal gardens with fountains, grottoes, and city views",
        "See the Medici family's state apartments",
        "Quieter than the Uffizi, even in peak season",
      ],
      inclusions: ["Skip-the-line entry to Pitti Palace", "Boboli Gardens entry"],
      exclusions: ["Guide", "Hotel pickup", "Food and drinks"],
      meetingPoint: "Pitti Palace main entrance, Piazza de' Pitti 1, Florence",
      cancellationPolicy: "Free cancellation up to 24 hours before your entry time for a full refund.",
      categorySlug: "skip-the-line-attractions",
      supplierSlug: "palazzo-pitti-access",
      durationLabel: "2 hours",
      priceFromAmount: 22,
      ratingAverage: 4.5,
      reviewCount: 1980,
      featured: false,
      featuredRank: null,
      badges: ["skip-the-line"],
      images: ["/images/duomo-tour.jpg"],
      options: [{ name: "Adult", description: "Ages 18+", priceAmount: 22 }],
    },
    {
      slug: "florentine-cooking-class-with-market-visit",
      title: "Florentine Cooking Class with Market Visit",
      shortDescription: "Shop at a local market, then cook a three-course Tuscan menu.",
      description:
        "Start at a local Florentine market to pick ingredients with your instructor, then head to a home-style kitchen to cook a three-course Tuscan menu from scratch — usually fresh pasta, a Florentine main, and a classic dessert. Everyone sits down together to eat what they made.\n\nSmall groups only, so it stays hands-on rather than a demonstration.",
      highlights: [
        "Hands-on class, not a demonstration — you cook every course",
        "Market visit included to pick fresh, seasonal ingredients",
        "Three-course Tuscan menu, recipes provided to take home",
        "Small groups for a genuinely hands-on experience",
      ],
      inclusions: ["Market visit", "All ingredients", "Wine pairing with the meal", "Recipe booklet"],
      exclusions: ["Hotel pickup", "Additional alcoholic beverages"],
      meetingPoint: "Sant'Ambrogio Market, main entrance, Florence",
      cancellationPolicy: "Free cancellation up to 24 hours before the class start time.",
      categorySlug: "food-wine-experiences",
      supplierSlug: "cucina-fiorentina",
      durationLabel: "4 hours",
      priceFromAmount: 69,
      ratingAverage: 4.9,
      reviewCount: 2410,
      featured: false,
      featuredRank: null,
      badges: ["small-group", "free-cancellation", "best-seller"],
      images: ["/images/italian-cooking.jpg"],
      options: [{ name: "Adult", description: "Ages 12+", priceAmount: 69 }],
    },
    {
      slug: "arno-river-sunset-bike-tour",
      title: "Arno River Sunset Bike Tour",
      shortDescription: "An easy ride along the river as the city turns gold.",
      description:
        "An easy-paced bike ride along the Arno as the light turns gold over the water, with stops at a few viewpoints most walking tours don't reach. Bikes and helmets are provided and adjusted before setting off, and the pace is relaxed enough for casual riders.",
      highlights: [
        "Easy, flat riding route along the Arno river",
        "Timed to catch sunset light over the water",
        "Small group with a local guide",
        "Bike and helmet included, sized and fitted before departure",
      ],
      inclusions: ["Bike rental", "Helmet", "Local guide"],
      exclusions: ["Hotel pickup", "Food and drinks"],
      meetingPoint: "Florence by Bike shop, Via San Zanobi 120r, Florence",
      cancellationPolicy: "Free cancellation up to 24 hours before the tour start time.",
      categorySlug: "outdoor-active",
      supplierSlug: "florence-by-bike",
      durationLabel: "2 hours",
      priceFromAmount: 35,
      ratingAverage: 4.7,
      reviewCount: 890,
      featured: false,
      featuredRank: null,
      badges: ["small-group", "instant-confirmation"],
      images: ["/images/adventure-banner.jpg"],
      options: [{ name: "Adult", description: "Ages 14+", priceAmount: 35 }],
    },
  ];

  for (const p of productSeeds) {
    const category = categoryBySlug.get(p.categorySlug);
    const supplier = supplierBySlug.get(p.supplierSlug);
    if (!category || !supplier) {
      throw new Error(`Seed data error: missing category/supplier for product ${p.slug}`);
    }

    const [product] = await targetDb
      .insert(products)
      .values({
        slug: p.slug,
        title: p.title,
        shortDescription: p.shortDescription,
        description: p.description,
        highlights: p.highlights,
        inclusions: p.inclusions,
        exclusions: p.exclusions,
        meetingPoint: p.meetingPoint,
        cancellationPolicy: p.cancellationPolicy,
        categoryId: category.id,
        supplierId: supplier.id,
        status: "live",
        featured: p.featured,
        featuredRank: p.featuredRank,
        durationLabel: p.durationLabel,
        priceFromAmount: p.priceFromAmount,
        priceFromCurrency: "EUR",
        ratingAverage: p.ratingAverage,
        reviewCount: p.reviewCount,
        badges: p.badges,
      })
      .returning();

    if (p.images.length > 0) {
      await targetDb.insert(productImages).values(
        p.images.map((url, i) => ({
          productId: product.id,
          url,
          alt: p.title,
          sortOrder: i,
        })),
      );
    }

    if (p.options.length > 0) {
      await targetDb.insert(productOptions).values(
        p.options.map((o, i) => ({
          productId: product.id,
          name: o.name,
          description: o.description,
          priceAmount: o.priceAmount,
          priceCurrency: "EUR",
          sortOrder: i,
        })),
      );
    }

    // Availability: next 90 days, generous capacity, a small amount of
    // pre-existing "demand" on a deterministic pattern so the UI has
    // something realistic (a mix of wide-open and nearly-full dates)
    // without random data changing shape on every reseed.
    const today = new Date();
    const availabilityRows = [];
    for (let i = 1; i <= 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const iso = date.toISOString().slice(0, 10);
      const capacityTotal = 20;
      // Deterministic pseudo-demand pattern: every 7th day is nearly sold out.
      const capacityBooked = i % 7 === 0 ? 18 : i % 5 === 0 ? 10 : 2;
      availabilityRows.push({
        productId: product.id,
        date: iso,
        capacityTotal,
        capacityBooked,
      });
    }
    await targetDb.insert(availability).values(availabilityRows);
  }

  // ---------------------------------------------------------------------
  // Blog posts
  // ---------------------------------------------------------------------
  await targetDb.insert(blogPosts).values([
      {
        slug: "48-hours-in-florence-perfect-itinerary",
        title: "48 Hours in Florence: The Perfect First-Time Itinerary",
        excerpt:
          "How to fit the Duomo, the Uffizi, and a sunset at Piazzale Michelangelo into one tight weekend without rushing.",
        body:
          "Florence rewards a slower pace than most first-time visitors give it, but 48 hours is enough to see the essentials without feeling rushed if you plan the order carefully.\n\n" +
          "Day one: start early at the Duomo before the piazza fills up, then walk the few minutes to the Uffizi for a pre-booked skip-the-line slot — booking ahead here isn't optional in peak season, the standby line regularly runs past two hours. Spend the afternoon around Piazza della Signoria and the Ponte Vecchio, then head up to Piazzale Michelangelo for sunset over the city.\n\n" +
          "Day two: the Accademia in the morning for Michelangelo's David, then cross the river into the Oltrarno neighborhood for a quieter afternoon — the Pitti Palace and Boboli Gardens, or just wandering the artisan workshops on Via Maggio.\n\n" +
          "The one mistake worth avoiding: trying to add a day trip to Pisa or Siena into this window. Two days is tight enough for Florence itself — save the countryside for a return trip or an extra day.",
        coverImageUrl: "/images/duomo-tour.jpg",
        coverImageAlt: "Illustration of Florence's Duomo dome",
        readingTimeMinutes: 6,
        tags: ["itinerary", "first-time-visitors"],
        publishedAt: new Date("2026-09-10"),
      },
      {
        slug: "skip-the-line-vs-standard-tickets",
        title: "Skip-the-Line vs. Standard Tickets: What Actually Saves You Time",
        excerpt:
          "Real queue times at the Uffizi and the Accademia, and when a skip-the-line ticket is worth the extra cost.",
        body:
          "\"Skip-the-line\" gets used loosely enough in travel marketing that it's worth asking, for each specific site, what it actually saves you.\n\n" +
          "At the Uffizi, the standard ticket line in July or August regularly runs 90 minutes to two hours. A skip-the-line ticket gets you to a separate, much shorter entrance queue — usually under 15 minutes. That gap is real and, in peak season, worth the small premium.\n\n" +
          "At the Accademia, the gap is even starker: the gallery is small, and without a pre-booked timed ticket you can be turned away entirely on a sold-out day, not just delayed.\n\n" +
          "Where it matters less: shoulder season (November, early March) or first thing in the morning, when standard lines can be short enough that the premium isn't worth it. The honest rule of thumb — book ahead for the Accademia always, and for the Uffizi whenever you're visiting between April and October.",
        coverImageUrl: "/images/uffizi-corridor.jpg",
        coverImageAlt: "Illustration of a museum colonnade",
        readingTimeMinutes: 5,
        tags: ["tickets", "tips"],
        publishedAt: new Date("2026-09-03"),
      },
      {
        slug: "5-best-day-trips-from-florence",
        title: "5 Day Trips From Florence Worth the Train Ticket",
        excerpt:
          "Siena, San Gimignano, Pisa, Chianti, and Cinque Terre — how far each one is and how to plan the day around it.",
        body:
          "Florence's train connections make it one of the best bases in Italy for day trips, but not every destination is realistic in a single day.\n\n" +
          "Siena (about 1h15 by bus, longer by train via Empoli) is comfortably doable, with the Piazza del Campo and the Duomo worth a half day on their own. San Gimignano has no direct train — a bus or guided tour is the practical option, and it pairs naturally with Siena in a combined day.\n\n" +
          "Pisa is a straightforward hour by train, and while the Leaning Tower itself takes 20 minutes to see, the surrounding Piazza dei Miracoli is worth a couple of hours.\n\n" +
          "Chianti has no train station worth using — this is a car, guided tour, or nothing kind of trip, but it's the closest thing to a full countryside day, with vineyards a short drive from the city center.\n\n" +
          "Cinque Terre is the outlier: roughly 3 hours each way by train, which makes it a long day rather than a relaxed one. Worth it once, but plan for an early departure and a late return.",
        coverImageUrl: "/images/chianti-hills.jpg",
        coverImageAlt: "Illustration of a cypress-lined Tuscan road",
        readingTimeMinutes: 7,
        tags: ["day-trips", "tuscany"],
        publishedAt: new Date("2026-08-27"),
      },
    ]);

  // ---------------------------------------------------------------------
  // CMS-managed content: homepage, About Us, and the three legal pages —
  // one key/value row per page, same pattern, single source of truth
  // shared with the fallback content each page falls back to if its row
  // is ever missing (see src/lib/data/site-content.ts).
  // ---------------------------------------------------------------------
  await targetDb.insert(cmsBlocks).values([
    { key: "homepage", content: homepageContent, updatedBy: "seed" },
    { key: "about", content: aboutPageContent, updatedBy: "seed" },
    { key: "privacy-policy", content: privacyPolicyContent, updatedBy: "seed" },
    { key: "terms-conditions", content: termsContent, updatedBy: "seed" },
    { key: "cancellation-policy", content: cancellationPolicyContent, updatedBy: "seed" },
  ]);

  // ::int — Postgres count() is bigint; node-postgres would otherwise
  // return each one as a string.
  const countOf = async (table: PgTable) =>
    (await targetDb.select({ c: sql<number>`count(*)::int` }).from(table))[0].c;

  const counts = {
    suppliers: await countOf(suppliers),
    categories: await countOf(categories),
    products: await countOf(products),
    productImages: await countOf(productImages),
    productOptions: await countOf(productOptions),
    availability: await countOf(availability),
    blogPosts: await countOf(blogPosts),
    cmsBlocks: await countOf(cmsBlocks),
  };
  return counts;
}

if (process.argv[1]?.includes("seed")) {
  seedDatabase()
    .then((counts) => {
      console.log("[db:seed] Done:", counts);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
