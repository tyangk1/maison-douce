"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { SmartImage } from "@/components/ui/smart-image";
import { formatPrice } from "@/lib/money";
import { useStore } from "@/components/store/store-provider";
import { IMG } from "@/lib/assets";
import type { ProductCardData } from "@/components/store/product-card";

/** Editorial asymmetric layout — one hero product + two stacked features. */
export function SignatureSection({ products }: { products: ProductCardData[] }) {
  const { addToCart } = useStore();
  const [hero, ...rest] = products;
  if (!hero) return null;

  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="eyebrow">The signatures</p>
          <h2 className="mt-2 font-display text-display">What we&apos;re known for</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <motion.div whileHover={{ scale: 1.008 }} transition={{ duration: 0.3 }} className="group relative overflow-hidden rounded-card shadow-lift">
            <div className="relative aspect-[16/11] lg:aspect-auto lg:h-full lg:min-h-[480px]">
              <SmartImage src={hero.image} alt={hero.name} fill sizes="(max-width:1024px) 100vw, 58vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/20 to-transparent" aria-hidden />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-7 text-parchment sm:p-9">
              <p className="text-xs uppercase tracking-[0.22em] text-parchment/70">House icon</p>
              <h3 className="mt-2 font-display text-2xl sm:text-3xl">{hero.name}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-parchment/85">{hero.shortDescription}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href={`/product/${hero.slug}`} className="rounded-full bg-parchment px-6 py-2.5 text-sm font-semibold text-espresso transition hover:bg-white">
                  View · {formatPrice(hero.priceCents)}
                </Link>
                {hero.stockQuantity > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      addToCart({
                        productId: hero.id,
                        slug: hero.slug,
                        name: hero.name,
                        priceCents: hero.priceCents,
                        image: hero.image,
                        stockQuantity: hero.stockQuantity,
                      })
                    }
                    className="rounded-full border border-parchment/50 px-6 py-2.5 text-sm font-medium text-parchment transition hover:bg-parchment hover:text-espresso"
                  >
                    Add to basket
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6">
            {rest.slice(0, 2).map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className="group relative flex overflow-hidden rounded-card bg-espresso text-parchment shadow-lift">
                <div className="relative w-2/5 shrink-0">
                  <SmartImage src={p.image} alt={p.name} fill sizes="240px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-col justify-center p-6">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-caramel">Signature</p>
                  <h3 className="mt-1.5 font-display text-xl leading-snug">{p.name}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-parchment/70">{p.shortDescription}</p>
                  <p className="mt-3 text-sm font-semibold">{formatPrice(p.priceCents)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SeasonalBanner({ productCount }: { productCount: number }) {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0" aria-hidden>
        <SmartImage src={IMG.seasonalHero} alt="" fill sizes="100vw" className="object-cover" priority={false} />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/75 via-espresso/45 to-espresso/15" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl text-parchment"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blush">Limited edition</p>
          <h2 className="mt-3 font-display text-display-xl">The Strawberry Season Collection</h2>
          <p className="mt-5 max-w-md leading-relaxed text-parchment/85">
            Kentish strawberries at their peak, folded into mille-feuille, tarts and danishes.
            Here only while the season lasts — {productCount} pieces this week.
          </p>
          <Link href="/shop?category=seasonal" className="btn-accent mt-8">
            Shop the collection
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export function NewsletterBand() {
  return (
    <section className="bg-sand/60 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        <div className="relative aspect-[5/4] overflow-hidden rounded-card shadow-lift">
          <SmartImage src={IMG.newsletter} alt="A slice of celebration cake with fresh berries" fill sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" />
        </div>
        <div>
          <h2 className="font-display text-headline sm:text-display">A little sweetness in your inbox.</h2>
          <p className="mt-4 max-w-md text-bark/90">
            One thoughtful email a week: the bake list for tomorrow, seasonal drops before they sell out,
            and the occasional recipe worth your weekend.
          </p>
          <NewsletterFormInline />
        </div>
      </div>
    </section>
  );
}

function NewsletterFormInline() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.fields?.email ?? data.error ?? "Something went wrong");
      setState("done");
      setMessage(data.message);
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (state === "done") {
    return <p role="status" className="mt-6 rounded-lg bg-sage/25 px-4 py-3 text-sm text-espresso">{message}</p>;
  }

  return (
    <>
      <form onSubmit={submit} className="mt-6 flex max-w-md flex-wrap gap-2 sm:flex-nowrap">
        <label htmlFor="home-newsletter" className="sr-only">Email address</label>
        <input
          id="home-newsletter"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input-field min-w-0 flex-1 rounded-full"
        />
        <button type="submit" disabled={state === "loading"} className="btn-primary !px-6">
          {state === "loading" ? "Joining…" : "Subscribe"}
        </button>
      </form>
      {state === "error" && <p role="alert" className="field-error mt-2">{message}</p>}
    </>
  );
}
