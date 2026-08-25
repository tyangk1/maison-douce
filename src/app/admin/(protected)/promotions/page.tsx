"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { formatPrice } from "@/lib/money";

type Promo = {
  id: string;
  code: string;
  title: string;
  description: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minSubtotalCents: number;
  active: boolean;
  endsAt?: string | null;
  usages?: number;
};

const inputCls = "w-full rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm outline-none transition focus:border-amber-600/70 focus:ring-2 focus:ring-amber-700/25";

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [form, setForm] = useState({ code: "", title: "", type: "PERCENT", value: "10", minSpend: "0", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await fetch("/api/admin/promotions").then((r) => r.json());
      setPromos(d.promotions ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        title: form.title,
        description: form.description,
        type: form.type,
        value: form.type === "PERCENT" ? Number(form.value) : Math.round(Number(form.value) * 100),
        minSubtotalCents: Math.round(Number(form.minSpend || 0) * 100),
        active: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.fields ? Object.values(data.fields).join(", ") : data.error); return; }
    setForm({ code: "", title: "", type: "PERCENT", value: "10", minSpend: "0", description: "" });
    load();
  }

  async function toggle(p: Promo) {
    await fetch(`/api/admin/promotions/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    load();
  }

  async function remove(p: Promo) {
    await fetch(`/api/admin/promotions/${p.id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-white/5" aria-busy="true" />;

  return (
    <>
      <AdminPageHeader title="Promotions" subtitle="Campaign codes applied at checkout." />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th scope="col" className="px-5 py-3">Code</th>
                <th scope="col" className="px-5 py-3">Offer</th>
                <th scope="col" className="px-5 py-3">Min spend</th>
                <th scope="col" className="px-5 py-3">State</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {promos.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-mono font-medium text-amber-400">{p.code}</td>
                  <td className="px-5 py-3">
                    {p.title}
                    <span className="block text-xs text-stone-500">
                      {p.type === "PERCENT" ? `${p.value}% off` : `${formatPrice(p.value)} off`}
                      {typeof p.usages === "number" && p.usages > 0 ? ` · ${p.usages} redemption${p.usages === 1 ? "" : "s"}` : ""}
                    </span>
                  </td>
                  <td className="px-5 py-3">{formatPrice(p.minSubtotalCents)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.active ? "bg-emerald-950/60 text-emerald-400" : "bg-white/5 text-stone-500"}`}>
                      {p.active ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <button type="button" onClick={() => toggle(p)} className="mr-3 text-amber-400 hover:underline">{p.active ? "Pause" : "Activate"}</button>
                    <button type="button" onClick={() => remove(p)} className="text-stone-400 hover:text-red-400">Delete</button>
                  </td>
                </tr>
              ))}
              {promos.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-stone-500">No campaigns yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <form onSubmit={create} className="h-fit space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-lg">New campaign</h2>
          <div>
            <label htmlFor="pr-code" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Code *</label>
            <input id="pr-code" required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SPRING25" className={`${inputCls} font-mono uppercase`} />
          </div>
          <div>
            <label htmlFor="pr-title" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Title *</label>
            <input id="pr-title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pr-type" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Type</label>
              <select id="pr-type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={inputCls}>
                <option value="PERCENT">% off</option>
                <option value="FIXED">£ off</option>
              </select>
            </div>
            <div>
              <label htmlFor="pr-value" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Value *</label>
              <input id="pr-value" required type="number" step="0.01" min="0.01" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div>
            <label htmlFor="pr-min" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Minimum spend (£)</label>
            <input id="pr-min" type="number" step="0.01" min="0" value={form.minSpend} onChange={(e) => setForm((f) => ({ ...f, minSpend: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label htmlFor="pr-desc" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Description</label>
            <textarea id="pr-desc" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputCls} />
          </div>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <button type="submit" className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-500">Create campaign</button>
        </form>
      </div>
    </>
  );
}
