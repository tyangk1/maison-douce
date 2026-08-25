import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";

/** Customer overview — aggregates spend per account. Read-only. */
export async function GET() {
  try {
    await requireAdmin();
    const users = await db.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        addresses: true,
        orders: { select: { totalCents: true, status: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const customers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt,
      addressCount: u.addresses.length,
      orderCount: u.orders.filter((o) => o.status !== "CANCELLED").length,
      lifetimeCents: u.orders
        .filter((o) => o.status !== "CANCELLED")
        .reduce((s, o) => s + o.totalCents, 0),
      lastOrderAt: u.orders.map((o) => o.createdAt).sort((a, b) => b.getTime() - a.getTime())[0] ?? null,
    }));
    return NextResponse.json({ customers });
  } catch (e) {
    return handleApiError(e);
  }
}
