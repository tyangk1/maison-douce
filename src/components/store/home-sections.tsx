"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ProductCard, type ProductCardData } from "@/components/store/product-card";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SmartImage } from "@/components/ui/smart-image";
import { IMG } from "@/lib/assets";

export function SectionHeading({
  eyebrow,
  title,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
  align?: "left" | "center";
}) {
  return (
    <div className={`mb-10 flex flex-wrap items-end justify-between gap-4 ${align === "center" ? "justify-center text-center" : ""}`}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 font-display text-display">{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className="group inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline">
          {action.label}
          <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M5 12h14m-6-6l6 6-6 6" />
          </svg>
        </Link>
      )}
    </div>
  );
}

export function ProductGrid({ products }: { products: (ProductCardData & { fallbackSrc?: string })[] }) {
  return (
    <Stagger className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <StaggerItem key={p.id}>
          <ProductCard product={p} fallbackSrc={p.fallbackSrc} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export function BakedToday({ products }: { products: ProductCardData[] }) {
  const reduce = useReducedMotion();
  return (
    <section className="bg-espresso py-20 text-parchment">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-caramel">Fresh from our ovens today</p>
            <h2 className="mt-2 font-display text-display text-parchment">Baked today</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-parchment/70">
              Counted at the counter each morning. When they&apos;re gone, they&apos;re gone — tomorrow&apos;s batch starts
              with tonight&apos;s poolish.
            </p>
          </div>
          <Link href="/shop?inStock=1" className="btn-accent">
            See what&apos;s left today
          </Link>
        </div>

        <Stagger className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 xl:grid-cols-5">
          {products.map((p) => {
            const remaining = Math.max(0, p.stockQuantity);
            const pct = Math.min(100, Math.round((remaining / Math.max(remaining + 6, 12)) * 100));
            return (
              <StaggerItem key={p.id}>
                <Link href={`/product/${p.slug}`} className="group block">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-cocoa/40">
                    <SmartImage src={p.image} alt={p.name} fill sizes="(max-width:768px) 45vw, 18vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute bottom-2 right-2 rounded-full bg-parchment/90 px-2.5 py-1 text-[11px] font-semibold text-espresso">
                      {remaining > 0 ? `${remaining} left` : "Sold out"}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-medium leading-snug">{p.name}</h3>
                  {!reduce && (
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-parchment/15" aria-hidden>
                      <motion.div
                        className="h-full rounded-full bg-caramel"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max(pct, 8)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  )}
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

export function StorySection({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section className="py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div className="relative order-2 lg:order-1">
          <div className="aspect-[4/5] overflow-hidden rounded-card shadow-lift">
            <SmartImage src={IMG.story} alt="A baker shaping dough by hand in the Maison Douce atelier" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-8 -right-4 hidden w-48 overflow-hidden rounded-card border-4 border-parchment shadow-lift sm:block lg:-right-8">
            <div className="aspect-square relative">
              <SmartImage src={IMG.interior} alt="The Maison Douce counter at opening time" fill sizes="192px" className="object-cover" />
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <p className="eyebrow">Our craft</p>
          <h2 className="mt-2 font-display text-display">{title}</h2>
          <p className="mt-6 max-w-lg leading-relaxed text-bark">{body}</p>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-espresso/10 pt-8">
            {[
              ["72h", "croissant process"],
              ["24h", "cold ferment loaves"],
              ["2019", "the first arch"],
            ].map(([stat, label]) => (
              <div key={label}>
                <dt className="font-display text-3xl text-espresso">{stat}</dt>
                <dd className="mt-1 text-xs uppercase tracking-[0.14em] text-cocoa/70">{label}</dd>
              </div>
            ))}
          </dl>
          <Link href="/about" className="btn-secondary mt-10">
            Read our story
          </Link>
        </div>
      </div>
    </section>
  );
}

const processSteps = [
  {
    n: "01",
    title: "Ingredients",
    body: "Stone-milled British flour, cultured Normandy butter, fruit picked at peak from growers we visit ourselves.",
  },
  {
    n: "02",
    title: "Slow fermentation",
    body: "Natural levains and overnight cold rests. Time does the heavy lifting that additives never could.",
  },
  {
    n: "03",
    title: "Handcrafted",
    body: "Every croissant folded by hand, every loaf scored by a baker who signs their work on the crust.",
  },
  {
    n: "04",
    title: "Fresh delivery",
    body: "Out of the oven and into your hands within hours — collected warm or delivered across central London.",
  },
];

export function ProcessSection() {
  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="How it's made" title="From flour to your table" align="center" />
        <Stagger className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step) => (
            <StaggerItem key={step.n}>
              <p className="font-display text-5xl text-caramel/70">{step.n}</p>
              <h3 className="mt-4 font-display text-xl">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-bark/85">{step.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote: "The burnt Basque cheesecake is the single best thing I have eaten in London this year. I now plan weekends around it.",
    name: "Ottavia R.",
    role: "Regular since 2021",
  },
  {
    quote: "You can taste the patience. The sourdough keeps for days and toasts like a dream — I've stopped buying bread anywhere else.",
    name: "Daniel K.",
    role: "Bread subscription member",
  },
  {
    quote: "We ordered the pistachio & rose cake for our wedding and guests are still talking about it months later.",
    name: "Priya & Sam",
    role: "Celebration cake, June",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Kind words" title="From our regulars" />
        <Stagger className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="flex h-full flex-col rounded-card border border-espresso/10 bg-white/60 p-8 shadow-card">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-caramel/60" fill="currentColor" aria-hidden>
                  <path d="M10 8c-3 .5-5 2.8-5 6v2h4v-6H7c.4-1.2 1.6-2 3-2V8zm9 0c-3 .5-5 2.8-5 6v2h4v-6h-2c.4-1.2 1.6-2 3-2V8z" />
                </svg>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-espresso/90">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-6 border-t border-espresso/10 pt-4 text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="block text-xs uppercase tracking-[0.14em] text-cocoa/60">{t.role}</span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

const gallery = [
  IMG.gallery1, IMG.gallery2, IMG.gallery3, IMG.gallery4,
  IMG.gallery5, IMG.gallery6, IMG.hero, IMG.seasonalHero,
];

export function GallerySection() {
  const reduce = useReducedMotion();
  return (
    <section className="pb-24 pt-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="@maisondouce"
          title="Life at the atelier"
          action={{ href: "/contact", label: "Say hello" }}
        />
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
          {gallery.map((src, i) => (
            <motion.a
              key={`${src}-${i}`}
              href="/contact"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: (i % 4) * 0.06 }}
              className="group block break-inside-avoid"
              aria-label="View our gallery"
            >
              <div className={`relative overflow-hidden rounded-lg ${i % 5 === 0 ? "aspect-[3/4]" : i % 3 === 0 ? "aspect-square" : "aspect-[4/5]"}`}>
                <SmartImage src={src} alt="Maison Douce bakery life" fill sizes="(max-width:640px) 46vw, 23vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-espresso/0 transition-colors duration-300 group-hover:bg-espresso/15" aria-hidden />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
