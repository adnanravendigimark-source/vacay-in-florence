import { z } from "zod";
import type { LeadFormFieldConfig } from "@/lib/types";

const base = {
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
};

export const contactFormSchema = z.object(base);

// company/experienceType are shape-validated here (max length) but NOT
// required at this layer — whether they're actually mandatory is decided
// per-submission by the admin-configurable field list (see
// src/app/(public)/become-a-supplier/actions.ts, which enforces
// "required" dynamically from that config against whichever fields are
// still marked required there). Keeping them optional here just means
// this schema can't block a submission the live field config allows.
export const supplierApplicationSchema = z.object({
  ...base,
  company: z.string().trim().max(150).optional().or(z.literal("")),
  website: z.string().trim().url("Enter a valid URL.").optional().or(z.literal("")),
  experienceType: z.string().trim().max(300).optional().or(z.literal("")),
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

/**
 * Enforces "required" for the Supplier/Affiliate application forms
 * dynamically, from the admin-configurable field list, rather than a
 * fixed zod shape — so toggling a field required/optional in Admin
 * actually changes what the server accepts, not just what the form
 * displays. A field the admin has hidden (`visible: false`) is skipped
 * entirely: it wasn't rendered, so nothing to require. Returns the
 * first missing field's configured label as an error message, or null
 * if everything required is present.
 */
export function checkRequiredLeadFields(
  fields: LeadFormFieldConfig[],
  values: Record<string, string>,
): string | null {
  for (const field of fields) {
    if (!field.visible || !field.required) continue;
    if (!values[field.id]?.trim()) {
      return `${field.label.replace(/\s*\(optional\)\s*$/i, "")} is required.`;
    }
  }
  return null;
}
