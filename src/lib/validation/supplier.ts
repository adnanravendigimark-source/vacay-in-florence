import { z } from "zod";

export const supplierRegisterSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(100),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters.").max(72, "Password is too long."),
    confirmPassword: z.string(),
    companyName: z.string().trim().min(2, "Enter your company or business name.").max(200),
    businessType: z
      .string()
      .trim()
      .max(100)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
    registrationNumber: z
      .string()
      .trim()
      .max(100)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
    businessAddress: z
      .string()
      .trim()
      .max(300)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
    city: z
      .string()
      .trim()
      .max(100)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
    postalCode: z
      .string()
      .trim()
      .max(40)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
    contactPhone: z
      .string()
      .trim()
      .max(40)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
    website: z
      .string()
      .trim()
      .max(300)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
    country: z
      .string()
      .trim()
      .max(100)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
    about: z
      .string()
      .trim()
      .max(4000)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
    documentName: z
      .string()
      .trim()
      .max(300)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
    documentUrl: z
      .string()
      .trim()
      .url("The uploaded document link looks invalid.")
      .max(2000)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export type SupplierRegisterInput = z.infer<typeof supplierRegisterSchema>;

export const supplierProfileSchema = z.object({
  name: z.string().trim().min(2, "Enter your company or business name.").max(200),
  contactName: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  contactEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  contactPhone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  website: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  country: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  logoUrl: z
    .string()
    .trim()
    .url("Enter a valid image URL.")
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  about: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
});

export type SupplierProfileInput = z.infer<typeof supplierProfileSchema>;
