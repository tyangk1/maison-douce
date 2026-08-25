import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api-helpers";
import { orderUpdateSchema } from "@/lib/validation";

/** Order detail + status transitions. Admin-role enforced server-side. */
export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    await requireAdmin();
    const order = await db.order.findUnique({
      where: { id: ctx.params.id },
      include: { items: true, payment: true },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const existing = await db.order.findUnique({ where: { id: ctx.params.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = orderUpdateSchema.parse(await readJson<unknown>(req));
    const order = await db.order.update({
      where: { id: ctx.params.id },
      data: { status: data.status },
      include: { items: true },
    });

    // Restock when an order is cancelled after payment.
    if (data.status === "CANCELLED" && existing.status !== "CANCELLED" && existing.status !== "PENDING") {
      for (const item of order.items) {
        await db.inventory.updateMany({
          where: { productId: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      }
    }

    await db.activityLog.create({
      data: { actor: session.email, action: "order.status_changed", detail: `${order.orderNumber} → ${data.status}` },
    });
    return NextResponse.json({ ok: true, order });
  } catch (e) {
    return handleApiError(e);
  }
}
