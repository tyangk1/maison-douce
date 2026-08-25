"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-shell";

type HeroContent = {
  eyebrow: string;
  titleLines: string[];
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
};
type Story = { title: string; body: string };

const inputCls = "w-full rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm outline-none transition focus:border-amber-600/70 focus:ring-2 focus:ring-amber-700/25";

export default function AdminContentPage() {
  const [announcement, setAnnouncement] = useState("");
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((d) => {
        setAnnouncement(d.content.announcement ?? "");
        setHero(d.content.hero ?? null);
        setStory(d.content.story ?? null);
      })
      .catch(() => setError("Couldn't load content"));
  }, []);

  async function save() {
    setError("");
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ announcement, hero, story }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Save failed");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!hero || !story) return <div className="h-64 animate-pulse rounded-xl bg-white/5" aria-busy="true" />;

  return (
    <>
      <AdminPageHeader
        title="Homepage content"
        subtitle="Edits go live on the storefront within a minute."
        action={
          <button type="button" onClick={save} className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-500">
            {saved ? "Saved ✓" : "Publish changes"}
          </button>
        }
      />
      {error && <p role="alert" className="mb-4 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-2.5 text-sm text-red-300">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Announcement bar</h2>
          <label htmlFor="annc" className="sr-only">Announcement</label>
          <input id="annc" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} className={`${inputCls} mt-4`} placeholder="Empty hides the bar" />
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Hero</h2>
          <div className="mt-4 space-y-4">
            <Field id="h-eyebrow" label="Eyebrow" value={hero.eyebrow} onChange={(v) => setHero({ ...hero, eyebrow: v })} />
            <Field id="h-line1" label="Title line 1" value={hero.titleLines[0] ?? ""} onChange={(v) => setHero({ ...hero, titleLines: [v, hero.titleLines[1] ?? ""] })} />
            <Field id="h-line2" label="Title line 2" value={hero.titleLines[1] ?? ""} onChange={(v) => setHero({ ...hero, titleLines: [hero.titleLines[0] ?? "", v] })} />
            <Field id="h-sub" label="Subtitle" textarea value={hero.subtitle} onChange={(v) => setHero({ ...hero, subtitle: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Field id="h-cta1" label="Primary CTA" value={hero.primaryCta} onChange={(v) => setHero({ ...hero, primaryCta: v })} />
              <Field id="h-cta2" label="Secondary CTA" value={hero.secondaryCta} onChange={(v) => setHero({ ...hero, secondaryCta: v })} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Brand story block</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Field id="s-title" label="Title" value={story.title} onChange={(v) => setStory({ ...story, title: v })} />
            <Field id="s-body" label="Body" textarea rows={4} value={story.body} onChange={(v) => setStory({ ...story, body: v })} />
          </div>
        </section>
      </div>
    </>
  );
}

function Field({
  id, label, value, onChange, textarea, rows = 2,
}: { id: string; label: string; value: string; onChange: (v: string) => void; textarea?: boolean; rows?: number }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-500">{label}</label>
      {textarea ? (
        <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      ) : (
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
    </div>
  );
}
