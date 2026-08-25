import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api-helpers";
import { productInputSchema } from "@/lib/validation";

async function loadProduct(id: string) {
  const product = await db.product.findUnique({ where: { id } });
  if (!product) throw new NotFoundError();
  return product;
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    await requireAdmin();
    const product = await db.product.findUnique({
      where: { id: ctx.params.id },
      include: { images: true, inventory: true },
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    await loadProduct(ctx.params.id);
    const data = productInputSchema.partial().parse(await readJson<unknown>(req));

    const product = await db.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: ctx.params.id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.slug !== undefined ? { slug: data.slug } : {}),
          ...(data.shortDescription !== undefined ? { shortDescription: data.shortDescription } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.priceCents !== undefined ? { priceCents: data.priceCents } : {}),
          ...(data.compareAtCents !== undefined ? { compareAtCents: data.compareAtCents ?? null } : {}),
          ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
          ...(data.ingredients !== undefined ? { ingredients: data.ingredients } : {}),
          ...(data.allergens !== undefined ? { allergens: data.allergens } : {}),
          ...(data.tags !== undefined ? { tags: data.tags } : {}),
          ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
        },
      });

      if (data.images) {
        await tx.productImage.deleteMany({ where: { productId: updated.id } });
        await tx.productImage.createMany({
          data: data.images.map((img, i) => ({ productId: updated.id, url: img.url, alt: img.alt, sortOrder: i })),
        });
      }

      if (data.inventory) {
        await tx.inventory.upsert({
          where: { productId: updated.id },
          create: { productId: updated.id, quantity: data.inventory.quantity, lowStockAt: data.inventory.lowStockAt },
          update: { quantity: data.inventory.quantity, lowStockAt: data.inventory.lowStockAt },
        });
      }
      return updated;
    });

    await db.activityLog.create({
      data: { actor: session.email, action: "product.updated", detail: `${product.name} (${product.id})` },
    });
    return NextResponse.json({ ok: true, product });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const product = await loadProduct(ctx.params.id);
    // Soft-delete by default to preserve order history integrity.
    await db.product.update({ where: { id: product.id }, data: { status: "ARCHIVED", isFeatured: false } });
    await db.activityLog.create({
      data: { actor: session.email, action: "product.archived", detail: `${product.name} (${product.id})` },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}

class NotFoundError extends Error {}
