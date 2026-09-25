import { db } from "@/lib/db";
import { homepageContent } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

export type HomepageContentData = typeof homepageContent.$inferSelect;
export type HomepageContentInsert = typeof homepageContent.$inferInsert;

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContentInsert = {
  id: "default",

  // 1. Hero Section
  heroEnabled: true,
  heroBadge: "OFFICIAL FLORENCE TICKETS & TOURS",
  heroHeading: "Unforgettable Experiences in Florence",
  heroSubheading:
    "Skip the 2-hour queues at the Duomo and Uffizi. Guaranteed entrance timeslots, expert local guides, and 100% free 24-hour cancellation.",
  heroPrimaryButtonText: "Explore Experiences",
  heroPrimaryButtonLink: "/experiences",
  heroSecondaryButtonText: "Today's Availability",
  heroSecondaryButtonLink: "/experiences",
  heroBackgroundImage: "/images/florence-hero.jpg",
  heroImageAlt: "Florence cathedral panorama",
  heroVideoUrl: "/video/hero-florence.mp4",
  heroTrendingTags: [
    { label: "⚡ Duomo Dome Climb", href: "/experiences/duomo-and-brunelleschis-dome-climb" },
    { label: "🏛️ Uffizi Skip-The-Line", href: "/experiences/uffizi-gallery-skip-the-line-ticket" },
    { label: "🎨 Michelangelo's David", href: "/experiences/accademia-gallery-michelangelos-david-ticket" },
    { label: "🍷 Chianti Wine Tour", href: "/experiences/chianti-countryside-and-wine-tasting-day-trip" },
    { label: "🍝 Tuscan Cooking Class", href: "/experiences/florentine-cooking-class-with-market-visit" },
  ],

  // 2. Top Categories Section
  categoriesEnabled: true,
  categoriesBadge: "TOP CATEGORIES",
  categoriesTitle: "Explore Florence by Theme",
  categoriesSubtitle:
    "Find skip-the-line museum admissions, walking tours, Tuscan day trips, and culinary masterclasses.",
  categoriesItems: [
    { id: "cat-1", name: "Must-See Attractions", slug: "attractions", imageUrl: "/images/experiences/duomo-facade.jpg", enabled: true },
    { id: "cat-2", name: "Guided Tours", slug: "guided-tours", imageUrl: "/images/experiences/uffizi-tribuna.jpg", enabled: true },
    { id: "cat-3", name: "Day Trips", slug: "day-trips", imageUrl: "/images/experiences/chianti-vineyards.jpg", enabled: true },
    { id: "cat-4", name: "Food & Wine", slug: "food-and-wine", imageUrl: "/images/experiences/cooking-class-dining.jpg", enabled: true },
  ],
  categoriesLimit: 6,

  // 3. Featured Experiences Section
  experiencesEnabled: true,
  experiencesBadge: "CURATED EXPERIENCES",
  experiencesTitle: "Handcrafted Tours & Skip-The-Line Admissions",
  experiencesSubtitle: "Handcrafted tours and skip-the-line admissions chosen by local Florentines.",
  experiencesItems: [
    { id: "exp-1", title: "Florence Walking Tour", slug: "florence-walking-tour", imageUrl: "/images/experiences/duomo-facade.jpg", badgeText: "Popular", duration: "2.5h", priceFrom: "€35", enabled: true },
    { id: "exp-2", title: "Uffizi Gallery Tickets", slug: "uffizi-gallery-skip-the-line-ticket", imageUrl: "/images/experiences/uffizi-venus.jpg", badgeText: "Best Seller", duration: "1.5h", priceFrom: "€28", enabled: true },
    { id: "exp-3", title: "Tuscany Countryside Day Trip", slug: "chianti-countryside-and-wine-tasting-day-trip", imageUrl: "/images/experiences/chianti-vineyards.jpg", badgeText: "Top Rated", duration: "8h", priceFrom: "€62", enabled: true },
    { id: "exp-4", title: "Arno River Sunset Cruise", slug: "bike-tour-florence-viewpoint", imageUrl: "/images/experiences/bike-tour-ponte-vecchio.jpg", badgeText: "New", duration: "1h", priceFrom: "€40", enabled: true },
  ],

  // 4. Landmark Spotlight Section
  landmarkEnabled: true,
  landmarkBadge: "FLORENTINE MONUMENTS",
  landmarkTitle: "Four Must-Experience Monuments in Florence",
  landmarkSubtitle:
    "From the heights of Brunelleschi's dome to Michelangelo's David, discover the crown jewels of the Renaissance with reserved priority entry.",

  // 5. Itinerary Builder Section
  itineraryEnabled: true,
  itineraryBadge: "VACATION PLANNER",
  itineraryTitle: "Build Your Florence Day-by-Day",
  itinerarySubtitle:
    "Select your trip length and travel style to see curated morning, afternoon, and evening recommendations.",

  // 6. Why Choose Us Section
  whyUsEnabled: true,
  whyUsBadge: "THE VACAY FLORENCE DIFFERENCE",
  whyUsTitle: "Why Travelers Choose VACAY Over the Ticket Box Office",
  whyUsSubtitle:
    "Skip the stress, bypass the lines, and enjoy guaranteed entry to Florence's world-renowned museums and sights.",
  whyUsComparisonRows: [
    { feature: "Queue Time at Iconic Landmarks", gate: "Up to 2 to 3 hours under hot sun", vacay: "0 minutes — scan barcode directly at entry gate", highlight: true },
    { feature: "Slot Availability", gate: "Often sold out 1–2 weeks in advance on site", vacay: "Guaranteed reserved entry timeslots", highlight: false },
    { feature: "Cancellation & Refund Policy", gate: "100% Non-refundable paper tickets", vacay: "100% Free cancellation up to 24 hours prior", highlight: true },
    { feature: "Ticket Format & Delivery", gate: "Paper tickets vulnerable to loss or damage", vacay: "Instant mobile voucher sent to Email & Apple Wallet", highlight: false },
    { feature: "Customer Support & City Assistance", gate: "Limited counter staff with long queues", vacay: "24/7 dedicated traveler support team", highlight: false },
  ],
  whyUsStats: [
    { value: "98,000+", label: "Happy Travelers Welcomed" },
    { value: "4.9 / 5.0", label: "Average Experience Rating" },
    { value: "100%", label: "Verified Authentic Tickets" },
    { value: "24h", label: "Free Cancellation Guarantee" },
  ],
  whyUsCtaText: "Browse All Fast-Pass Tickets",
  whyUsCtaLink: "/experiences",

  // 7. Traveler Reviews / Testimonials Section
  testimonialsEnabled: true,
  testimonialsBadge: "VERIFIED TRAVELER FEEDBACK",
  testimonialsTitle: "Loved by Over 45,000 Visitors",
  testimonialsSubtitle:
    "Read candid reviews from culture lovers, families, and solo explorers who discovered Florence through VACAY.",
  testimonialsItems: [
    { name: "Sarah Jenkins", location: "London, UK", rating: 5, experienceTitle: "Uffizi Gallery Skip-the-Line", quote: "We walked past a 2-hour queue in 90-degree heat right into the Uffizi. Absolute lifesaver!", date: "2 days ago" },
    { name: "Marco Rossi", location: "New York, USA", rating: 5, experienceTitle: "Duomo & Dome Climb", quote: "The guide was incredible and the views from the top of the cupola were breathtaking.", date: "1 week ago" },
    { name: "Elena Schmidt", location: "Munich, Germany", rating: 5, experienceTitle: "Chianti Wine Tour", quote: "The Tuscan countryside day trip exceeded all expectations. Incredible wine and food.", date: "2 weeks ago" },
  ],

  // 8. VIP Conversion / CTA Section
  ctaEnabled: true,
  ctaBadge: "LIMITED SUMMER AVAILABILITY",
  ctaTitle: "Don't Risk Sold-Out Florentine Museums",
  ctaSubtitle:
    "Uffizi and Accademia peak tickets sell out up to 3 weeks in advance. Reserve your priority time slot today with free cancellation protection.",
  ctaButtonText: "Check Live Availability",
  ctaButtonLink: "/experiences",
  ctaSecondaryButtonText: "Browse Day Trips",
  ctaSecondaryButtonLink: "/experiences/category/day-trips",
  ctaBackgroundImage: "/images/florence-hero.jpg",

  // 9. FAQ Section
  faqEnabled: true,
  faqBadge: "HELPFUL INFORMATION",
  faqTitle: "Frequently Asked Questions",
  faqSubtitle:
    "Everything you need to know about tickets, meeting points, dress codes, and cancellations.",
  faqItems: [
    { question: "How do I receive my tickets after booking?", answer: "Your official barcode vouchers are emailed instantly and accessible in your digital wallet or VACAY account dashboard. Simply show your phone screen at the priority entry line." },
    { question: "What is the cancellation policy?", answer: "You can cancel any standard experience up to 24 hours before the scheduled start time for a 100% full refund with zero processing fees." },
    { question: "Is there a dress code for Florentine churches like the Duomo?", answer: "Yes, shoulders and knees must be covered when entering the Santa Maria del Fiore Cathedral and crypts. Shawls and scarves are recommended." },
    { question: "Are audio headsets provided on guided tours?", answer: "Yes, all small-group tours include sanitized personal wireless headsets so you can hear your expert guide clearly without crowding." },
  ],

  // 10. SEO & Meta
  seoMetaTitle: "VACAY Florence — Skip-the-Line Tickets, Tours & Experiences",
  seoMetaDescription:
    "Book skip-the-line tickets, guided tours, and day trips in Florence with instant confirmation, free cancellation, and verified reviews.",
  seoCanonicalUrl: "/",
  seoOgImage: "/images/florence-hero.jpg",

  // 11. Popular Destinations (Landmark) cards
  landmarkItems: [
    { id: "duomo", name: "Santa Maria del Fiore (The Duomo)", tag: "Most Visited Monument", description: "Brunelleschi's red-tiled dome dominates the Florence skyline. Climb 463 steps to the lantern for 360° panoramic views.", image: "/images/experiences/duomo-facade.jpg", imageAlt: "The Duomo cathedral facade in Florence", href: "/experiences/duomo-and-brunelleschis-dome-climb", price: "From €45", rating: "4.9", reviews: "6,340", queueWithout: "3+ hours wait in sun", queueWithUs: "⚡ Instant Priority Entry" },
    { id: "uffizi", name: "Galleria degli Uffizi", tag: "World's Greatest Renaissance Art", description: "Home to Botticelli's 'Birth of Venus', Leonardo's 'Annunciation', Caravaggio, Raphael, and the Medici art collection.", image: "/images/experiences/uffizi-corridor-grand.jpg", imageAlt: "Uffizi Gallery grand corridor", href: "/experiences/uffizi-gallery-skip-the-line-ticket", price: "From €29", rating: "4.7", reviews: "12,480", queueWithout: "2.5 hours physical queue", queueWithUs: "⚡ Skip-The-Line Access" },
    { id: "accademia", name: "Galleria dell'Accademia (David)", tag: "Michelangelo's Masterpiece", description: "Gaze up at the 17-foot original marble statue of David, carved by 26-year-old Michelangelo from a single marble block.", image: "/images/experiences/accademia-david-tribune.jpg", imageAlt: "Michelangelo's David statue at the Accademia Gallery", href: "/experiences/accademia-gallery-michelangelos-david-ticket", price: "From €24", rating: "4.8", reviews: "9,210", queueWithout: "2 hours line at door", queueWithUs: "⚡ Timed Fast-Track Entry" },
    { id: "pitti", name: "Pitti Palace & Boboli Gardens", tag: "Grand Medici Residence", description: "Stroll the lush Renaissance gardens, Grotta Grande, and grand royal apartments across the Arno River.", image: "/images/pitti-palace.jpg", imageAlt: "Pitti Palace and Boboli Gardens", href: "/experiences/boboli-gardens-and-pitti-palace-entry", price: "From €22", rating: "4.5", reviews: "1,980", queueWithout: "1.5 hours wait at gate", queueWithUs: "⚡ Direct Mobile Entry" },
  ],

  // 12. Florence Itinerary Builder plans
  itineraryPlans: [
    {
      id: "1-day",
      title: "24 Hours: The Florence Express",
      subtitle: "See the absolute iconic highlights without wasting hours in lines.",
      badge: "⚡ Most Popular for Short Stays",
      pillLabel: "1 Day (Express)",
      steps: [
        { time: "08:30 AM", title: "Duomo & Brunelleschi's Dome Climb", description: "Beat the midday heat by climbing 463 steps to the cupola before the crowds arrive.", tag: "Priority Entry", href: "/experiences/duomo-and-brunelleschis-dome-climb", actionText: "Book Dome Ticket (€45)", image: "/images/duomo-tour.jpg" },
        { time: "12:00 PM", title: "Florentine Food Market & Fresh Pasta", description: "Head to San Lorenzo Market for authentic panino al lampredotto or fresh handmade pasta with Chianti.", tag: "Culinary Stop", href: "/experiences/florentine-cooking-class-with-market-visit", actionText: "Explore Cooking Class (€69)", image: "/images/italian-cooking.jpg" },
        { time: "02:30 PM", title: "Uffizi Gallery Fast-Track Tour", description: "Marvel at Botticelli's Birth of Venus and Renaissance masterpieces with zero queue time.", tag: "Skip The Line", href: "/experiences/uffizi-gallery-skip-the-line-ticket", actionText: "Book Uffizi Ticket (€29)", image: "/images/uffizi-corridor.jpg" },
        { time: "06:30 PM", title: "Sunset over Ponte Vecchio & Piazzale Michelangelo", description: "Watch the golden sun reflect over the Arno river with a glass of prosecco and artisan gelato.", tag: "Scenic Sunset", href: "/experiences/arno-river-sunset-bike-tour", actionText: "Sunset Bike Tour (€35)", image: "/images/ponte-vecchio.jpg" },
      ],
    },
    {
      id: "2-days",
      title: "48 Hours: The Classic Renaissance",
      subtitle: "The definitive Florence trip balancing art, food, palaces, and scenic views.",
      badge: "⭐ Recommended by Locals",
      pillLabel: "2 Days (Classic)",
      steps: [
        { time: "Day 1 - Morning", title: "Accademia Gallery & Michelangelo's David", description: "Stand under the grand skylight in front of the world's most famous statue of David.", tag: "Must See", href: "/experiences/accademia-gallery-michelangelos-david-ticket", actionText: "David Ticket (€24)", image: "/images/uffizi-corridor.jpg" },
        { time: "Day 1 - Afternoon", title: "Old Town Walking Tour & Hidden Alleys", description: "Discover Piazza della Signoria, Dante's Quarter, and Medici secrets with a native Florentine.", tag: "Local Guide", href: "/experiences/florence-old-town-walking-tour-with-local-guide", actionText: "Walking Tour (€32)", image: "/images/ponte-vecchio.jpg" },
        { time: "Day 2 - Morning", title: "Pitti Palace & Boboli Gardens Stroll", description: "Cross the Ponte Santa Trinita into Oltrarno to explore the monumental royal Medici gardens.", tag: "Royal Gardens", href: "/experiences/boboli-gardens-and-pitti-palace-entry", actionText: "Palace Ticket (€22)", image: "/images/pitti-palace.jpg" },
        { time: "Day 2 - Afternoon", title: "Afternoon Tuscan Wine Tasting & Dinner", description: "Indulge in a 3-course Tuscan tasting menu paired with Chianti Classico DOCG wines.", tag: "Wine & Dine", href: "/experiences/chianti-countryside-and-wine-tasting-day-trip", actionText: "Wine Tour (€89)", image: "/images/chianti-hills.jpg" },
      ],
    },
    {
      id: "3-days",
      title: "72 Hours: Florence & Tuscan Hills",
      subtitle: "Immersion in Florence's deep history followed by a day trip to medieval Tuscan hill towns.",
      badge: "🍷 The Ultimate Tuscan Escape",
      pillLabel: "3 Days (Tuscany Hills)",
      steps: [
        { time: "Days 1 & 2", title: "Complete Florence Art & Heritage Pass", description: "Cover the Duomo Dome, Uffizi Gallery, Accademia, and Oltrarno at a relaxed, luxurious pace.", tag: "City Highlights", href: "/experiences", actionText: "View City Passes", image: "/images/duomo-tour.jpg" },
        { time: "Day 3 - Full Day", title: "Tuscany Full-Day: San Gimignano, Siena & Pisa", description: "Ride through cypress-lined hills, explore medieval towers in San Gimignano, and visit the Leaning Tower of Pisa.", tag: "Full Day Trip", href: "/experiences/tuscany-full-day-tour-san-gimignano-siena-pisa", actionText: "Book Tuscany Tour (€79)", image: "/images/chianti-hills.jpg" },
      ],
    },
  ],

  // 13. Mobile Ticket / Digital Pass Showcase Section
  mobileEnabled: true,
  mobileBadge: "INSTANT DIGITAL WALLET VOUCHERS",
  mobileTitle: "No Printing. No Lines. Scan & Walk Right In.",
  mobileSubtitle: "Every booking instantly generates an official digital fast-pass for your Apple Wallet or Google Wallet. Simply hold your phone to the scanner at the monument gate and bypass hundreds waiting in line.",

  // 14. Travel Guide / Blog Teaser Section
  travelGuideEnabled: true,
  travelGuideBadge: "TRAVEL GUIDE & BLOG",
  travelGuideTitle: "Plan Your Perfect Florence Trip",
  travelGuideSubtitle: "Travel tips, city guides, hidden gems and more.",

  testimonialsRatingValue: "4.9 / 5.0",
  testimonialsRatingCount: "14,200+ Reviews",

  ctaPromoCode: "FLORENCE10",
};

