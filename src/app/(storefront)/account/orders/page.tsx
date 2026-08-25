import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { AccountNav } from "@/components/store/account-nav";

export const metadata: Metadata = { title: "Order history" };
export const dynamic = "force-dynamic";

const statusCopy: Record<string, string> = {
  PENDING: "Awaiting payment",
  PAID: "Payment received",
  BAKING: "In the oven",
  READY: "Ready for collection",
  OUT_FOR_DELIVERY: "On its way",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default async function OrdersPage() {
  let session = null;
  try {
    session = await requireUser();
  } catch {
    return null;
  }

  const orders = await db.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 font-display text-display-xl">Order history</h1>
        </div>
        <AccountNav />
      </header>

      {orders.length === 0 ? (
        <div className="rounded-card border border-dashed border-espresso/20 py-16 text-center text-sm text-cocoa/70">
          No orders yet. <Link href="/shop" className="underline hover:text-espresso">Find something delicious</Link>.
        </div>
      ) : (
        <ul className="space-y-5">
          {orders.map((o) => (
            <li key={o.id} className="rounded-card border border-espresso/10 bg-white/70 p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-medium">{o.orderNumber}</p>
                  <p className="mt-1 text-xs text-cocoa/65">
                    {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
                    {o.fulfilment === "PICKUP" ? "Collection" : "Delivery"}
                    {o.addressLine1 ? ` · ${o.addressLine1}, ${o.city}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${o.status === "CANCELLED" ? "bg-red-50 text-red-800" : o.status === "COMPLETED" ? "bg-sage/15 text-sage" : "bg-caramel/15 text-bark"}`}>
                    {statusCopy[o.status] ?? o.status}
                  </span>
                  <span className="font-semibold">{formatPrice(o.totalCents)}</span>
                </div>
              </div>
              <ul className="mt-4 divide-y divide-espresso/8 border-t border-espresso/10 pt-2 text-sm">
                {o.items.map((i) => (
                  <li key={i.id} className="flex justify-between py-2">
                    <span className="text-cocoa/85">{i.quantity} × {i.productName}</span>
                    <span>{formatPrice(i.unitCents * i.quantity)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
