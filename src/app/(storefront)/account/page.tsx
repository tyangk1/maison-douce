import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { AccountNav } from "@/components/store/account-nav";

export const metadata: Metadata = { title: "My account" };
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

export default async function AccountPage() {
  let session = null;
  try {
    session = await requireUser();
  } catch {
    return null; // middleware redirects
  }

  const [orders, wishlist] = await Promise.all([
    db.order.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" }, take: 3, include: { items: true } }),
    db.wishlist.findUnique({ where: { userId: session.userId }, include: { items: true } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 font-display text-display-xl">Bonjour, {session.name.split(" ")[0]}.</h1>
        </div>
        <AccountNav />
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-card border border-espresso/10 bg-white/70 p-6 shadow-card">
          <p className="text-xs uppercase tracking-[0.16em] text-cocoa/60">Orders</p>
          <p className="mt-2 font-display text-3xl">{orders.length}</p>
          <Link href="/account/orders" className="mt-3 inline-block text-sm underline underline-offset-2 hover:text-espresso">View all orders</Link>
        </div>
        <div className="rounded-card border border-espresso/10 bg-white/70 p-6 shadow-card">
          <p className="text-xs uppercase tracking-[0.16em] text-cocoa/60">Favourites</p>
          <p className="mt-2 font-display text-3xl">{wishlist?.items.length ?? 0}</p>
          <Link href="/account/wishlist" className="mt-3 inline-block text-sm underline underline-offset-2 hover:text-espresso">View favourites</Link>
        </div>
        <div className="rounded-card border border-espresso/10 bg-white/70 p-6 shadow-card">
          <p className="text-xs uppercase tracking-[0.16em] text-cocoa/60">Member since</p>
          <p className="mt-2 font-display text-3xl">{new Date().getFullYear()}</p>
          <Link href="/account/profile" className="mt-3 inline-block text-sm underline underline-offset-2 hover:text-espresso">Manage profile</Link>
        </div>
      </div>

      <section className="mt-12" aria-labelledby="recent-orders-h">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="recent-orders-h" className="font-display text-xl">Recent orders</h2>
          <Link href="/shop" className="text-sm underline underline-offset-2 hover:text-espresso">Shop again</Link>
        </div>
        {orders.length === 0 ? (
          <div className="rounded-card border border-dashed border-espresso/20 py-14 text-center text-sm text-cocoa/70">
            No orders yet — your first box is waiting.
            <span className="block"><Link href="/shop" className="btn-primary mt-5 inline-flex">Start shopping</Link></span>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-espresso/10 bg-white/70 p-5 shadow-card">
                <div>
                  <p className="font-mono text-sm">{o.orderNumber}</p>
                  <p className="mt-1 text-xs text-cocoa/65">
                    {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                    {o.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-5">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${o.status === "CANCELLED" ? "bg-red-50 text-red-800" : o.status === "COMPLETED" ? "bg-sage/15 text-sage" : "bg-caramel/15 text-bark"}`}>
                    {statusCopy[o.status] ?? o.status}
                  </span>
                  <span className="font-semibold">{formatPrice(o.totalCents)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