/**
 * Ensures the homepage_content table exists in PostgreSQL.
 */
async function ensureHomepageTableExists() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "homepage_content" (
        "id" text PRIMARY KEY DEFAULT 'default',
        "hero_enabled" boolean NOT NULL DEFAULT true,
        "hero_badge" text NOT NULL DEFAULT 'OFFICIAL FLORENCE TICKETS & TOURS',
        "hero_heading" text NOT NULL DEFAULT 'Unforgettable Experiences in Florence',
        "hero_subheading" text NOT NULL DEFAULT 'Skip the 2-hour queues at the Duomo and Uffizi. Guaranteed entrance timeslots, expert local guides, and 100% free 24-hour cancellation.',
        "hero_primary_button_text" text NOT NULL DEFAULT 'Explore Experiences',
        "hero_primary_button_link" text NOT NULL DEFAULT '/experiences',
        "hero_secondary_button_text" text NOT NULL DEFAULT 'Today''s Availability',
        "hero_secondary_button_link" text NOT NULL DEFAULT '/experiences',
        "hero_background_image" text NOT NULL DEFAULT '/images/florence-hero.jpg',
        "hero_image_alt" text NOT NULL DEFAULT 'Florence cathedral panorama',
        "hero_video_url" text DEFAULT '/video/hero-florence.mp4',
        "hero_trending_tags" jsonb,
        "categories_enabled" boolean NOT NULL DEFAULT true,
        "categories_badge" text NOT NULL DEFAULT 'TOP CATEGORIES',
        "categories_title" text NOT NULL DEFAULT 'Explore Florence by Theme',
        "categories_subtitle" text NOT NULL DEFAULT 'Find skip-the-line museum admissions, walking tours, Tuscan day trips, and culinary masterclasses.',
        "categories_items" jsonb,
        "experiences_enabled" boolean NOT NULL DEFAULT true,
        "experiences_badge" text NOT NULL DEFAULT 'CURATED EXPERIENCES',
        "experiences_title" text NOT NULL DEFAULT 'Handcrafted Tours & Skip-The-Line Admissions',
        "experiences_subtitle" text NOT NULL DEFAULT 'Handcrafted tours and skip-the-line admissions chosen by local Florentines.',
        "experiences_items" jsonb,
        "landmark_enabled" boolean NOT NULL DEFAULT true,
        "landmark_badge" text NOT NULL DEFAULT 'FLORENTINE MONUMENTS',
        "landmark_title" text NOT NULL DEFAULT 'Four Must-Experience Monuments in Florence',
        "landmark_subtitle" text NOT NULL DEFAULT 'From the heights of Brunelleschi''s dome to Michelangelo''s David, discover the crown jewels of the Renaissance with reserved priority entry.',
        "itinerary_enabled" boolean NOT NULL DEFAULT true,
        "itinerary_badge" text NOT NULL DEFAULT 'VACATION PLANNER',
        "itinerary_title" text NOT NULL DEFAULT 'Build Your Florence Day-by-Day',
        "itinerary_subtitle" text NOT NULL DEFAULT 'Select your trip length and travel style to see curated morning, afternoon, and evening recommendations.',
        "why_us_enabled" boolean NOT NULL DEFAULT true,
        "why_us_badge" text NOT NULL DEFAULT 'THE VACAY FLORENCE DIFFERENCE',
        "why_us_title" text NOT NULL DEFAULT 'Why Travelers Choose VACAY Over the Ticket Box Office',
        "why_us_subtitle" text NOT NULL DEFAULT 'Skip the stress, bypass the lines, and enjoy guaranteed entry to Florence''s world-renowned museums and sights.',
        "why_us_comparison_rows" jsonb,
        "why_us_stats" jsonb,
        "why_us_cta_text" text NOT NULL DEFAULT 'Browse All Fast-Pass Tickets',
        "why_us_cta_link" text NOT NULL DEFAULT '/experiences',
        "testimonials_enabled" boolean NOT NULL DEFAULT true,
        "testimonials_badge" text NOT NULL DEFAULT 'VERIFIED TRAVELER FEEDBACK',
        "testimonials_title" text NOT NULL DEFAULT 'Loved by Over 45,000 Visitors',
        "testimonials_subtitle" text NOT NULL DEFAULT 'Read candid reviews from culture lovers, families, and solo explorers who discovered Florence through VACAY.',
        "testimonials_items" jsonb,
        "cta_enabled" boolean NOT NULL DEFAULT true,
        "cta_badge" text NOT NULL DEFAULT 'LIMITED SUMMER AVAILABILITY',
        "cta_title" text NOT NULL DEFAULT 'Don''t Risk Sold-Out Florentine Museums',
        "cta_subtitle" text NOT NULL DEFAULT 'Uffizi and Accademia peak tickets sell out up to 3 weeks in advance. Reserve your priority time slot today with free cancellation protection.',
        "cta_button_text" text NOT NULL DEFAULT 'Check Live Availability',
        "cta_button_link" text NOT NULL DEFAULT '/experiences',
        "cta_secondary_button_text" text NOT NULL DEFAULT 'Browse Day Trips',
        "cta_secondary_button_link" text NOT NULL DEFAULT '/experiences/category/day-trips',
        "cta_background_image" text NOT NULL DEFAULT '/images/florence-hero.jpg',
        "faq_enabled" boolean NOT NULL DEFAULT true,
        "faq_badge" text NOT NULL DEFAULT 'HELPFUL INFORMATION',
        "faq_title" text NOT NULL DEFAULT 'Frequently Asked Questions',
        "faq_subtitle" text NOT NULL DEFAULT 'Everything you need to know about tickets, meeting points, dress codes, and cancellations.',
        "faq_items" jsonb,
        "seo_meta_title" text NOT NULL DEFAULT 'VACAY Florence — Skip-the-Line Tickets, Tours & Experiences',
        "seo_meta_description" text NOT NULL DEFAULT 'Book skip-the-line tickets, guided tours, and day trips in Florence with instant confirmation, free cancellation, and verified reviews.',
        "seo_canonical_url" text NOT NULL DEFAULT '/',
        "seo_og_image" text NOT NULL DEFAULT '/images/florence-hero.jpg',
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
  } catch (err) {
    console.error("Error creating homepage_content table:", err);
  }

  // Additive column migration: the table above may already exist in the
  // live database from before these columns were added. CREATE TABLE IF
  // NOT EXISTS is a no-op in that case, so backfill any missing columns
  // here — idempotent, safe to run on every call (cheap on Postgres when
  // the columns already exist).
  try {
    await db.execute(sql`
      ALTER TABLE "homepage_content"
        ADD COLUMN IF NOT EXISTS "landmark_items" jsonb,
        ADD COLUMN IF NOT EXISTS "itinerary_plans" jsonb,
        ADD COLUMN IF NOT EXISTS "mobile_enabled" boolean NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS "mobile_badge" text NOT NULL DEFAULT 'INSTANT DIGITAL WALLET VOUCHERS',
        ADD COLUMN IF NOT EXISTS "mobile_title" text NOT NULL DEFAULT 'No Printing. No Lines. Scan & Walk Right In.',
        ADD COLUMN IF NOT EXISTS "mobile_subtitle" text NOT NULL DEFAULT 'Every booking instantly generates an official digital fast-pass for your Apple Wallet or Google Wallet. Simply hold your phone to the scanner at the monument gate and bypass hundreds waiting in line.',
        ADD COLUMN IF NOT EXISTS "travel_guide_enabled" boolean NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS "travel_guide_badge" text NOT NULL DEFAULT 'TRAVEL GUIDE & BLOG',
        ADD COLUMN IF NOT EXISTS "travel_guide_title" text NOT NULL DEFAULT 'Plan Your Perfect Florence Trip',
        ADD COLUMN IF NOT EXISTS "travel_guide_subtitle" text NOT NULL DEFAULT 'Travel tips, city guides, hidden gems and more.',
        ADD COLUMN IF NOT EXISTS "testimonials_rating_value" text NOT NULL DEFAULT '4.9 / 5.0',
        ADD COLUMN IF NOT EXISTS "testimonials_rating_count" text NOT NULL DEFAULT '14,200+ Reviews',
        ADD COLUMN IF NOT EXISTS "cta_promo_code" text NOT NULL DEFAULT 'FLORENCE10',
        ADD COLUMN IF NOT EXISTS "categories_limit" integer NOT NULL DEFAULT 6;
    `);
  } catch (err) {
    console.error("Error migrating homepage_content columns:", err);
  }
}

