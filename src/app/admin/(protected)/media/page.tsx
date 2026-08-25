"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-shell";

type MediaItem = { id: string; productId: string; url: string; alt: string };

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => {
        const media: MediaItem[] = (d.products ?? []).flatMap((p: { id: string; images: { id: string; url: string; alt: string }[] }) =>
          p.images.map((img) => ({ ...img, productId: p.id }))
        );
        setItems(media);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((m) => !filter || m.alt.toLowerCase().includes(filter.toLowerCase()) || m.url.includes(filter));

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-white/5" aria-busy="true" />;

  return (
    <>
      <AdminPageHeader
        title="Media library"
        subtitle={`${items.length} images in use across the catalog · ${broken.size} failed to load`}
        action={
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by alt text or URL…"
            aria-label="Filter media"
            className="rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm outline-none focus:border-amber-600/70"
          />
        }
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((m) => (
          <figure key={m.id} className={`overflow-hidden rounded-xl border ${broken.has(m.id) ? "border-red-900/60" : "border-white/10"} bg-white/[0.02]`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.url}
              alt={m.alt}
              loading="lazy"
              onError={() => setBroken((b) => new Set(b).add(m.id))}
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="p-3 text-xs">
              <p className="truncate font-medium text-stone-300">{m.alt || <span className="italic text-stone-500">No alt text</span>}</p>
              <p className="mt-0.5 truncate text-stone-500">{new URL(m.url).pathname.split("/").pop()}</p>
              {broken.has(m.id) && <p className="mt-1 text-red-400">Failed to load — replace this URL.</p>}
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
