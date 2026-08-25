import { db } from "./db";
import { deliveryFeeFor } from "./money";
import type { Promotion } from "@prisma/client";

export type PricedLine = {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  unitCents: number;
  quantity: number;
  lineCents: number;
  available: boolean;
  stockQuantity: number;
};

export type PricedCart = {
  lines: PricedLine[];
  subtotalCents: number;
  deliveryCents: number;
  discountCents: number;
  totalCents: number;
  promotion: { code: string; title: string } | null;
  issues: string[];
};

export function computeDiscount(promotion: Promotion, subtotalCents: number): number {
  if (subtotalCents < promotion.minSubtotalCents) return 0;
  const raw =
    promotion.type === "PERCENT"
      ? Math.round((subtotalCents * promotion.value) / 100)
      : Math.min(promotion.value, subtotalCents);
  return Math.min(raw, subtotalCents);
}

export async function findActivePromotion(code?: string): Promise<Promotion | null> {
  if (!code) return null;
  const promo = await db.promotion.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!promo || !promo.active) return null;
  const now = new Date();
  if (promo.startsAt && promo.startsAt > now) return null;
  if (promo.endsAt && promo.endsAt < now) return null;
  return promo;
}

/**
 * Re-prices a cart entirely from database truth. Client prices are never trusted.
 */
export async function priceCart(
  lines: { productId: string; quantity: number }[],
  promoCode?: string,
  fulfilment: "DELIVERY" | "PICKUP" = "DELIVERY"
): Promise<PricedCart> {
  const ids = [...new Set(lines.map((l) => l.productId))];
  const products = await db.product.findMany({
    where: { id: { in: ids }, status: "ACTIVE" },
    include: { inventory: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const pricedLines: PricedLine[] = [];
  const issues: string[] = [];

  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product) {
      issues.push("An item in your cart is no longer available and was removed.");
      continue;
    }
    const stock = product.inventory?.quantity ?? 0;
    const qty = Math.max(1, Math.min(line.quantity, 50));
    if (stock <= 0) {
      issues.push(`${product.name} has sold out and was removed from your cart.`);
      continue;
    }
    const finalQty = Math.min(qty, stock);
    if (finalQty < qty) {
      issues.push(`Only ${stock} × ${product.name} left — quantity adjusted.`);
    }
    pricedLines.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url ?? null,
      unitCents: product.priceCents,
      quantity: finalQty,
      lineCents: product.priceCents * finalQty,
      available: true,
      stockQuantity: stock,
    });
  }

  const subtotalCents = pricedLines.reduce((s, l) => s + l.lineCents, 0);
  const deliveryCents = fulfilment === "DELIVERY" ? deliveryFeeFor(subtotalCents) : 0;

  let discountCents = 0;
  let appliedPromo: { code: string; title: string } | null = null;
  const promotion = await findActivePromotion(promoCode);
  if (promotion) {
    discountCents = computeDiscount(promotion, subtotalCents);
    if (discountCents > 0) {
      appliedPromo = { code: promotion.code, title: promotion.title };
    } else {
      issues.push(`Promo ${promotion.code} requires a minimum spend.`);
    }
  }

  const totalCents = Math.max(0, subtotalCents - discountCents) + deliveryCents;

  return {
    lines: pricedLines,
    subtotalCents,
    deliveryCents,
    discountCents,
    totalCents,
    promotion: appliedPromo,
    issues,
  };
}
