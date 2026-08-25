"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { formatPrice } from "@/lib/money";

type Order = {
  id: string;
  orderNumber: string;
  email: string;
  customerName: string;
  phone: string;
  fulfilment: string;
  addressLine1?: string | null;
  city?: string | null;
  postcode?: string | null;
  promoCode?: string | null;
  subtotalCents: number;
  deliveryCents: number;
  discountCents: number;
  totalCents: number;
  status: string;
  createdAt: string;
  items: { id: string; productName: string; quantity: number; unitCents: number }[];
  payment?: { provider: string; status: string; reference: string } | null;
};

const STATUSES = ["PENDING", "PAID", "BAKING", "READY", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"] as const;

const statusStyle: Record<string, string> = {
  PENDING: "bg-white/10 text-stone-300",
  PAID: "bg-sky-950/60 text-sky-300",
  BAKING: "bg-amber-900/40 text-amber-300",
  READY: "bg-violet-950/50 text-violet-300",
  OUT_FOR_DELIVERY: "bg-blue-950/50 text-blue-300",
  COMPLETED: "bg-emerald-950/60 text-emerald-400",
  CANCELLED: "bg-red-950/60 text-red-300",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.set("status", statusFilter);
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders ?? []);
      setPages(data.pages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(order: Order, status: string) {
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <>
      <AdminPageHeader title="Orders" subtitle="Fulfilment pipeline — update statuses as orders move through the bakery." />

      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search number, name or email…"
          aria-label="Search orders"
          className="min-w-[220px] flex-1 rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm outline-none focus:border-amber-600/70"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          aria-label="Filter by status"
          className="rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm outline-none focus:border-amber-600/70"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-xl bg-white/5" aria-busy="true" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th scope="col" className="px-5 py-3">Order</th>
                <th scope="col" className="px-5 py-3">Customer</th>
                <th scope="col" className="px-5 py-3">Type</th>
                <th scope="col" className="px-5 py-3">Total</th>
                <th scope="col" className="px-5 py-3">Status</th>
                <th scope="col" className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <span className="font-mono">{o.orderNumber}</span>
                    <span className="block text-xs text-stone-500">
                      {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {o.customerName}
                    <span className="block text-xs text-stone-500">{o.email}</span>
                  </td>
                  <td className="px-5 py-3 text-xs uppercase tracking-wider text-stone-400">
                    {o.fulfilment === "PICKUP" ? "Pickup" : "Delivery"}
                  </td>
                  <td className="px-5 py-3 font-medium">{formatPrice(o.totalCents)}</td>
                  <td className="px-5 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => changeStatus(o, e.target.value)}
                      aria-label={`Status for ${o.orderNumber}`}
                      className={`rounded-full border-none px-2.5 py-1 text-xs font-semibold outline-none ${statusStyle[o.status] ?? ""}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await fetch(`/api/admin/orders/${o.id}`);
                        if (res.ok) setSelected((await res.json()).order);
                      }}
                      className="text-amber-400 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-stone-500">No orders match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-4 flex justify-center gap-3 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-white/15 px-4 py-2 disabled:opacity-30">Previous</button>
          <span className="py-2 text-stone-400">Page {page} / {pages}</span>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-white/15 px-4 py-2 disabled:opacity-30">Next</button>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" role="dialog" aria-modal="true" aria-label={`Order ${selected.orderNumber}`}>
          <button type="button" aria-label="Close" className="flex-1 cursor-default" onClick={() => setSelected(null)} />
          <div className="h-full w-full max-w-lg overflow-y-auto border-l border-white/10 bg-[#191410] p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-lg">{selected.orderNumber}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {new Date(selected.createdAt).toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label="Close order detail">✕</button>
            </div>

            <section className="mt-6 rounded-xl border border-white/10 p-5 text-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Customer</h2>
              <p className="mt-2 font-medium">{selected.customerName}</p>
              <p className="text-stone-400">{selected.email} · {selected.phone}</p>
              {selected.addressLine1 && (
                <p className="mt-1 text-stone-400">{selected.addressLine1}, {selected.city} {selected.postcode}</p>
              )}
              <p className="mt-2 inline-flex rounded-full bg-white/5 px-2.5 py-1 text-xs uppercase tracking-wider text-stone-300">
                {selected.fulfilment === "PICKUP" ? "Collection in bakery" : "Courier delivery"}
              </p>
            </section>

            <section className="mt-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Items</h2>
              <ul className="mt-2 divide-y divide-white/5 text-sm">
                {selected.items.map((i) => (
                  <li key={i.id} className="flex justify-between py-2.5">
                    <span>{i.quantity} × {i.productName}</span>
                    <span>{formatPrice(i.unitCents * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-sm">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(selected.subtotalCents)}</dd></div>
                {selected.discountCents > 0 && (
                  <div className="flex justify-between text-emerald-400"><dt>Discount {selected.promoCode ? `(${selected.promoCode})` : ""}</dt><dd>−{formatPrice(selected.discountCents)}</dd></div>
                )}
                <div className="flex justify-between text-stone-400"><dt>Delivery</dt><dd>{formatPrice(selected.deliveryCents)}</dd></div>
                <div className="flex justify-between border-t border-white/10 pt-2 font-semibold"><dt>Total</dt><dd>{formatPrice(selected.totalCents)}</dd></div>
              </dl>
              {selected.payment && (
                <p className="mt-2 text-[11px] text-stone-500">
                  Payment via <code>{selected.payment.provider}</code> · {selected.payment.status} · ref <code className="break-all">{selected.payment.reference}</code>
                </p>
              )}
            </section>

            <section className="mt-6">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">Update status</h2>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { changeStatus(selected, s); setSelected({ ...selected, status: s }); }}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${selected.status === s ? statusStyle[s] + " ring-1 ring-white/25" : "border border-white/15 text-stone-400 hover:bg-white/5"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
