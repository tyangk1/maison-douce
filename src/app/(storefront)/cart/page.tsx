"use client";

import Link from "next/link";
import { useStore } from "@/components/store/store-provider";
import { SmartImage } from "@/components/ui/smart-image";
import { formatPrice, deliveryFeeFor, FREE_DELIVERY_THRESHOLD_CENTS } from "@/lib/money";

export default function CartPage() {
  const { lines, updateQuantity, removeLine, subtotalCents, hydrated } = useStore();
  const delivery = deliveryFeeFor(subtotalCents);
  const toFree = FREE_DELIVERY_THRESHOLD_CENTS - subtotalCents;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6" aria-busy="true">
        <div className="h-8 w-48 animate-pulse rounded bg-sand" />
        <div className="mt-10 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-card bg-cream" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="eyebrow">Your basket</p>
        <h1 className="mt-2 font-display text-display-xl">Ready when you are</h1>
      </header>

      {lines.length === 0 ? (
        <div className="rounded-card border border-dashed border-espresso/20 py-24 text-center">
          <p className="font-display text-2xl">Nothing in the basket yet</p>
          <p className="mt-3 text-sm text-cocoa/70">The croissants are still warm — go find something lovely.</p>
          <Link href="/shop" className="btn-primary mt-8">Browse the shop</Link>
        </div>
      ) : (
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <ul className="divide-y divide-espresso/10 border-y border-espresso/10">
            {lines.map((l) => (
              <li key={l.productId} className="flex gap-5 py-6">
                <Link href={`/product/${l.slug}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-cream">
                  <SmartImage src={l.image} alt={l.name} fill sizes="96px" className="object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/product/${l.slug}`} className="font-display text-lg leading-snug hover:underline">
                      {l.name}
                    </Link>
                    <span className="shrink-0 font-semibold">{formatPrice(l.priceCents * l.quantity)}</span>
                  </div>
                  <p className="mt-1 text-xs text-cocoa/70">{formatPrice(l.priceCents)} each · {l.stockQuantity} available</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center rounded-full border border-espresso/15" role="group" aria-label={`Quantity for ${l.name}`}>
                      <button type="button" className="h-9 w-9" aria-label="Decrease quantity" onClick={() => updateQuantity(l.productId, l.quantity - 1)}>−</button>
                      <span aria-live="polite" className="w-8 text-center text-sm font-medium">{l.quantity}</span>
                      <button
                        type="button"
                        disabled={l.quantity >= l.stockQuantity}
                        className="h-9 w-9 disabled:opacity-30"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(l.productId, l.quantity + 1)}
                      >+</button>
                    </div>
                    <button type="button" onClick={() => removeLine(l.productId)} className="text-xs text-bark/70 underline-offset-2 hover:text-red-800 hover:underline">
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-card border border-espresso/10 bg-white/70 p-7 shadow-card lg:sticky lg:top-24">
            <h2 className="font-display text-xl">Order summary</h2>
            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotalCents)}</dd></div>
              <div className="flex justify-between text-cocoa/75"><dt>Delivery</dt><dd>{delivery === 0 ? "Free" : formatPrice(delivery)}</dd></div>
              {toFree > 0 && (
                <p className="rounded-lg bg-sand/60 px-3 py-2 text-xs text-bark">
                  Add {formatPrice(toFree)} more for free delivery.
                </p>
              )}
              <div className="flex justify-between border-t border-espresso/10 pt-3 text-base font-semibold">
                <dt>Estimated total</dt><dd>{formatPrice(subtotalCents + delivery)}</dd>
              </div>
              <p className="text-[11px] text-cocoa/55">Final total confirmed at checkout. Promo codes applied there.</p>
            </dl>
            <Link href="/checkout" className="btn-primary mt-6 w-full">Continue to checkout</Link>
            <Link href="/shop" className="mt-3 block text-center text-xs underline underline-offset-2 hover:text-espresso">Keep shopping</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
