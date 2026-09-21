import { z } from "zod";

const base = {
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
};

export const contactFormSchema = z.object(base);

export const supplierApplicationSchema = z.object({
  ...base,
  company: z.string().trim().min(2, "Enter your business name.").max(150),
  website: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  experienceType: z.string().trim().min(2, "Describe what you'd like to list.").max(300),
});

export const affiliateApplicationSchema = z.object({
  ...base,
  company: z.string().trim().max(150).optional().or(z.literal("")),
  website: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  audienceSize: z.string().trim().max(120).optional().or(z.literal("")),
});

export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type SupplierApplicationInput = z.infer<typeof supplierApplicationSchema>;
export type AffiliateApplicationInput = z.infer<typeof affiliateApplicationSchema>;
export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
