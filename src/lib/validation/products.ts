import { z } from "zod";

/**
 * Admin Experience Editor form schema. Mirrors the `products` table
 * (src/lib/db/schema.ts) field-for-field — every editable public field
 * has a home here, and nothing here is admin-only/fake. Nested arrays
 * (images/options) map to product_images/product_options rows.
 */

const nonEmpty = (label: string) => z.string().trim().min(1, `${label} is required.`);

export const productImageSchema = z.object({
  url: z.string().trim().min(1, "Image URL is required."),
  alt: z.string().trim().min(1, "Alt text is required for every image."),
});

export const productOptionSchema = z.object({
  id: z.string().optional(), // present when editing an existing option row
  name: nonEmpty("Option name"),
  description: z.string().trim().optional().or(z.literal("")),
  priceAmount: z.coerce.number().min(0, "Price must be zero or more."),
  priceCurrency: z.string().trim().min(1).default("EUR"),
  isActive: z.boolean().default(true),
  // Feature checklist for this tier, used by the public "Comprehensive
  // Ticket Comparison Table" section.
  features: z.array(z.string().trim().min(1)).default([]),
});

// New content-section sub-schemas (2026 build) — kept as small named
// objects rather than inlined so the admin editor can reuse each shape.
export const itineraryStepSchema = z.object({
  time: z.string().trim().default(""),
  title: nonEmpty("Step title"),
  description: z.string().trim().default(""),
});
export const namedPointSchema = z.object({
  name: nonEmpty("Name"),
  description: z.string().trim().default(""),
});
export const openingHoursRowSchema = z.object({
  day: nonEmpty("Day"),
  hours: nonEmpty("Hours"),
});
export const gettingThereOptionSchema = z.object({
  mode: nonEmpty("Transport mode"),
  description: z.string().trim().default(""),
});
export const faqItemSchema = z.object({
  question: nonEmpty("Question"),
  answer: nonEmpty("Answer"),
});

export const productFormSchema = z.object({
  // Basics
  title: nonEmpty("Title").max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only."),
  shortDescription: nonEmpty("Short description").max(300),
  description: nonEmpty("Description"),
  categoryId: nonEmpty("Category"),
  supplierId: nonEmpty("Supplier"),
  durationLabel: nonEmpty("Duration"),
  badges: z.array(z.string().trim().min(1)).default([]),

  // Status
  status: z.enum(["draft", "pending_review", "live", "paused", "rejected", "changes_requested"]).default("draft"),
  featured: z.boolean().default(false),
  featuredRank: z.coerce.number().int().nullable().optional(),

  // Content
  highlights: z.array(z.string().trim().min(1)).default([]),
  inclusions: z.array(z.string().trim().min(1)).default([]),
  exclusions: z.array(z.string().trim().min(1)).default([]),
  goodToKnow: z.array(z.string().trim().min(1)).default([]),
  cancellationPolicy: nonEmpty("Cancellation policy"),

  // New public-page content sections (2026 build) — see
  // src/lib/db/schema.ts `products` table for the field-by-field
  // rationale. All optional/defaulted; the public page only renders a
  // section once it has real content.
  whyVisit: z.string().trim().nullable().optional(),
  itinerary: z.array(itineraryStepSchema).default([]),
  secretHistoryPoints: z.array(z.string().trim().min(1)).default([]),
  entrances: z.array(namedPointSchema).default([]),
  ultimateExperienceTitle: z.string().trim().nullable().optional(),
  ultimateExperienceDescription: z.string().trim().nullable().optional(),
  ultimateExperiencePoints: z.array(z.string().trim().min(1)).default([]),
  openingHours: z.array(openingHoursRowSchema).default([]),
  operationalInfo: z.string().trim().nullable().optional(),
  gettingThereOptions: z.array(gettingThereOptionSchema).default([]),
  bestTimeToVisit: z.string().trim().nullable().optional(),
  bestTimeToVisitTips: z.array(z.string().trim().min(1)).default([]),
  faqs: z.array(faqItemSchema).default([]),
  relatedBlogSlugs: z.array(z.string().trim().min(1)).default([]),
  ctaHeadline: z.string().trim().nullable().optional(),
  ctaSubtext: z.string().trim().nullable().optional(),

  // Location
  meetingPoint: z.string().trim().nullable().optional(),
  meetingCity: z.string().trim().nullable().optional(),
  meetingCountry: z.string().trim().nullable().optional(),

  // Pricing & options
  priceFromAmount: z.coerce.number().min(0, "Price must be zero or more."),
  priceFromCurrency: z.string().trim().min(1).default("EUR"),
  options: z.array(productOptionSchema).default([]),

  // Media
  images: z.array(productImageSchema).default([]),
  videoUrl: z.string().trim().nullable().optional(),

  // Booking time slots (e.g. "09:00 AM") shown on the public booking
  // card. Empty is valid — the card falls back to a default schedule.
  timeSlots: z.array(z.string().trim().min(1)).default([]),

  // SEO
  metaTitle: z.string().trim().max(70).nullable().optional(),
  metaDescription: z.string().trim().max(200).nullable().optional(),
  canonicalUrl: z.string().trim().nullable().optional(),
  ogImage: z.string().trim().nullable().optional(),
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
});

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormData = z.infer<typeof productFormSchema>;

export const availabilityGenerateSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(90),
  capacityTotal: z.coerce.number().int().min(1).max(9999).default(20),
});
