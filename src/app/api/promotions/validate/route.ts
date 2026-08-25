import { NextRequest, NextResponse } from "next/server";
import { findActivePromotion, computeDiscount } from "@/lib/cart-pricing";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") ?? "";
  const subtotal = Number(req.nextUrl.searchParams.get("subtotal") ?? "0");
  const promo = await findActivePromotion(code);
  if (!promo) {
    return NextResponse.json({ valid: false, message: "That code isn't valid or has expired." });
  }
  const discount = computeDiscount(promo, Math.max(0, Math.round(subtotal)));
  return NextResponse.json({
    valid: true,
    code: promo.code,
    title: promo.title,
    discountCents: discount,
    minSubtotalCents: promo.minSubtotalCents,
  });
}
