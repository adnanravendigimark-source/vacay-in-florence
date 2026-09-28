import { z } from "zod";

/**
 * Admin Blog Editor form schema. Mirrors the `blog_posts` table
 * (src/lib/db/schema.ts) field-for-field. `status` + `publishDate` are a
 * form-only pair — there's no `status` column — the admin data layer
 * (src/lib/data/admin/blog.ts) compiles them into the single
 * `publishedAt` timestamp column the public site already reads: NULL
 * (or a future date) means unpublished, same convention
 * src/lib/data/blog.ts's `published()` filter already uses.
 */

const nonEmpty = (label: string) => z.string().trim().min(1, `${label} is required.`);

export const blogPostFormSchema = z.object({
  // Basics
  title: nonEmpty("Title").max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only."),
  excerpt: nonEmpty("Excerpt").max(300),
  category: nonEmpty("Category").max(60),
  tags: z.array(z.string().trim().min(1)).max(12).default([]),
  author: nonEmpty("Author").max(120),

  // Status & publish date — see file docblock
  status: z.enum(["draft", "published"]).default("draft"),
  publishDate: z.string().trim().min(1, "Publish date is required."),

  // Content
  quickAnswer: z.string().trim().max(400).default(""),
  body: z.string().trim().min(1, "Article content can't be empty."),

  // Media
  coverImageUrl: nonEmpty("Featured image URL"),
  coverImageAlt: nonEmpty("Featured image alt text"),

  // SEO
  metaTitle: z.string().trim().max(70).nullable().optional(),
  metaDescription: z.string().trim().max(200).nullable().optional(),
  canonicalUrl: z.string().trim().nullable().optional(),
  ogImage: z.string().trim().nullable().optional(),
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),

  // Bottom-of-article CTA
  ctaHeading: nonEmpty("CTA heading").max(120),
  ctaBody: nonEmpty("CTA body").max(300),
  ctaButtonText: nonEmpty("CTA button text").max(60),
  ctaButtonHref: nonEmpty("CTA button link"),
});

export type BlogPostFormInput = z.input<typeof blogPostFormSchema>;
export type BlogPostFormData = z.infer<typeof blogPostFormSchema>;
