import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Public catalog search. Read-only and scoped to ACTIVE products only.
 * Supports: q, category, sort, min/max price (pounds), featured, page.
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const q = sp.get("q")?.trim() ?? "";
    const category = sp.get("category") ?? "";
    const sort = sp.get("sort") ?? "featured";
    const minPrice = Number(sp.get("minPrice") ?? "");
    const maxPrice = Number(sp.get("maxPrice") ?? "");
    const featured = sp.get("featured") === "1";
    const inStock = sp.get("inStock") === "1";
    const page = Math.max(1, Number(sp.get("page") ?? "1") || 1);
    const perPage = Math.min(48, Math.max(1, Number(sp.get("perPage") ?? "12") || 12));

    let categoryId: string | undefined;
    if (category) {
      const cat = await db.category.findUnique({ where: { slug: category } });
      if (!cat) return NextResponse.json({ products: [], total: 0, page, pages: 0 });
      categoryId = cat.id;
    }

    const where = {
      status: "ACTIVE" as const,
      ...(categoryId ? { categoryId } : {}),
      ...(featured ? { isFeatured: true } : {}),
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
      ...(!Number.isNaN(minPrice) && sp.get("minPrice") ? { priceCents: { gte: Math.round(minPrice * 100) } } : {}),
      ...(!Number.isNaN(maxPrice) && sp.get("maxPrice")
        ? { priceCents: { ...(sp.get("minPrice") ? { gte: Math.round(minPrice * 100) } : {}), lte: Math.round(maxPrice * 100) } }
        : {}),
      ...(inStock ? { inventory: { quantity: { gt: 0 } } } : {}),
    };

    const orderBy =
      sort === "price-asc"
        ? { priceCents: "asc" as const }
        : sort === "price-desc"
          ? { priceCents: "desc" as const }
          : sort === "name"
            ? { name: "asc" as const }
            : sort === "newest"
              ? { createdAt: "desc" as const }
              : [{ isFeatured: "desc" as const }, { name: "asc" as const }];

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          inventory: true,
        },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        shortDescription: p.shortDescription,
        priceCents: p.priceCents,
        compareAtCents: p.compareAtCents,
        categoryName: p.category.name,
        categorySlug: p.category.slug,
        image: p.images[0]?.url ?? null,
        stockQuantity: p.inventory?.quantity ?? 0,
        isFeatured: p.isFeatured,
        tags: p.tags,
      })),
      total,
      page,
      pages: Math.ceil(total / perPage),
    });
  } catch (e) {
    console.error("[products]", e);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
