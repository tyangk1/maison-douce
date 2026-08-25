import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getVerifiedSession } from "@/lib/auth";
import { formatPrice } from "@/lib/money";

export const dynamic = "force-dynamic";

const statusCopy: Record<string, string> = {
  PENDING: "Awaiting payment",
  PAID: "Payment received",
  BAKING: "In the oven",
  READY: "Ready for collection",
  OUT_FOR_DELIVERY: "On its way to you",
  COMPLETED: "Delivered — enjoy!",
  CANCELLED: "Cancelled",
};

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  let order = null;
  try {
    order = await db.order.findUnique({
      where: { orderNumber: params.orderNumber },
      include: { items: true, payment: true },
    });
    // Guest orders are viewable by order number (unguessable token); linked
    // orders are only visible to their owner.
    if (order?.userId) {
      const session = await getVerifiedSession();
      if (!session || session.userId !== order.userId) order = null;
    }
  } catch (e) {
    console.error("[order]", e);
  }
  if (!order) notFound();

  const isNew = searchParams.new === "1";

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-16 sm:px-6">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage/20 text-sage" aria-hidden>
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 13l4.5 4.5L19 8" />
          </svg>
        </span>
        <p className="eyebrow mt-6">{isNew ? "Thank you!" : "Order details"}</p>
        <h1 className="mt-2 font-display text-display-xl">
          {isNew ? "Your order is in good hands." : `Order ${order.orderNumber}`}
        </h1>
        <p className="mt-4 text-bark">
          {isNew
            ? `We've emailed a receipt to ${order.email}. A confirmation with your ${order.fulfilment === "PICKUP" ? "collection slot" : "delivery window"} follows shortly.`
            : `Placed on ${new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.`}
        </p>
      </div>

      <section className="mt-12 rounded-card border border-espresso/10 bg-white/70 p-7 shadow-card sm:p-9" aria-labelledby="order-summary-h">
        <h2 id="order-summary-h" className="font-display text-xl">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-cocoa/70">Order number</dt><dd className="font-mono">{order.orderNumber}</dd></div>
          <div className="flex justify-between"><dt className="text-cocoa/70">Status</dt><dd className="font-medium">{statusCopy[order.status] ?? order.status}</dd></div>
          <div className="flex justify-between"><dt className="text-cocoa/70">Fulfilment</dt><dd>{order.fulfilment === "PICKUP" ? "Collection in bakery" : "Courier delivery"}</dd></div>
          {order.addressLine1 && (
            <div className="flex justify-between gap-6"><dt className="shrink-0 text-cocoa/70">Delivering to</dt>
              <dd className="text-right">{order.customerName}, {order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ""}, {order.city} {order.postcode}</dd>
            </div>
          )}
          {order.promoCode && (
            <div className="flex justify-between"><dt className="text-cocoa/70">Promo applied</dt><dd className="text-sage">{order.promoCode} · −{formatPrice(order.discountCents)}</dd></div>
          )}
        </dl>

        <ul className="mt-6 divide-y divide-espresso/10 border-y border-espresso/10 py-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2.5">
              <span>{item.quantity} × {item.productName}</span>
              <span>{formatPrice(item.unitCents * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.subtotalCents)}</dd></div>
          {order.discountCents > 0 && (
            <div className="flex justify-between text-sage"><dt>Discount</dt><dd>−{formatPrice(order.discountCents)}</dd></div>
          )}
          <div className="flex justify-between text-cocoa/75"><dt>Delivery</dt><dd>{order.deliveryCents === 0 ? "Free" : formatPrice(order.deliveryCents)}</dd></div>
          <div className="flex justify-between border-t border-espresso/10 pt-3 font-semibold"><dt>Total paid</dt><dd>{formatPrice(order.totalCents)}</dd></div>
          {order.payment && (
            <div className="flex justify-between text-[11px] text-cocoa/55">
              <dt>Payment reference ({order.payment.provider})</dt>
              <dd className="font-mono">{order.payment.reference.slice(0, 22)}…</dd>
            </div>
          )}
        </dl>
      </section>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn-primary">Back to the shop</Link>
        <Link href="/account/orders" className="btn-secondary">Track in my orders</Link>
      </div>
    </div>
  );
}
