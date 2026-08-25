import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api-helpers";

const bodySchema = z.object({
  productIds: z.array(z.string()).max(200),
});

/** Syncs the client wishlist for the signed-in user (server-validated). */
export async function PUT(req: Request) {
  try {
    const session = await requireUser();
    const { productIds } = bodySchema.parse(await readJson<unknown>(req));

    const validProducts = await db.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      select: { id: true },
    });
    const validIds = new Set(validProducts.map((p) => p.id));

    const wishlist = await db.wishlist.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId },
      update: {},
      include: { items: true },
    });

    await db.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId: { notIn: [...validIds] } },
    });
    const existingIds = new Set(
      (await db.wishlistItem.findMany({ where: { wishlistId: wishlist.id }, select: { productId: true } })).map(
        (i) => i.productId
      )
    );
    const toAdd = [...validIds].filter((id) => !existingIds.has(id));
    if (toAdd.length) {
      await db.wishlistItem.createMany({
        data: toAdd.map((productId) => ({ wishlistId: wishlist.id, productId })),
      });
    }

    return NextResponse.json({ ok: true, productIds: [...validIds] });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function GET() {
  try {
    const session = await requireUser();
    const wishlist = await db.wishlist.findUnique({
      where: { userId: session.userId },
      include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
    });
    return NextResponse.json({
      productIds: wishlist?.items.map((i) => i.productId) ?? [],
    });
  } catch (e) {
    return handleApiError(e);
  }
}
