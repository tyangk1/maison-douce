"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/components/store/store-provider";
import { getLineKey } from "@/components/store/store-provider";
import { SmartImage } from "@/components/ui/smart-image";
import { formatPrice, deliveryFeeFor, FREE_DELIVERY_THRESHOLD_CENTS } from "@/lib/money";

export function CartDrawer() {
  const { drawerOpen, closeDrawer, lines, updateQuantity, removeLine, subtotalCents } = useStore();
  const delivery = deliveryFeeFor(subtotalCents);
  const toFree = FREE_DELIVERY_THRESHOLD_CENTS - subtotalCents;

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-espresso/40 backdrop-blur-[2px]"
            onClick={closeDrawer}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-parchment shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-espresso/10 px-6 py-4">
              <h2 className="font-display text-xl">Your basket</h2>
              <button
                type="button"
                onClick={closeDrawer}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand"
                aria-label="Close cart"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <p className="font-display text-2xl">Your basket is empty</p>
                <p className="text-sm text-bark/80">The ovens are warm and the counters are full.</p>
                <Link href="/shop" onClick={closeDrawer} className="btn-primary mt-2">
                  Browse the shop
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-espresso/8 overflow-y-auto px-6">
                  {lines.map((l) => (
                    <li key={getLineKey(l)} className="flex gap-4 py-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream">
                        <SmartImage src={l.image} alt={l.name} fill sizes="80px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/product/${l.slug}`} onClick={closeDrawer} className="truncate text-sm font-medium hover:underline">
                            {l.name}
                          </Link>
                          <span className="shrink-0 text-sm font-semibold">{formatPrice(l.priceCents * l.quantity)}</span>
                        </div>
                        {l.variantName && (
                          <p className="mt-0.5 text-xs text-caramel">{l.variantName}</p>
                        )}
                        <p className="mt-0.5 text-xs text-cocoa/70">{formatPrice(l.priceCents)} each</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-espresso/15">
                            <button
                              type="button"
                              className="h-7 w-7 text-sm"
                              aria-label={`Decrease ${l.name} quantity`}
                              onClick={() => updateQuantity(getLineKey(l), l.quantity - 1)}
                            >
                              −
                            </button>
                            <span aria-live="polite" className="w-7 text-center text-xs font-medium">{l.quantity}</span>
                            <button
                              type="button"
                              disabled={l.quantity >= l.stockQuantity}
                              className="h-7 w-7 text-sm disabled:opacity-30"
                              aria-label={`Increase ${l.name} quantity`}
                              onClick={() => updateQuantity(getLineKey(l), l.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(getLineKey(l))}
                            className="text-xs text-bark/70 underline-offset-2 hover:text-red-800 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-espresso/10 px-6 py-4">
                  {toFree > 0 ? (
                    <p className="mb-3 rounded-lg bg-sand/60 px-3 py-2 text-center text-xs text-bark">
                      You&apos;re {formatPrice(toFree)} away from free delivery
                    </p>
                  ) : (
                    <p className="mb-3 rounded-lg bg-sage/15 px-3 py-2 text-center text-xs font-medium text-sage">
                      Free delivery unlocked
                    </p>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatPrice(subtotalCents)}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-cocoa/70">
                    <span>Delivery</span>
                    <span>{delivery === 0 ? "Free" : `from ${formatPrice(delivery)}`}</span>
                  </div>
                  <Link href="/checkout" onClick={closeDrawer} className="btn-primary mt-4 w-full">
                    Checkout
                  </Link>
                  <Link href="/cart" onClick={closeDrawer} className="mt-2 block text-center text-xs underline underline-offset-2 hover:text-espresso">
                    View full basket
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

