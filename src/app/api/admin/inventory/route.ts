import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api-helpers";

export async function GET() {
  try {
    await requireAdmin();
    const inventory = await db.inventory.findMany({
      include: { product: { select: { name: true, slug: true, status: true } } },
      orderBy: [{ quantity: "asc" }],
    });
    return NextResponse.json({ inventory });
  } catch (e) {
    return handleApiError(e);
  }
}

const patchSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(0).max(10000),
  lowStockAt: z.number().int().min(0).max(1000).optional(),
});

/** Inventory adjustments — the only write path for stock levels. */
export async function PATCH(req: Request) {
  try {
    const session = await requireAdmin();
    const data = patchSchema.parse(await readJson<unknown>(req));
    const inv = await db.inventory.upsert({
      where: { productId: data.productId },
      create: {
        productId: data.productId,
        quantity: data.quantity,
        lowStockAt: data.lowStockAt ?? 5,
      },
      update: {
        quantity: data.quantity,
        ...(data.lowStockAt !== undefined ? { lowStockAt: data.lowStockAt } : {}),
        bakedOn: new Date(),
      },
    });
    await db.activityLog.create({
      data: { actor: session.email, action: "inventory.adjusted", detail: `product ${data.productId} → ${data.quantity}` },
    });
    return NextResponse.json({ ok: true, inventory: inv });
  } catch (e) {
    return handleApiError(e);
  }
}
