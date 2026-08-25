"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SmartImage } from "@/components/ui/smart-image";
import { useStore } from "@/components/store/store-provider";
import { formatPrice } from "@/lib/money";

export type ProductDetailData = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  images: { url: string; alt: string }[];
  stockQuantity: number;
};

export function ProductPurchasePanel({
  product,
  variants = [],
}: {
  product: ProductDetailData;
  variants?: { id: string; name: string; priceDeltaCents: number }[];
}) {
  const { addToCart, toggleFavorite, isFavorite, openDrawer } = useStore();
  const [variantId, setVariantId] = useState<string | null>(
    variants.find((v) => v.priceDeltaCents === 0)?.id ?? variants[0]?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stockQuantity <= 0;
  const fav = isFavorite(product.id);
  const activeVariant = variants.find((v) => v.id === variantId) ?? null;
  const unitPrice = product.priceCents + (activeVariant?.priceDeltaCents ?? 0);

  function add() {
    addToCart(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        priceCents: unitPrice,
        image: product.images[0]?.url ?? null,
        stockQuantity: product.stockQuantity,
        variantId: activeVariant?.id,
        variantName: activeVariant?.name ?? null,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="space-y-5">
      {variants.length > 0 && (
        <div>
          <p className="field-label">Choose an option</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Product options">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={variantId === v.id}
                onClick={() => setVariantId(v.id)}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                  variantId === v.id
                    ? "border-espresso bg-espresso text-parchment"
                    : "border-espresso/20 hover:border-espresso"
                }`}
              >
                {v.name}
                {v.priceDeltaCents !== 0 && (
                  <span className="ml-1.5 text-xs opacity-75">
                    {v.priceDeltaCents > 0 ? "+" : "−"}
                    {formatPrice(Math.abs(v.priceDeltaCents))}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {variants.length > 0 && (
          <p aria-live="polite" className="w-full text-sm font-semibold">
            {formatPrice(unitPrice)}
            <span className="ml-1 font-normal text-cocoa/60">× {quantity} = {formatPrice(unitPrice * quantity)}</span>
          </p>
        )}
      <div className="inline-flex items-center rounded-full border border-espresso/20" role="group" aria-label="Quantity">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          className="h-11 w-11 text-lg disabled:opacity-30"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span aria-live="polite" className="w-9 text-center text-sm font-semibold">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(product.stockQuantity || 50, q + 1))}
          disabled={soldOut || quantity >= product.stockQuantity}
          className="h-11 w-11 text-lg disabled:opacity-30"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <button type="button" onClick={add} disabled={soldOut} className="btn-primary relative min-w-[180px] flex-1 !py-3.5 sm:flex-none sm:!px-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={added ? "added" : "add"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {soldOut ? "Sold out today" : added ? "Added ✓" : "Add to basket"}
          </motion.span>
        </AnimatePresence>
      </button>

      {!soldOut && added && (
        <button type="button" onClick={openDrawer} className="text-sm font-medium underline underline-offset-4 hover:no-underline">
          View basket
        </button>
      )}

      <button
        type="button"
        aria-pressed={fav}
        aria-label={fav ? "Remove from favourites" : "Add to favourites"}
        onClick={() => toggleFavorite(product.id)}
        className={`grid h-12 w-12 place-items-center rounded-full border transition ${
          fav ? "border-blush bg-blush/20" : "border-espresso/20 hover:border-espresso"
        }`}
      >
        <svg viewBox="0 0 24 24" className={`h-5 w-5 ${fav ? "fill-blush stroke-blush" : "fill-none stroke-current"}`} strokeWidth="1.6" aria-hidden>
          <path d="M12 21s-7.5-4.7-10-9.3C.5 8 2.6 4 6.5 4c2.1 0 3.7 1.2 4.5 2.5h2c.8-1.3 2.4-2.5 4.5-2.5 3.9 0 6 4 4.5 7.7C19.5 16.3 12 21 12 21z" />
        </svg>
      </button>
      </div>
    </div>
  );
}

export function ProductGallery({ images, name }: { images: { url: string; alt: string }[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const active = images[index];

  return (
    <div>
      <motion.div
        key={`${active?.url}-${zoomed}`}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        className={`relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-card shadow-lift ${zoomed ? "scale-[1.6] cursor-zoom-out" : ""}`}
        onClick={() => setZoomed((z) => !z)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setZoomed((z) => !z);
          }
        }}
        aria-label={zoomed ? "Zoom out" : "Zoom in"}
        aria-pressed={zoomed}
      >
        <SmartImage src={active?.url} alt={active?.alt || name} priority fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover transition-transform duration-500 ease-elegant" />
      </motion.div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3" role="tablist" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              onClick={() => {
                setIndex(i);
                setZoomed(false);
              }}
              className={`relative h-20 w-16 overflow-hidden rounded-lg border-2 transition ${i === index ? "border-caramel" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              <SmartImage src={img.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
