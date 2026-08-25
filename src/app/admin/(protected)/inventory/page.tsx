"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-shell";

type InventoryRow = {
  id: string;
  productId: string;
  quantity: number;
  lowStockAt: number;
  bakedOn?: string | null;
  product: { name: string; slug: string; status: string };
};

export default function AdminInventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savedId, setSavedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetch("/api/admin/inventory").then((r) => r.json());
      setRows(data.inventory ?? []);
      setDrafts(Object.fromEntries((data.inventory ?? []).map((r: InventoryRow) => [r.productId, String(r.quantity)])));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(row: InventoryRow) {
    const quantity = Number(drafts[row.productId]);
    if (Number.isNaN(quantity) || quantity < 0) return;
    await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: row.productId, quantity }),
    });
    setSavedId(row.productId);
    setTimeout(() => setSavedId(null), 1600);
    load();
  }

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-white/5" aria-busy="true" />;

  return (
    <>
      <AdminPageHeader title="Inventory" subtitle="Daily stock counts. Saving also stamps the item as baked today." />
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th scope="col" className="px-5 py-3">Product</th>
              <th scope="col" className="px-5 py-3">Baked</th>
              <th scope="col" className="px-5 py-3">Low-stock threshold</th>
              <th scope="col" className="w-44 px-5 py-3">Quantity</th>
              <th scope="col" className="px-5 py-3 text-right">Save</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3">
                  {r.product.name}
                  {r.product.status === "ARCHIVED" && <span className="ml-2 text-xs text-stone-600">(archived)</span>}
                </td>
                <td className="px-5 py-3 text-xs text-stone-400">
                  {r.bakedOn ? new Date(r.bakedOn).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                </td>
                <td className="px-5 py-3 text-stone-400">{r.lowStockAt}</td>
                <td className="px-5 py-3">
                  <input
                    type="number"
                    min="0"
                    value={drafts[r.productId] ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [r.productId]: e.target.value }))}
                    aria-label={`Quantity for ${r.product.name}`}
                    className={`w-full rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-amber-600/70 ${Number(r.quantity) <= r.lowStockAt ? "border-red-800/60 bg-black/40" : "border-white/15 bg-black/30"} ${savedId === r.productId ? "ring-2 ring-emerald-700/50" : ""}`}
                  />
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => save(r)}
                    disabled={(drafts[r.productId] ?? "") === String(r.quantity)}
                    className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-25"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
