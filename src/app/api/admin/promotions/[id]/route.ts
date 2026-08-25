import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api-helpers";
import { promotionInputSchema } from "@/lib/validation";

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const existing = await db.promotion.findUnique({ where: { id: ctx.params.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = promotionInputSchema.partial().parse(await readJson<unknown>(req));
    const promotion = await db.promotion.update({
      where: { id: ctx.params.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
        ...(data.value !== undefined ? { value: data.value } : {}),
        ...(data.minSubtotalCents !== undefined ? { minSubtotalCents: data.minSubtotalCents } : {}),
        ...(data.endsAt !== undefined ? { endsAt: data.endsAt ? new Date(data.endsAt) : null } : {}),
      },
    });
    await db.activityLog.create({ data: { actor: session.email, action: "promotion.updated", detail: promotion.code } });
    return NextResponse.json({ ok: true, promotion });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const promo = await db.promotion.findUnique({ where: { id: ctx.params.id } });
    if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await db.promotion.delete({ where: { id: ctx.params.id } });
    await db.activityLog.create({ data: { actor: session.email, action: "promotion.deleted", detail: promo.code } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
