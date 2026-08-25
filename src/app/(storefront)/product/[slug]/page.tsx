import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { fallbackFor } from "@/lib/assets";
import { Reveal } from "@/components/ui/reveal";
import { ProductGallery, ProductPurchasePanel } from "@/components/store/product-detail";
import { ProductGrid, SectionHeading } from "@/components/store/home-sections";

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      inventory: true,
      category: true,
    },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug).catch(() => null);
  if (!product || product.status !== "ACTIVE") return { title: "Product" };
  return { title: product.name, description: product.shortDescription };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  let product = null;
  try {
    product = await getProduct(params.slug);
  } catch (e) {
    console.error("[product]", e);
  }
  if (!product || product.status !== "ACTIVE") notFound();

  const related = await db.product
    .findMany({
      where: { status: "ACTIVE", categoryId: product.categoryId, id: { not: product.id } },
      include: { images: { take: 1 }, inventory: true },
      take: 4,
    })
    .catch(() => []);

  const stock = product.inventory?.quantity ?? 0;
  const nutrition = safeParseNutrition(product.nutrition);

  return (
    <article className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-8 text-xs uppercase tracking-[0.14em] text-cocoa/60">
        <ol className="flex flex-wrap gap-2">
          <li><Link href="/" className="hover:text-espresso">Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/shop" className="hover:text-espresso">Shop</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/shop?category=${product.category.slug}`} className="hover:text-espresso">{product.category.name}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-espresso">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ProductGallery
          images={product.images.map((i) => ({ url: i.url, alt: i.alt || product.name }))}
          name={product.name}
        />

        <div>
          <p className="eyebrow">{product.category.name}</p>
          <h1 className="mt-2 font-display text-headline sm:text-[clamp(1.8rem,3vw,2.6rem)]">{product.name}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            <p className="font-display text-2xl">{formatPrice(product.priceCents)}</p>
            {product.compareAtCents ? (
              <p className="text-sm text-cocoa/60 line-through">{formatPrice(product.compareAtCents)}</p>
            ) : null}
          </div>

          <div className="mt-3" role="status">
            {stock <= 0 ? (
              <p className="inline-flex items-center gap-2 text-sm font-medium text-red-800">
                <span className="h-2 w-2 rounded-full bg-red-700" /> Sold out — back tomorrow morning
              </p>
            ) : stock <= (product.inventory?.lowStockAt ?? 5) ? (
              <p className="text-sm font-medium text-caramel">Only {stock} left today — order soon</p>
            ) : (
              <p className="inline-flex items-center gap-2 text-sm font-medium text-sage">
                <span className="h-2 w-2 rounded-full bg-sage" /> Available today · {stock} in the counter
              </p>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-bark">{product.shortDescription}</p>
          <p className="mt-4 text-sm leading-relaxed text-bark/90">{product.description}</p>

          <div className="mt-8">
            <ProductPurchasePanel
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.priceCents,
                images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
                stockQuantity: stock,
              }}
            />
          </div>

          <dl className="mt-10 divide-y divide-espresso/10 border-y border-espresso/10 text-sm">
            <DetailRow label="Ingredients" value={product.ingredients} />
            <DetailRow label="Allergens" value={product.allergens} />
            {Object.keys(nutrition).length > 0 && (
              <div className="py-4">
                <dt className="font-medium">Nutrition (typical values)</dt>
                <dd className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-cocoa/85 sm:grid-cols-4">
                  {Object.entries(nutrition).map(([k, v]) => (
                    <span key={k}>
                      <span className="block text-[11px] uppercase tracking-wider text-cocoa/55">{k}</span>
                      {v}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            <div className="py-4">
              <dt className="font-medium">Collection &amp; delivery</dt>
              <dd className="mt-1.5 leading-relaxed text-cocoa/85">
                Collect warm from the counter at 58 Lamb&apos;s Conduit Street, or choose delivery at checkout —
                free over £50 across central London. Same-day cut-off is 2pm.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <Reveal>
            <SectionHeading eyebrow="You may also love" title={`More ${product.category.name.toLowerCase()}`} />
          </Reveal>
          <ProductGrid
            products={related.map((p) => ({
              id: p.id,
              slug: p.slug,
              name: p.name,
              shortDescription: p.shortDescription,
              priceCents: p.priceCents,
              compareAtCents: p.compareAtCents,
              categoryName: product.category.name,
              image: p.images[0]?.url ?? null,
              stockQuantity: p.inventory?.quantity ?? 0,
              fallbackSrc: fallbackFor(p.slug),
            }))}
          />
        </section>
      )}
    </article>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="py-4">
      <dt className="font-medium">{label}</dt>
      <dd className="mt-1.5 leading-relaxed text-cocoa/85">{value}</dd>
    </div>
  );
}

function safeParseNutrition(json: string): Record<string, string> {
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}
