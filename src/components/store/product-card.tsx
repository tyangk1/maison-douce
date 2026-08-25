"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useStore } from "@/components/store/store-provider";
import { SmartImage } from "@/components/ui/smart-image";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  priceCents: number;
  compareAtCents?: number | null;
  categoryName?: string;
  image: string | null;
  stockQuantity: number;
};

export function ProductCard({
  product,
  fallbackSrc,
  className,
}: {
  product: ProductCardData;
  fallbackSrc?: string;
  className?: string;
}) {
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const soldOut = product.stockQuantity <= 0;
  const lowStock = !soldOut && product.stockQuantity <= 5;
  const fav = isFavorite(product.id);

  return (
    <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.25, ease: "easeOut" }} className={cn("group relative", className)}>
      <Link href={`/product/${product.slug}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel rounded-card">
        <div className="relative overflow-hidden rounded-card bg-cream aspect-[4/5]">
          <SmartImage
            src={product.image}
            alt={product.name}
            fallbackSrc={fallbackSrc}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="object-cover transition-transform duration-500 ease-elegant group-hover:scale-[1.04]"
          />
          {soldOut && (
            <span className="absolute left-3 top-3 rounded-full bg-espresso/85 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-parchment">
              Sold out
            </span>
          )}
          {!soldOut && lowStock && (
            <span className="absolute left-3 top-3 rounded-full bg-caramel px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-espresso">
              Only {product.stockQuantity} left
            </span>
          )}
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            {product.categoryName && <p className="text-[11px] uppercase tracking-[0.16em] text-cocoa/70">{product.categoryName}</p>}
            <h3 className="font-display text-lg leading-snug">{product.name}</h3>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold">{formatPrice(product.priceCents)}</p>
            {product.compareAtCents ? (
              <p className="text-xs text-cocoa/60 line-through">{formatPrice(product.compareAtCents)}</p>
            ) : null}
          </div>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-bark/80">{product.shortDescription}</p>
      </Link>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={soldOut}
          onClick={() =>
            addToCart({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              image: product.image,
              stockQuantity: product.stockQuantity,
            })
          }
          className="flex-1 rounded-full border border-espresso/20 py-2 text-xs font-medium uppercase tracking-wider transition-all hover:border-espresso hover:bg-espresso hover:text-parchment disabled:cursor-not-allowed disabled:opacity-40"
        >
          {soldOut ? "Sold out" : "Quick add"}
        </button>
        <button
          type="button"
          aria-label={fav ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
          aria-pressed={fav}
          onClick={() => toggleFavorite(product.id)}
          className={cn(
            "grid h-9 w-9 place-items-center rounded-full border transition-all",
            fav ? "border-blush bg-blush/20" : "border-espresso/20 hover:border-espresso"
          )}
        >
          <svg viewBox="0 0 24 24" className={cn("h-4 w-4", fav ? "fill-blush stroke-blush" : "fill-none stroke-current")} strokeWidth="1.6" aria-hidden>
            <path d="M12 21s-7.5-4.7-10-9.3C.5 8 2.6 4 6.5 4c2.1 0 3.7 1.2 4.5 2.5h2c.8-1.3 2.4-2.5 4.5-2.5 3.9 0 6 4 4.5 7.7C19.5 16.3 12 21 12 21z" />
          </svg>
        </button>
      </div>
    </motion.article>
  );
}
