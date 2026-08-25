import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getVerifiedSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getVerifiedSession();
    if (!session) return NextResponse.json({ orders: [] });
    const orders = await db.order.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: { items: true, payment: true },
    });
    return NextResponse.json({ orders });
  } catch (e) {
    return handleApiError(e);
  }
}
