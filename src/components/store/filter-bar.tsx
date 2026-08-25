"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

type Category = { slug: string; name: string };

export function FilterBar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");

  const activeCategory = sp.get("category") ?? "";
  const sort = sp.get("sort") ?? "featured";
  const inStock = sp.get("inStock") === "1";
  const maxPrice = sp.get("maxPrice") ?? "";

  function update(next: Record<string, string | null>) {
    const params = new URLSearchParams(sp.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    startTransition(() => router.push(`/shop?${params.toString()}`, { scroll: false }));
  }

  // Debounced search
  useEffect(() => {
    const current = sp.get("q") ?? "";
    if (q === current) return;
    const t = setTimeout(() => {
      const params = new URLSearchParams(sp.toString());
      if (q) params.set("q", q);
      else params.delete("q");
      params.delete("page");
      startTransition(() => router.push(`/shop?${params.toString()}`, { scroll: false }));
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className={cn("mb-10 space-y-5", pending && "opacity-70 transition-opacity")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa/50" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4.5 4.5" />
          </svg>
          <label htmlFor="shop-search" className="sr-only">Search products</label>
          <input
            id="shop-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search croissants, sourdough, tarts…"
            className="input-field rounded-full !pl-11"
          />
        </div>
        <div className="flex gap-3">
          <label htmlFor="shop-sort" className="sr-only">Sort</label>
          <select
            id="shop-sort"
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="input-field rounded-full !w-auto"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price · low to high</option>
            <option value="price-desc">Price · high to low</option>
            <option value="name">Name A–Z</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <CategoryPill label="All" active={!activeCategory} onClick={() => update({ category: null })} />
        {categories.map((c) => (
          <CategoryPill
            key={c.slug}
            label={c.name}
            active={activeCategory === c.slug}
            onClick={() => update({ category: c.slug })}
          />
        ))}

        <span className="mx-1 hidden h-5 w-px bg-espresso/15 sm:block" aria-hidden />

        <button
          type="button"
          aria-pressed={inStock}
          onClick={() => update({ inStock: inStock ? null : "1" })}
          className={cn(
            "rounded-full border px-4 py-1.5 text-xs font-medium transition",
            inStock ? "border-sage bg-sage/20 text-espresso" : "border-espresso/15 hover:border-espresso"
          )}
        >
          In stock only
        </button>

        <label htmlFor="max-price" className="sr-only">Maximum price</label>
        <select
          id="max-price"
          value={maxPrice}
          onChange={(e) => update({ maxPrice: e.target.value || null })}
          className="rounded-full border border-espresso/15 px-4 py-1.5 text-xs font-medium focus:border-caramel focus:outline-none"
        >
          <option value="">Any price</option>
          <option value="5">Under £5</option>
          <option value="15">Under £15</option>
          <option value="30">Under £30</option>
        </select>
      </div>
    </div>
  );
}

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-espresso bg-espresso text-parchment shadow-card"
          : "border-espresso/15 bg-transparent hover:border-espresso"
      )}
    >
      {label}
    </button>
  );
}

export function Pagination({ page, pages }: { page: number; pages: number }) {
  const router = useRouter();
  const sp = useSearchParams();
  if (pages <= 1) return null;

  function go(p: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(p));
    router.push(`/shop?${params.toString()}`, { scroll: true });
  }

  return (
    <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => go(page - 1)} className="btn-secondary !px-4 !py-2 disabled:opacity-30">
        Previous
      </button>
      <span className="px-4 text-sm text-cocoa/80">
        Page {page} of {pages}
      </span>
      <button type="button" disabled={page >= pages} onClick={() => go(page + 1)} className="btn-secondary !px-4 !py-2 disabled:opacity-30">
        Next
      </button>
    </nav>
  );
}
