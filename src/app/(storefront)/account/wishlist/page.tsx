"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/components/store/store-provider";
import { AccountNav } from "@/components/store/account-nav";
import { SmartImage } from "@/components/ui/smart-image";
import { formatPrice } from "@/lib/money";
import type { ProductCardData } from "@/components/store/product-card";

export default function WishlistPage() {
  const { favorites, hydrated, addToCart, toggleFavorite } = useStore();
  const [products, setProducts] = useState<(ProductCardData & { stockQuantity: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    fetch("/api/products?perPage=48")
      .then((r) => r.json())
      .then((data) => {
        const all: (ProductCardData & { id: string })[] = data.products ?? [];
        setProducts(all.filter((p) => favorites.includes(p.id)));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [favorites, hydrated]);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 font-display text-display-xl">Favourites</h1>
          <p className="mt-2 text-sm text-cocoa/70">Saved on this device{favorites.length ? ` · ${favorites.length} item(s)` : ""}.</p>
        </div>
        <AccountNav />
      </header>

      {!hydrated || loading ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3" aria-busy="true">
          {[...Array(3)].map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-card bg-cream" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-card border border-dashed border-espresso/20 py-16 text-center">
          <p className="font-display text-2xl">Nothing saved yet</p>
          <p className="mt-3 text-sm text-cocoa/70">Tap the heart on any product to keep it here.</p>
          <Link href="/shop" className="btn-primary mt-7 inline-flex">Browse the shop</Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li key={p.id}>
              <Link href={`/product/${p.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-cream">
                  <SmartImage src={p.image} alt={p.name} fill sizes="(max-width:640px) 90vw, 30vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                </div>
                <h3 className="mt-3 font-display text-lg">{p.name}</h3>
              </Link>
              <p className="text-sm font-semibold">{formatPrice(p.priceCents)}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={p.stockQuantity <= 0}
                  onClick={() =>
                    addToCart({
                      productId: p.id,
                      slug: p.slug,
                      name: p.name,
                      priceCents: p.priceCents,
                      image: p.image,
                      stockQuantity: p.stockQuantity,
                    })
                  }
                  className="flex-1 rounded-full border border-espresso/20 py-2 text-xs font-medium uppercase tracking-wider transition hover:bg-espresso hover:text-parchment disabled:opacity-40"
                >
                  {p.stockQuantity > 0 ? "Add to basket" : "Sold out"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(p.id)}
                  aria-label={`Remove ${p.name} from favourites`}
                  className="rounded-full border border-espresso/20 px-3 text-xs hover:border-red-700 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