/**
 * Retrieves the current homepage content from the database.
 * Auto-creates the default record if not yet seeded.
 */
export async function getHomepageContent(): Promise<HomepageContentData> {
  await ensureHomepageTableExists();

  try {
    const rows = await db
      .select()
      .from(homepageContent)
      .where(eq(homepageContent.id, "default"))
      .limit(1);

    if (rows.length > 0 && rows[0]) {
      // Backfill ONLY the handful of jsonb array columns that were added
      // in a later migration with no SQL-level default (so a row saved
      // before they existed has them as null) — this makes the admin
      // editor show the same curated content that's actually rendering on
      // the public page (which falls back to the same defaults) instead
      // of an empty tab. Deliberately narrow: every OTHER nullable array
      // field (faqItems, testimonialsItems, heroTrendingTags, etc.) is
      // left exactly as stored, because an admin may have intentionally
      // emptied one of those — backfilling those would silently resurrect
      // deleted content on every read.
      const row = rows[0];
      const NEW_JSON_COLUMNS_NEEDING_BACKFILL = ["landmarkItems", "itineraryPlans"] as const;
      const merged: HomepageContentData = { ...row };
      for (const key of NEW_JSON_COLUMNS_NEEDING_BACKFILL) {
        if (merged[key] === null || merged[key] === undefined) {
          (merged as Record<string, unknown>)[key] = DEFAULT_HOMEPAGE_CONTENT[key];
        }
      }
      return merged;
    }

    // Auto-seed default row
    const [created] = await db
      .insert(homepageContent)
      .values(DEFAULT_HOMEPAGE_CONTENT)
      .returning();

    return created ?? (DEFAULT_HOMEPAGE_CONTENT as HomepageContentData);
  } catch (error) {
    console.error("Failed to read homepage_content from DB, returning defaults:", error);
    return DEFAULT_HOMEPAGE_CONTENT as HomepageContentData;
  }
}

/**
 * Updates homepage content in database and invalidates Next.js cache.
 */
export async function updateHomepageContent(
  updates: Partial<HomepageContentInsert>,
  actorUserId?: string | null
): Promise<{ success: boolean; data?: HomepageContentData; error?: string }> {
  await ensureHomepageTableExists();

  try {
    const existing = await getHomepageContent();

    const [updated] = await db
      .insert(homepageContent)
      .values({
        ...DEFAULT_HOMEPAGE_CONTENT,
        ...existing,
        ...updates,
        id: "default",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: homepageContent.id,
        set: {
          ...updates,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (actorUserId) {
      await logAudit({
        actorUserId,
        action: "homepage.update",
        entityType: "page",
        entityId: "homepage",
        before: existing as unknown as Record<string, unknown>,
        after: updated as unknown as Record<string, unknown>,
      });
    }

    // Revalidate public homepage cache so changes appear immediately
    revalidatePath("/");
    revalidatePath("/admin/content/homepage");

    return { success: true, data: updated };
  } catch (err) {
    console.error("Failed to update homepage_content:", err);
    return { success: false, error: (err as Error).message || "Database update failed" };
  }
}
