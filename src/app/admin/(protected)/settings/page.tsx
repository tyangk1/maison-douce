"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-shell";

type Contact = { address: string; phone: string; email: string };
type Hour = { days: string; time: string };

const inputCls = "w-full rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm outline-none transition focus:border-amber-600/70 focus:ring-2 focus:ring-amber-700/25";

export default function AdminSettingsPage() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [hours, setHours] = useState<Hour[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((d) => {
        setContact(d.content.contact ?? null);
        setHours(d.content.hours ?? []);
      })
      .catch(() => setError("Couldn't load settings"));
  }, []);

  async function save() {
    setError("");
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, hours }),
    });
    if (!res.ok) {
      setError("Save failed");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!contact) return <div className="h-64 animate-pulse rounded-xl bg-white/5" aria-busy="true" />;

  return (
    <>
      <AdminPageHeader
        title="Site settings"
        subtitle="Contact details and opening hours shown across the storefront."
        action={
          <button type="button" onClick={save} className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-500">
            {saved ? "Saved ✓" : "Save settings"}
          </button>
        }
      />
      {error && <p role="alert" className="mb-4 text-sm text-red-400">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Contact</h2>
          <div className="mt-4 space-y-4">
            <SettingField id="st-addr" label="Address" value={contact.address} onChange={(v) => setContact({ ...contact, address: v })} />
            <SettingField id="st-phone" label="Phone" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} />
            <SettingField id="st-email" label="Email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} />
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Opening hours</h2>
          <ul className="mt-4 space-y-3">
            {hours.map((h, i) => (
              <li key={`${h.days}-${i}`} className="flex flex-wrap items-center gap-3">
                <label className="sr-only" htmlFor={`hr-d-${i}`}>Days</label>
                <input
                  id={`hr-d-${i}`}
                  value={h.days}
                  onChange={(e) => setHours((hs) => hs.map((x, j) => (j === i ? { ...x, days: e.target.value } : x)))}
                  className={`${inputCls} min-w-0 flex-1`}
                />
                <label className="sr-only" htmlFor={`hr-t-${i}`}>Time</label>
                <input
                  id={`hr-t-${i}`}
                  value={h.time}
                  onChange={(e) => setHours((hs) => hs.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)))}
                  className={`${inputCls} w-40`}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Environment</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <EnvRow k="Payment provider" v="mock (adapter-based; Stripe-ready)" />
          <EnvRow k="Database" v="SQLite via Prisma (PostgreSQL-portable)" />
          <EnvRow k="Auth" v="HttpOnly JWT session cookies · bcrypt(12)" />
          <EnvRow k="Admin role model" v="User.role — enforced server-side on every admin API" />
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-stone-500">
          Secrets live only in environment variables (.env locally). Never commit .env; see .env.example.
        </p>
      </section>
    </>
  );
}

function SettingField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-500">{label}</label>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </div>
  );
}

function EnvRow({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-stone-500">{k}</dt>
      <dd className="mt-0.5 text-stone-300">{v}</dd>
    </div>
  );
}
