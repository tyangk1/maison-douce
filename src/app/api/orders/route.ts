import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getVerifiedSession } from "@/lib/auth";
import { priceCart } from "@/lib/cart-pricing";
import { getPaymentProvider } from "@/lib/payment";
import { checkoutSchema, cartLineSchema } from "@/lib/validation";
import { generateOrderNumber } from "@/lib/utils";
import { handleApiError, readJson } from "@/lib/api-helpers";

const bodySchema = z.object({
  lines: z.array(cartLineSchema).min(1, "Your cart is empty").max(50),
  checkout: checkoutSchema,
});

/**
 * Creates an order. The cart is re-priced entirely server-side; client-sent
 * prices are ignored. Payment runs through the registered provider adapter.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await readJson<unknown>(req);
    const parsed = bodySchema.parse(body);

    const priced = await priceCart(
      parsed.lines,
      parsed.checkout.promoCode || undefined,
      parsed.checkout.fulfilment
    );
    if (priced.lines.length === 0) {
      return NextResponse.json({ error: "Your cart is empty or the items are no longer available." }, { status: 409 });
    }

    const session = await getVerifiedSession();
    const orderNumber = generateOrderNumber();

    // Mock payment charge (adapter pattern — Stripe drops in here later).
    const provider = getPaymentProvider(parsed.checkout.paymentMethod === "mock_card" ? "mock" : "mock");
    const payment = await provider.charge({
      orderNumber,
      amountCents: priced.totalCents,
      currency: "gbp",
      metadata: { cardNumber: parsed.checkout.mockCardNumber ?? "4242424242424242" },
    });
    if (!payment.ok) {
      return NextResponse.json({ error: payment.error }, { status: 402 });
    }

    const order = await db.$transaction(async (tx) => {
      // Re-check stock atomically and decrement.
      for (const line of priced.lines) {
        const inv = await tx.inventory.findUnique({ where: { productId: line.productId } });
        const available = inv?.quantity ?? 0;
        if (available < line.quantity) {
          throw new StockError(`${line.name} just sold out. Please adjust your cart.`);
        }
        await tx.inventory.update({
          where: { productId: line.productId },
          data: { quantity: { decrement: line.quantity } },
        });
      }

      return tx.order.create({
        data: {
          orderNumber,
          userId: session?.userId ?? null,
          email: parsed.checkout.email,
          customerName: parsed.checkout.customerName,
          phone: parsed.checkout.phone,
          fulfilment: parsed.checkout.fulfilment,
          addressLine1: parsed.checkout.addressLine1 ?? null,
          addressLine2: parsed.checkout.addressLine2 ?? null,
          city: parsed.checkout.city ?? null,
          postcode: parsed.checkout.postcode ?? null,
          notes: parsed.checkout.notes ?? null,
          promoCode: priced.promotion?.code ?? null,
          subtotalCents: priced.subtotalCents,
          deliveryCents: priced.deliveryCents,
          discountCents: priced.discountCents,
          totalCents: priced.totalCents,
          status: "PAID",
          items: {
            create: priced.lines.map((l) => ({
              productId: l.productId,
              productName: l.name,
              variantName: l.variantName,
              unitCents: l.unitCents,
              quantity: l.quantity,
            })),
          },
          payment: {
            create: {
              provider: payment.provider,
              status: "SUCCEEDED",
              amountCents: priced.totalCents,
              reference: payment.reference,
            },
          },
        },
      });
    });

    // Record promotion redemption for campaign analytics.
    if (priced.promotion && priced.discountCents > 0) {
      const promo = await db.promotion.findUnique({ where: { code: priced.promotion.code } });
      if (promo) {
        await db.promotionUsage.create({
          data: {
            promotionId: promo.id,
            orderId: order.id,
            email: parsed.checkout.email,
            discountCents: priced.discountCents,
          },
        });
      }
    }

    await db.activityLog.create({
      data: {
        actor: parsed.checkout.email,
        action: "order.created",
        detail: `${orderNumber} · £${(priced.totalCents / 100).toFixed(2)} · ${priced.lines.length} item(s)`,
      },
    });

    return NextResponse.json({
      ok: true,
      order: {
        orderNumber: order.orderNumber,
        totalCents: order.totalCents,
        status: order.status,
        fulfilment: order.fulfilment,
      },
    });
  } catch (e) {
    if (e instanceof StockError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    return handleApiError(e);
  }
}

class StockError extends Error {}
