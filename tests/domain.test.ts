import { describe, expect, it } from "vitest";
import { formatPrice, deliveryFeeFor, DELIVERY_FEE_CENTS, FREE_DELIVERY_THRESHOLD_CENTS } from "../src/lib/money";
import { slugify, generateOrderNumber } from "../src/lib/utils";
import { registerSchema, checkoutSchema, productInputSchema, promotionInputSchema, passwordSchema } from "../src/lib/validation";

describe("money", () => {
  it("formats pence as GBP", () => {
    expect(formatPrice(380)).toBe("£3.80");
    expect(formatPrice(0)).toBe("£0.00");
    expect(formatPrice(123456)).toBe("£1,234.56");
  });

  it("waives delivery over the free threshold", () => {
    expect(deliveryFeeFor(FREE_DELIVERY_THRESHOLD_CENTS)).toBe(0);
    expect(deliveryFeeFor(FREE_DELIVERY_THRESHOLD_CENTS - 1)).toBe(DELIVERY_FEE_CENTS);
    expect(deliveryFeeFor(0)).toBe(0);
  });
});

describe("utils", () => {
  it("slugifies names", () => {
    expect(slugify("Burnt Basque Cheesecake")).toBe("burnt-basque-cheesecake");
    expect(slugify("  Pain au Chocolat! ")).toBe("pain-au-chocolat");
  });

  it("generates prefixed order numbers", () => {
    const n = generateOrderNumber();
    expect(n).toMatch(/^MD-[A-Z0-9]{8,9}$/);
  });
});

describe("validation", () => {
  it("rejects weak passwords", () => {
    expect(passwordSchema.safeParse("short").success).toBe(false);
    expect(passwordSchema.safeParse("alllettersonly").success).toBe(false);
    expect(passwordSchema.safeParse("GoodPass1").success).toBe(true);
  });

  it("requires delivery address only for delivery fulfilment", () => {
    const base = { email: "a@b.com", customerName: "Test Person", phone: "+44123456789", paymentMethod: "mock_card" as const };
    const delivery = checkoutSchema.safeParse({ ...base, fulfilment: "DELIVERY" });
    expect(delivery.success).toBe(false);

    const pickup = checkoutSchema.safeParse({ ...base, fulfilment: "PICKUP" });
    expect(pickup.success).toBe(true);

    const full = checkoutSchema.safeParse({
      ...base,
      fulfilment: "DELIVERY",
      addressLine1: "1 Street",
      city: "London",
      postcode: "WC1",
    });
    expect(full.success).toBe(true);
  });

  it("caps percentage promotions at 90", () => {
    expect(promotionInputSchema.safeParse({ code: "BIG", title: "Too big", type: "PERCENT", value: 95 }).success).toBe(false);
    expect(promotionInputSchema.safeParse({ code: "OKAY", title: "Fine", type: "PERCENT", value: 20 }).success).toBe(true);
  });

  it("requires product images and sane prices", () => {
    const base = {
      name: "Test Bun",
      shortDescription: "A delicious test bun for validation.",
      description: "A longer description of the test bun that definitely exceeds twenty characters.",
      priceCents: 500,
      categoryId: "cat_1",
      images: [{ url: "https://images.unsplash.com/photo-1" }],
      inventory: { quantity: 5 },
    };
    expect(productInputSchema.safeParse(base).success).toBe(true);
    expect(productInputSchema.safeParse({ ...base, images: [] }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...base, priceCents: 10 }).success).toBe(false);
  });

  it("normalises registration emails", () => {
    const r = registerSchema.parse({ name: "Elena Marsh", email: "  Elena@Example.COM ", password: "GoodPass1" });
    expect(r.email).toBe("elena@example.com");
  });
});
