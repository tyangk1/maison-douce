import { describe, expect, it, vi } from "vitest";

// Integration-style tests for the pricing engine against the real schema
// helpers, with the database layer mocked.

const mockDb = vi.hoisted(() => ({
  product: { findMany: vi.fn() },
  promotion: { findUnique: vi.fn() },
}));

vi.mock("../src/lib/db", () => ({ db: mockDb }));

import { priceCart, computeDiscount } from "../src/lib/cart-pricing";

function promo(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "p1",
    code: "WELCOME10",
    title: "Welcome",
    description: "",
    type: "PERCENT",
    value: 10,
    minSubtotalCents: 1500,
    active: true,
    startsAt: null,
    endsAt: null,
    createdAt: new Date(),
    ...overrides,
  } as never;
}

describe("priceCart", () => {
  it("prices lines from database truth and ignores client prices", async () => {
    mockDb.product.findMany.mockResolvedValue([
      {
        id: "a1", name: "Butter Croissant", slug: "butter-croissant", priceCents: 380,
        status: "ACTIVE", inventory: { quantity: 10 },
        images: [{ url: "img" }],
      },
    ]);
    mockDb.promotion.findUnique.mockResolvedValue(null);

    const result = await priceCart([
      { productId: "a1", quantity: 3 },
      { productId: "ghost", quantity: 2 }, // not in DB — dropped with an issue
    ]);

    expect(result.lines).toHaveLength(1);
    expect(result.subtotalCents).toBe(1140);
    expect(result.deliveryCents).toBe(495);
    expect(result.totalCents).toBe(1635);
    expect(result.issues).toHaveLength(1);
  });

  it("clamps quantity to available stock and flags it", async () => {
    mockDb.product.findMany.mockResolvedValue([
      { id: "a1", name: "Loaf", slug: "loaf", priceCents: 650, status: "ACTIVE", inventory: { quantity: 2 }, images: [] },
    ]);
    mockDb.promotion.findUnique.mockResolvedValue(null);

    const result = await priceCart([{ productId: "a1", quantity: 8 }]);
    expect(result.lines[0].quantity).toBe(2);
    expect(result.issues.join(" ")).toContain("Only 2");
  });

  it("drops sold-out items entirely", async () => {
    mockDb.product.findMany.mockResolvedValue([
      { id: "a1", name: "Fougasse", slug: "fougasse", priceCents: 560, status: "ACTIVE", inventory: { quantity: 0 }, images: [] },
    ]);
    mockDb.promotion.findUnique.mockResolvedValue(null);

    const result = await priceCart([{ productId: "a1", quantity: 1 }]);
    expect(result.lines).toHaveLength(0);
    expect(result.totalCents).toBe(0);
  });

  it("applies a valid percentage promotion", async () => {
    mockDb.product.findMany.mockResolvedValue([
      { id: "a1", name: "Box", slug: "box", priceCents: 4200, status: "ACTIVE", inventory: { quantity: 5 }, images: [] },
    ]);
    mockDb.promotion.findUnique.mockResolvedValue(promo());

    const result = await priceCart([{ productId: "a1", quantity: 1 }], "welcome10");
    expect(result.discountCents).toBe(420);
    expect(result.promotion?.code).toBe("WELCOME10");
    // subtotal 4200 < free-delivery threshold, so £4.95 delivery applies.
    expect(result.totalCents).toBe(4200 - 420 + 495);
  });

  it("skips promotions below their minimum spend", async () => {
    mockDb.product.findMany.mockResolvedValue([
      { id: "a1", name: "Croissant", slug: "croissant", priceCents: 380, status: "ACTIVE", inventory: { quantity: 5 }, images: [] },
    ]);
    mockDb.promotion.findUnique.mockResolvedValue(promo());

    const result = await priceCart([{ productId: "a1", quantity: 1 }], "WELCOME10");
    expect(result.discountCents).toBe(0);
    expect(result.issues.join(" ")).toContain("minimum spend");
  });

  it("applies server-side variant price deltas and ignores unknown variant ids", async () => {
    mockDb.product.findMany.mockResolvedValue([
      {
        id: "a1", name: "Sourdough", slug: "sourdough", priceCents: 650, status: "ACTIVE",
        inventory: { quantity: 5 }, images: [],
        variants: [
          { id: "v1", name: "Whole loaf", priceDeltaCents: 0 },
          { id: "v2", name: "Half loaf", priceDeltaCents: -250 },
        ],
      },
    ]);
    mockDb.promotion.findUnique.mockResolvedValue(null);

    const half = await priceCart([{ productId: "a1", quantity: 1, variantId: "v2" }]);
    expect(half.lines[0].unitCents).toBe(400);
    expect(half.lines[0].variantName).toBe("Half loaf");

    const forged = await priceCart([{ productId: "a1", quantity: 1, variantId: "forged-id" }]);
    expect(forged.lines[0].unitCents).toBe(650); // falls back to base price
    expect(forged.lines[0].variantName).toBeNull();
  });

  it("pickup orders carry no delivery fee", async () => {
    mockDb.product.findMany.mockResolvedValue([
      { id: "a1", name: "Cookie box", slug: "cookies", priceCents: 1250, status: "ACTIVE", inventory: { quantity: 5 }, images: [] },
    ]);
    mockDb.promotion.findUnique.mockResolvedValue(null);

    const result = await priceCart([{ productId: "a1", quantity: 1 }], undefined, "PICKUP");
    expect(result.deliveryCents).toBe(0);
  });
});

describe("computeDiscount", () => {
  it.each([
    ["PERCENT", 10, 2000, 1500, 200],
    ["FIXED", 500, 2000, 1000, 500],
    ["FIXED", 90000, 2000, 0, 2000], // never exceeds subtotal
  ])("%s %s on subtotal %s (min %s) → %s", (type, value, subtotal, min, expected) => {
    expect(computeDiscount(promo({ type, value, minSubtotalCents: min }), subtotal)).toBe(expected);
  });
});
