import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { orderStatusValues } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const sp = req.nextUrl.searchParams;
    const status = sp.get("status");
    const q = sp.get("q")?.trim() ?? "";
    const page = Math.max(1, Number(sp.get("page") ?? "1") || 1);
    const perPage = 15;

    const where = {
      ...(status && orderStatusValues.includes(status as (typeof orderStatusValues)[number])
        ? { status }
        : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q } },
              { email: { contains: q } },
              { customerName: { contains: q } },
            ],
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: { items: true, payment: true },
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, pages: Math.ceil(total / perPage) });
  } catch (e) {
    return handleApiError(e);
  }
}
