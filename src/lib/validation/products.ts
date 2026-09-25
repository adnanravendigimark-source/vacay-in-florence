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
  status: z.enum(["draft", "pending_review", "live", "paused"]).default("draft"),
  featured: z.boolean().default(false),
  featuredRank: z.coerce.number().int().nullable().optional(),

  // Content
  highlights: z.array(z.string().trim().min(1)).default([]),
  inclusions: z.array(z.string().trim().min(1)).default([]),
  exclusions: z.array(z.string().trim().min(1)).default([]),
  cancellationPolicy: nonEmpty("Cancellation policy"),

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
