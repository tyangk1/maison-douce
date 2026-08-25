import type { Metadata } from "next";
import { db } from "@/lib/db";
import { FilterBar, Pagination } from "@/components/store/filter-bar";
import { ProductGrid } from "@/components/store/home-sections";
import { fallbackFor } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Shop the collection",
  description: "Pastries, cakes, tarts and bread — baked fresh every morning at Maison Douce.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function one(sp: SearchParams, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const q = one(searchParams, "q")?.trim() ?? "";
  const categorySlug = one(searchParams, "category") ?? "";
  const sort = one(searchParams, "sort") ?? "featured";
  const maxPrice = Number(one(searchParams, "maxPrice") ?? "") || undefined;
  const inStock = one(searchParams, "inStock") === "1";
  const page = Math.max(1, Number(one(searchParams, "page") ?? "1") || 1);
  const perPage = 12;

  let categoryId: string | undefined;
  let activeCategoryName: string | undefined;
  if (categorySlug) {
    const cat = await db.category.findUnique({ where: { slug: categorySlug } });
    if (cat) {
      categoryId = cat.id;
      activeCategoryName = cat.name;
    }
  }

  const where = {
    status: "ACTIVE" as const,
    ...(categoryId ? { categoryId } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { shortDescription: { contains: q } },
            { description: { contains: q } },
            { tags: { contains: q } },
          ],
        }
      : {}),
    ...(maxPrice ? { priceCents: { lte: maxPrice * 100 } } : {}),
    ...(inStock ? { inventory: { quantity: { gt: 0 } } } : {}),
  };

  const orderBy =
    sort === "price-asc"
      ? [{ priceCents: "asc" as const }]
      : sort === "price-desc"
        ? [{ priceCents: "desc" as const }]
        : sort === "name"
          ? [{ name: "asc" as const }]
          : sort === "newest"
            ? [{ createdAt: "desc" as const }]
            : [{ isFeatured: "desc" as const }, { name: "asc" as const }];

  try {
    const [products, total, categories] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, inventory: true, category: true },
      }),
      db.product.count({ where }),
      db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

    const pages = Math.ceil(total / perPage);

    return (
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-6 lg:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="eyebrow">The counter</p>
          <h1 className="mt-2 font-display text-display-xl">{activeCategoryName ?? "Today's collection"}</h1>
          <p className="mt-4 text-bark">
            Everything is baked in small batches through the morning. Stock counts update as the day goes on —
            order early for the pieces you love.
          </p>
        </header>

        <FilterBar categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />

        {products.length === 0 ? (
          <div className="rounded-card border border-dashed border-espresso/20 py-20 text-center">
            <p className="font-display text-2xl">Nothing matches that just now</p>
            <p className="mt-2 text-sm text-cocoa/70">Try a different search, or clear your filters.</p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-xs uppercase tracking-[0.16em] text-cocoa/60">
              {total} item{total === 1 ? "" : "s"}
              {q ? ` matching “${q}”` : ""}
            </p>
            <ProductGrid
              products={products.map((p) => ({
                id: p.id,
                slug: p.slug,
                name: p.name,
                shortDescription: p.shortDescription,
                priceCents: p.priceCents,
                compareAtCents: p.compareAtCents,
                categoryName: p.category.name,
                image: p.images[0]?.url ?? null,
                stockQuantity: p.inventory?.quantity ?? 0,
                fallbackSrc: fallbackFor(p.slug),
              }))}
            />
            <Pagination page={page} pages={pages} />
          </>
        )}
      </div>
    );
  } catch (e) {
    console.error("[shop]", e);
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <p className="font-display text-2xl">We couldn&apos;t load the counter.</p>
        <p className="mt-2 text-sm text-cocoa/70">Please refresh the page in a moment.</p>
      </div>
    );
  }
}
