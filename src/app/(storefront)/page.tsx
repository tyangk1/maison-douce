import { db } from "@/lib/db";
import { Hero } from "@/components/store/hero";
import {
  BakedToday,
  GallerySection,
  ProcessSection,
  ProductGrid,
  SectionHeading,
  StorySection,
  TestimonialsSection,
} from "@/components/store/home-sections";
import { NewsletterBand, SeasonalBanner, SignatureSection } from "@/components/store/campaign-sections";
import { Reveal } from "@/components/ui/reveal";
import { fallbackFor } from "@/lib/assets";

export const revalidate = 60;

type CardProduct = {
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

function toCard(p: {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  priceCents: number;
  compareAtCents: number | null;
  images: { url: string }[];
  inventory: { quantity: number } | null;
}, categoryName?: string): CardProduct & { fallbackSrc: string } {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    priceCents: p.priceCents,
    compareAtCents: p.compareAtCents,
    categoryName,
    image: p.images[0]?.url ?? null,
    stockQuantity: p.inventory?.quantity ?? 0,
    fallbackSrc: fallbackFor(p.slug),
  };
}

async function getHomeData() {
  try {
    const [settingsRows, featured, baked, signature, seasonalCount] = await Promise.all([
      db.siteSetting.findMany({ where: { key: { in: ["hero", "story", "announcement"] } } }),
      db.product.findMany({
        where: { status: "ACTIVE", isFeatured: true },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, inventory: true, category: true },
        take: 8,
      }),
      db.product.findMany({
        where: { status: "ACTIVE", inventory: { bakedOn: { not: null }, quantity: { gt: 0 } } },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, inventory: true },
        orderBy: { inventory: { quantity: "asc" } },
        take: 5,
      }),
      db.product.findMany({
        where: { status: "ACTIVE", tags: { contains: "signature" } },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, inventory: true },
        take: 3,
      }),
      db.product.count({ where: { status: "ACTIVE", category: { slug: "seasonal" } } }),
    ]);

    const settings = Object.fromEntries(settingsRows.map((s) => [s.key, JSON.parse(s.valueJson)])) as {
      hero?: { eyebrow: string; titleLines: string[]; subtitle: string; primaryCta: string; secondaryCta: string };
      story?: { title: string; body: string };
    };

    // If nothing is flagged "baked today", fall back to freshest in-stock items.
    let bakedToday = baked;
    if (bakedToday.length === 0) {
      bakedToday = await db.product.findMany({
        where: { status: "ACTIVE", inventory: { quantity: { gt: 0 } } },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, inventory: true },
        take: 5,
      });
    }

    if (signature.length < 3) {
      signature.push(
        ...(
          await db.product.findMany({
            where: { status: "ACTIVE", isFeatured: true },
            include: { images: { take: 1 }, inventory: true },
            take: 3 - signature.length,
          })
        ).filter((p) => !signature.some((s) => s.id === p.id))
      );
    }

    return {
      hero: settings.hero ?? null,
      story: settings.story ?? null,
      featured: featured.map((p) => toCard(p, p.category.name)),
      baked: bakedToday.map((p) => toCard(p)),
      signature: signature.map((p) => toCard(p)),
      seasonalCount,
    };
  } catch (e) {
    console.error("[home]", e);
    return { hero: null, story: null, featured: [], baked: [], signature: [], seasonalCount: 0 };
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <>
      <Hero
        eyebrow={data.hero?.eyebrow ?? "Artisan bakery · London"}
        titleLines={data.hero?.titleLines ?? ["Made slowly.", "Loved instantly."]}
        subtitle={
          data.hero?.subtitle ??
          "Small-batch pastries, bread, and desserts baked fresh with carefully sourced ingredients."
        }
        primaryCta={data.hero?.primaryCta ?? "Shop today's collection"}
        secondaryCta={data.hero?.secondaryCta ?? "Discover our story"}
      />

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="This week's favourites"
              title="Featured collection"
              action={{ href: "/shop", label: "View all" }}
            />
          </Reveal>
          {data.featured.length > 0 ? (
            <ProductGrid products={data.featured} />
          ) : (
            <p className="text-sm text-cocoa/70">The counters are being restocked — check back shortly.</p>
          )}
        </div>
      </section>

      {data.baked.length > 0 && <BakedToday products={data.baked} />}

      <StorySection
        title={data.story?.title ?? "Flour, water, salt — and patience."}
        body={data.story?.body ?? "Maison Douce began in 2019 with one deck oven and an unreasonable belief that London deserved slower bread."}
      />

      {data.signature.length >= 3 && <SignatureSection products={data.signature} />}

      <SeasonalBanner productCount={data.seasonalCount} />

      <ProcessSection />
      <TestimonialsSection />
      <GallerySection />
      <NewsletterBand />
    </>
  );
}
