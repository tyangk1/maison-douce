import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, readJson } from "@/lib/api-helpers";
import { promotionInputSchema } from "@/lib/validation";

export async function GET() {
  try {
    await requireAdmin();
    const promotions = await db.promotion.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ promotions });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const data = promotionInputSchema.parse(await readJson<unknown>(req));
    const clash = await db.promotion.findUnique({ where: { code: data.code } });
    if (clash) return NextResponse.json({ error: "This code already exists." }, { status: 409 });
    const promotion = await db.promotion.create({
      data: {
        ...data,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
    });
    await db.activityLog.create({ data: { actor: session.email, action: "promotion.created", detail: promotion.code } });
    return NextResponse.json({ ok: true, promotion });
  } catch (e) {
    return handleApiError(e);
  }
}
