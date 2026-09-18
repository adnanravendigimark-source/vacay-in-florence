import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date."),
  participants: z
    .array(
      z.object({
        optionId: z.string().min(1),
        quantity: z.number().int().min(0).max(30),
      }),
    )
    .min(1, "Select at least one option."),
});

export const checkoutDetailsSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name.").max(150),
  customerEmail: z.string().trim().toLowerCase().email("Enter a valid email address."),
  customerPhone: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type CheckoutDetailsInput = z.infer<typeof checkoutDetailsSchema>;
