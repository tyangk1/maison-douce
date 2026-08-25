import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api-helpers";
import { productInputSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
    const products = await db.product.findMany({
      include: { category: true, images: true, inventory: true },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ products });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const data = productInputSchema.parse(await readJson<unknown>(req));
    let slug = data.slug ? slugify(data.slug) : slugify(data.name);
    if (!slug) slug = `product-${Date.now()}`;
    const clash = await db.product.findUnique({ where: { slug } });
    if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;

    const product = await db.product.create({
      data: {
        name: data.name,
        slug,
        shortDescription: data.shortDescription,
        description: data.description,
        priceCents: data.priceCents,
        compareAtCents: data.compareAtCents ?? null,
        categoryId: data.categoryId,
        ingredients: data.ingredients,
        allergens: data.allergens,
        nutrition: "{}",
        tags: data.tags,
        isFeatured: data.isFeatured,
        status: data.status,
        images: { create: data.images.map((img, i) => ({ ...img, sortOrder: i })) },
        inventory: {
          create: { quantity: data.inventory.quantity, lowStockAt: data.inventory.lowStockAt },
        },
      },
    });
    await db.activityLog.create({
      data: { actor: session.email, action: "product.created", detail: `${product.name} (${product.id})` },
    });
    return NextResponse.json({ ok: true, product });
  } catch (e) {
    return handleApiError(e);
  }
}
