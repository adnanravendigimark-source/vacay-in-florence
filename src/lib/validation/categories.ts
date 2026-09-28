import { z } from "zod";

/**
 * Admin Category Editor form schema. Mirrors the `categories` table
 * (src/lib/db/schema.ts) field-for-field — every editable public field
 * has a home here, and nothing here is admin-only/fake.
 */

const nonEmpty = (label: string) => z.string().trim().min(1, `${label} is required.`);

export const categoryIconSchema = z.enum(["landmark", "museum", "tour-guide", "food-wine", "day-trip", "outdoor"]);

export const categoryFormSchema = z.object({
  // Basics
  name: nonEmpty("Name").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only."),
  shortDescription: nonEmpty("Description").max(300),
  icon: categoryIconSchema,

  // Status & ordering
  status: z.enum(["draft", "published"]).default("published"),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),

  // Content — highlights capped at 6, matching the card's display limit
  highlights: z.array(z.string().trim().min(1)).max(6).default([]),
  badgeText: z.string().trim().max(40).nullable().optional(),
  ctaLabel: z.string().trim().max(40).nullable().optional(),
  ctaHref: z.string().trim().nullable().optional(),

  // Media
  imageUrl: nonEmpty("Card image URL"),
  imageAlt: nonEmpty("Card image alt text"),
  heroImageUrl: z.string().trim().nullable().optional(),
  heroImageAlt: z.string().trim().nullable().optional(),

  // SEO
  metaTitle: z.string().trim().max(70).nullable().optional(),
  metaDescription: z.string().trim().max(200).nullable().optional(),
  canonicalUrl: z.string().trim().nullable().optional(),
  ogImage: z.string().trim().nullable().optional(),
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
});

export type CategoryFormInput = z.input<typeof categoryFormSchema>;
export type CategoryFormData = z.infer<typeof categoryFormSchema>;
