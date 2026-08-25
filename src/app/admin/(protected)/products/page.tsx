"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { adminInput, adminLabel } from "@/components/admin/admin-styles";
import { formatPrice } from "@/lib/money";

type Product = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  status: string;
  isFeatured: boolean;
  categoryId: string;
  shortDescription: string;
  description: string;
  ingredients: string;
  allergens: string;
  tags: string;
  images: { url: string; alt?: string }[];
  inventory?: { quantity: number; lowStockAt: number } | null;
};

type Category = { id: string; name: string };

const emptyForm = {
  id: "",
  name: "",
  shortDescription: "",
  description: "",
  pricePounds: "",
  categoryId: "",
  ingredients: "",
  allergens: "",
  tags: "",
  imageUrl: "",
  quantity: "0",
  lowStockAt: "5",
  isFeatured: false,
  status: "ACTIVE",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<typeof emptyForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState("");

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        fetch("/api/admin/products").then((r) => r.json()),
        fetch("/api/admin/categories").then((r) => r.json()),
      ]);
      setProducts(p.products ?? []);
      setCategories(c.categories ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setErrors({});
    setEditing({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
  }

  function openEdit(p: Product) {
    setErrors({});
    setEditing({
      id: p.id,
      name: p.name,
      shortDescription: p.shortDescription,
      description: p.description,
      pricePounds: (p.priceCents / 100).toFixed(2),
      categoryId: p.categoryId,
      ingredients: p.ingredients,
      allergens: p.allergens,
      tags: p.tags,
      imageUrl: p.images[0]?.url ?? "",
      quantity: String(p.inventory?.quantity ?? 0),
      lowStockAt: String(p.inventory?.lowStockAt ?? 5),
      isFeatured: p.isFeatured,
      status: p.status,
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setErrors({});
    const payload = {
      name: editing.name,
      shortDescription: editing.shortDescription,
      description: editing.description,
      priceCents: Math.round(Number(editing.pricePounds) * 100),
      categoryId: editing.categoryId,
      ingredients: editing.ingredients,
      allergens: editing.allergens,
      tags: editing.tags,
      isFeatured: editing.isFeatured,
      status: editing.status,
      images: [{ url: editing.imageUrl, alt: editing.name }],
      inventory: { quantity: Number(editing.quantity), lowStockAt: Number(editing.lowStockAt) },
    };
    try {
      const res = await fetch(editing.id ? `/api/admin/products/${editing.id}` : "/api/admin/products", {
        method: editing.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw Object.assign(new Error(data.error), { fields: data.fields });
      setBanner(editing.id ? "Product updated." : "Product created.");
      setEditing(null);
      load();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setErrors(((err as any).fields ?? {}) || { _: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(p: Product) {
    const next = p.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";
    await fetch(`/api/admin/products/${p.id}`, {
      method: next === "ARCHIVED" ? "DELETE" : "PATCH",
      headers: { "Content-Type": "application/json" },
      ...(next === "ACTIVE" ? { body: JSON.stringify({ status: "ACTIVE", images: p.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })), inventory: { quantity: p.inventory?.quantity ?? 0, lowStockAt: p.inventory?.lowStockAt ?? 5 } }) } : {}),
    });
    setBanner(next === "ARCHIVED" ? `${p.name} archived.` : `${p.name} restored.`);
    load();
  }

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(""), 3000);
    return () => clearTimeout(t);
  }, [banner]);

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-white/5" aria-busy="true" />;

  return (
    <>
      <AdminPageHeader
        title="Products"
        subtitle={`${products.length} products · ${products.filter((p) => p.status === "ARCHIVED").length} archived`}
        action={<button type="button" onClick={openCreate} className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-500">+ New product</button>}
      />

      {banner && <p role="status" className="mb-4 rounded-lg border border-emerald-800/50 bg-emerald-950/40 px-4 py-2.5 text-sm text-emerald-300">{banner}</p>}

      {editing && (
        <form onSubmit={save} noValidate className="mb-8 space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-lg">{editing.id ? `Edit — ${editing.name}` : "New product"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Name" required value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} error={errors.name} />
            <AdminField label="Price (£)" required type="number" step="0.01" min="0.5" value={editing.pricePounds} onChange={(v) => setEditing({ ...editing, pricePounds: v })} error={errors.priceCents} />
            <div>
              <label htmlFor="pr-cat" className={adminLabel}>Category *</label>
              <select id="pr-cat" required value={editing.categoryId} onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })} className={adminInput}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="pr-status" className={adminLabel}>Status</label>
              <select id="pr-status" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className={adminInput}>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
            <AdminField label="Short description" required value={editing.shortDescription} onChange={(v) => setEditing({ ...editing, shortDescription: v })} error={errors.shortDescription} />
            <AdminField label="Image URL" required placeholder="https://images.unsplash.com/…" value={editing.imageUrl} onChange={(v) => setEditing({ ...editing, imageUrl: v })} error={errors.images} />
            <AdminField label="Ingredients" textarea value={editing.ingredients} onChange={(v) => setEditing({ ...editing, ingredients: v })} />
            <AdminField label="Allergens" value={editing.allergens} onChange={(v) => setEditing({ ...editing, allergens: v })} />
            <AdminField label="Tags (comma separated)" value={editing.tags} onChange={(v) => setEditing({ ...editing, tags: v })} />
            <div className="grid grid-cols-2 gap-3">
              <AdminField label="Stock qty" type="number" min="0" value={editing.quantity} onChange={(v) => setEditing({ ...editing, quantity: v })} error={errors.inventory} />
              <AdminField label="Low stock at" type="number" min="0" value={editing.lowStockAt} onChange={(v) => setEditing({ ...editing, lowStockAt: v })} />
            </div>
          </div>
          <AdminField label="Full description *" textarea rows={4} value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} error={errors.description} />
          <label className="flex items-center gap-2.5 text-sm">
            <input type="checkbox" checked={editing.isFeatured} onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })} className="h-4 w-4 accent-amber-600" />
            Featured on homepage
          </label>
          {errors._ && <p role="alert" className="text-sm text-red-400">{errors._}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-black hover:bg-amber-500 disabled:opacity-50">
              {saving ? "Saving…" : "Save product"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-white/15 px-6 py-2.5 text-sm hover:bg-white/5">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th scope="col" className="px-5 py-3">Product</th>
              <th scope="col" className="px-5 py-3">Price</th>
              <th scope="col" className="px-5 py-3">Stock</th>
              <th scope="col" className="px-5 py-3">Status</th>
              <th scope="col" className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map((p) => (
              <tr key={p.id} className={p.status === "ARCHIVED" ? "opacity-40" : ""}>
                <td className="px-5 py-3">
                  <span className="font-medium">{p.name}</span>
                  {p.isFeatured && <span className="ml-2 rounded bg-amber-900/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-400">Featured</span>}
                  <span className="block text-xs text-stone-500">{p.slug}</span>
                </td>
                <td className="px-5 py-3">{formatPrice(p.priceCents)}</td>
                <td className="px-5 py-3">{p.inventory?.quantity ?? 0}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === "ACTIVE" ? "bg-emerald-950/60 text-emerald-400" : p.status === "DRAFT" ? "bg-white/10 text-stone-300" : "bg-white/5 text-stone-500"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right">
                  <button type="button" onClick={() => openEdit(p)} className="mr-3 text-amber-400 hover:underline">Edit</button>
                  <button type="button" onClick={() => toggleStatus(p)} className="text-stone-400 hover:text-red-400">
                    {p.status === "ARCHIVED" ? "Restore" : "Archive"}
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


function AdminField({
  label, value, onChange, type = "text", required, textarea, rows = 2, error, placeholder, step, min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
  error?: string;
  placeholder?: string;
  step?: string;
  min?: string;
}) {
  const id = `af-${label.replace(/[^a-z]/gi, "").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className={adminLabel}>{label}{required ? " *" : ""}</label>
      {textarea ? (
        <textarea id={id} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={adminInput} />
      ) : (
        <input id={id} type={type} step={step} min={min} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={adminInput} />
      )}
      {error && <p role="alert" className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

