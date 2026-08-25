"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-shell";

type Category = { id: string; name: string; slug: string; description: string; sortOrder: number; _count: { products: number } };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", description: "", sortOrder: "0" });
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await fetch("/api/admin/categories").then((r) => r.json());
    setCategories(data.categories ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, description: form.description, sortOrder: Number(form.sortOrder) }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed"); return; }
    setForm({ name: "", description: "", sortOrder: "0" });
    setEditingId(null);
    load();
  }

  async function remove(c: Category) {
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Cannot delete"); // inline error would be better; keep simple
      return;
    }
    load();
  }

  return (
    <>
      <AdminPageHeader title="Categories" subtitle="Storefront navigation groups." />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th scope="col" className="px-5 py-3">Name</th>
                <th scope="col" className="px-5 py-3">Slug</th>
                <th scope="col" className="px-5 py-3">Products</th>
                <th scope="col" className="px-5 py-3">Order</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-stone-400">{c.slug}</td>
                  <td className="px-5 py-3">{c._count.products}</td>
                  <td className="px-5 py-3">{c.sortOrder}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <button type="button" onClick={() => { setEditingId(c.id); setForm({ name: c.name, description: c.description, sortOrder: String(c.sortOrder) }); }} className="mr-3 text-amber-400 hover:underline">Edit</button>
                    <button type="button" onClick={() => remove(c)} className="text-stone-400 hover:text-red-400">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={save} className="h-fit space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-lg">{editingId ? "Edit category" : "New category"}</h2>
          <div>
            <label htmlFor="cat-name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Name *</label>
            <input id="cat-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label htmlFor="cat-desc" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Description</label>
            <textarea id="cat-desc" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label htmlFor="cat-sort" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Sort order</label>
            <input id="cat-sort" type="number" min="0" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} className={inputCls} />
          </div>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-500">{editingId ? "Save" : "Create"}</button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", description: "", sortOrder: "0" }); }} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm hover:bg-white/5">Cancel</button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

const inputCls = "w-full rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm outline-none transition focus:border-amber-600/70 focus:ring-2 focus:ring-amber-700/25";
