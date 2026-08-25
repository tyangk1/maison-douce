import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";

/** Aggregates for the admin dashboard + basic analytics. */
export async function GET() {
  try {
    await requireAdmin();
    const now = new Date();
    const dayMs = 86_400_000;

    const [ordersAll, productsActive, lowStock, customersCount, subscribers, activity] = await Promise.all([
      db.order.findMany({
        where: { status: { not: "CANCELLED" } },
        select: { totalCents: true, createdAt: true, orderNumber: true },
        orderBy: { createdAt: "asc" },
      }),
      db.product.count({ where: { NOT: { status: "ARCHIVED" } } }),
      db.inventory.findMany({
        where: { quantity: { lte: 5 } },
        include: { product: { select: { name: true, slug: true, status: true } } },
        orderBy: { quantity: "asc" },
        take: 8,
      }),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.newsletterSubscriber.count(),
      db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    ]);

    const revenueCents = ordersAll.reduce((s, o) => s + o.totalCents, 0);
    const last30 = ordersAll.filter((o) => o.createdAt.getTime() > now.getTime() - 30 * dayMs);
    const prev30 = ordersAll.filter((o) => {
      const t = o.createdAt.getTime();
      return t <= now.getTime() - 30 * dayMs && t > now.getTime() - 60 * dayMs;
    });
    const revenue30 = last30.reduce((s, o) => s + o.totalCents, 0);
    const revenuePrev30 = prev30.reduce((s, o) => s + o.totalCents, 0);

    // Daily revenue for the last 14 days.
    const daily: { date: string; cents: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * dayMs);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + dayMs);
      daily.push({
        date: dayStart.toISOString().slice(0, 10),
        cents: ordersAll
          .filter((o) => o.createdAt >= dayStart && o.createdAt < dayEnd)
          .reduce((s, o) => s + o.totalCents, 0),
      });
    }

    // Popular products from order items.
    const items = await db.orderItem.findMany({
      where: { order: { status: { not: "CANCELLED" } } },
      select: { productName: true, quantity: true },
    });
    const counts = new Map<string, number>();
    for (const it of items) counts.set(it.productName, (counts.get(it.productName) ?? 0) + it.quantity);
    const popular = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, qty]) => ({ name, qty }));

    return NextResponse.json({
      kpis: {
        revenueCents,
        revenue30Cents: revenue30,
        revenueTrendPct:
          revenuePrev30 === 0 ? null : Math.round(((revenue30 - revenuePrev30) / revenuePrev30) * 100),
        ordersTotal: ordersAll.length,
        orders30: last30.length,
        avgOrderCents: ordersAll.length ? Math.round(revenueCents / ordersAll.length) : 0,
        customersCount,
        subscribers,
        productsActive,
      },
      daily,
      lowStock,
      popular,
      activity,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
