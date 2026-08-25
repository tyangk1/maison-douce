import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100)
  .regex(/[a-zA-Z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(24).optional().or(z.literal("")),
});

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
});

export const checkoutSchema = z
  .object({
    email: emailSchema,
    customerName: z.string().trim().min(2, "Full name is required").max(80),
    phone: z.string().trim().min(6, "Phone number is required").max(24),
    fulfilment: z.enum(["DELIVERY", "PICKUP"]),
    addressLine1: z.string().trim().max(160).optional(),
    addressLine2: z.string().trim().max(160).optional(),
    city: z.string().trim().max(80).optional(),
    postcode: z.string().trim().max(12).optional(),
    notes: z.string().trim().max(500).optional(),
    promoCode: z.string().trim().max(32).optional(),
    paymentMethod: z.enum(["mock_card"]),
    mockCardNumber: z.string().trim().min(12).max(24).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.fulfilment === "DELIVERY") {
      if (!val.addressLine1) ctx.addIssue({ code: "custom", path: ["addressLine1"], message: "Address line 1 is required" });
      if (!val.city) ctx.addIssue({ code: "custom", path: ["city"], message: "City is required" });
      if (!val.postcode) ctx.addIssue({ code: "custom", path: ["postcode"], message: "Postcode is required" });
    }
  });

export const newsletterSchema = z.object({
  email: emailSchema,
  source: z.string().max(40).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10, "Message is too short").max(2000),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(140).optional(),
  shortDescription: z.string().trim().min(10).max(220),
  description: z.string().trim().min(20).max(4000),
  priceCents: z.number().int().min(50).max(500000),
  compareAtCents: z.number().int().min(0).max(500000).nullable().optional(),
  categoryId: z.string().min(1),
  ingredients: z.string().trim().max(1000).default(""),
  allergens: z.string().trim().max(500).default(""),
  tags: z.string().trim().max(300).default(""),
  isFeatured: z.boolean().default(false),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().max(200).default("") })).min(1, "At least one image"),
  inventory: z.object({
    quantity: z.number().int().min(0).max(10000),
    lowStockAt: z.number().int().min(0).max(1000).default(5),
  }),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().max(80).optional(),
  description: z.string().trim().max(400).default(""),
  image: z.string().url().nullable().optional(),
  sortOrder: z.number().int().min(0).max(999).default(0),
});

export const orderStatusValues = [
  "PENDING",
  "PAID",
  "BAKING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
] as const;

export const orderUpdateSchema = z.object({
  status: z.enum(orderStatusValues),
});

export const promotionInputSchema = z
  .object({
    code: z.string().trim().min(3).max(32).transform((v) => v.toUpperCase()),
    title: z.string().trim().min(2).max(80),
    description: z.string().trim().max(300).default(""),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.number().int().min(1),
    minSubtotalCents: z.number().int().min(0).default(0),
    active: z.boolean().default(true),
    endsAt: z.string().datetime().nullable().optional(),
  })
  .refine((v) => v.type !== "PERCENT" || v.value <= 90, {
    message: "Percentage discount cannot exceed 90%",
    path: ["value"],
  });

export const settingsInputSchema = z.record(z.string(), z.unknown());

export function formatZodIssues(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
