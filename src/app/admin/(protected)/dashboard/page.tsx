"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { formatPrice } from "@/lib/money";

type Stats = {
  kpis: {
    revenueCents: number;
    revenue30Cents: number;
    revenueTrendPct: number | null;
    ordersTotal: number;
    orders30: number;
    avgOrderCents: number;
    customersCount: number;
    subscribers: number;
    productsActive: number;
  };
  daily: { date: string; cents: number }[];
  lowStock: { id: string; quantity: number; lowStockAt: number; product: { name: string; slug: string } }[];
  popular: { name: string; qty: number }[];
  activity: { id: string; actor: string; action: string; detail: string; createdAt: string }[];
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  if (error) return <p role="alert" className="text-sm text-red-400">Couldn&apos;t load dashboard data.</p>;
  if (!stats) return <SkeletonGrid />;

  const k = stats.kpis;
  const maxDaily = Math.max(...stats.daily.map((d) => d.cents), 1);

  return (
    <>
      <AdminPageHeader title="Dashboard" subtitle="Live view of the bakery's trading position." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Revenue (all time)" value={formatPrice(k.revenueCents)} sub={k.revenueTrendPct !== null ? `${k.revenueTrendPct >= 0 ? "▲" : "▼"} ${Math.abs(k.revenueTrendPct)}% vs previous 30 days` : "—"} trend={k.revenueTrendPct} />
        <Kpi label="Revenue (30 days)" value={formatPrice(k.revenue30Cents)} sub={`${k.orders30} orders`} />
        <Kpi label="Average order" value={formatPrice(k.avgOrderCents)} sub={`${k.ordersTotal} lifetime orders`} />
        <Kpi label="Customers" value={String(k.customersCount)} sub={`${k.subscribers} newsletter subscribers`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="rev-h" className="rounded-xl border border-white/10 bg-white/[0.02] p-6 lg:col-span-2">
          <h2 id="rev-h" className="text-sm font-semibold uppercase tracking-wider text-stone-400">Revenue · last 14 days</h2>
          <div className="mt-6 flex h-44 items-end gap-1.5" role="img" aria-label="Daily revenue bar chart for the last two weeks">
            {stats.daily.map((d) => (
              <div key={d.date} className="group relative flex-1">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-amber-800/60 to-amber-600 transition-all group-hover:from-amber-500/70"
                  style={{ height: `${Math.max((d.cents / maxDaily) * 160, 3)}px` }}
                />
                <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-black px-1.5 py-0.5 text-[10px] text-stone-200 group-hover:block">
                  {d.date.slice(5)} · {formatPrice(d.cents)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="low-h" className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h2 id="low-h" className="text-sm font-semibold uppercase tracking-wider text-stone-400">Low stock alerts</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {stats.lowStock.length === 0 && <li className="text-stone-500">All stock levels healthy.</li>}
            {stats.lowStock.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate">{i.product.name}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${i.quantity === 0 ? "bg-red-950/70 text-red-300" : "bg-amber-900/40 text-amber-300"}`}>
                  {i.quantity === 0 ? "Sold out" : `${i.quantity} left`}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="pop-h" className="rounded-xl border border-white/10 bg-white/[0.02] p-6 lg:col-span-1">
          <h2 id="pop-h" className="text-sm font-semibold uppercase tracking-wider text-stone-400">Popular products</h2>
          <ol className="mt-4 space-y-3 text-sm">
            {stats.popular.length === 0 && <li className="text-stone-500">No sales yet.</li>}
            {stats.popular.map((p, i) => (
              <li key={p.name} className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/5 text-xs font-semibold text-amber-400">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                <span className="text-stone-400">{p.qty}×</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="act-h" className="rounded-xl border border-white/10 bg-white/[0.02] p-6 lg:col-span-2">
          <h2 id="act-h" className="text-sm font-semibold uppercase tracking-wider text-stone-400">Recent activity</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {stats.activity.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline gap-x-3 border-b border-white/5 pb-2.5 last:border-0">
                <time dateTime={a.createdAt} className="shrink-0 text-[11px] text-stone-500">
                  {new Date(a.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </time>
                <span className="font-medium text-stone-300">{a.action}</span>
                <span className="text-stone-500">{a.detail} · {a.actor}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

function Kpi({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: number | null }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-2 font-display text-2xl sm:text-3xl">{value}</p>
      {sub && (
        <p className={`mt-1.5 text-xs ${trend != null ? (trend >= 0 ? "text-emerald-400" : "text-red-400") : "text-stone-500"}`}>{sub}</p>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div aria-busy="true">
      <div className="mb-8 h-9 w-52 animate-pulse rounded-lg bg-white/5" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-white/5" />)}
      </div>
      <div className="mt-6 h-64 animate-pulse rounded-xl bg-white/5" />
    </div>
  );
}
