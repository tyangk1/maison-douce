"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        throw new Error(data.error);
      }
      setDone(true);
    } catch {
      // handled via field errors or generic below
      if (!Object.keys(errors).length) setErrors({ _: "Something went wrong — please email us directly." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
      <header className="mb-12 max-w-xl">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-2 font-display text-display-xl">Talk to the bakery</h1>
        <p className="mt-4 text-bark">
          Weddings, wholesale, press, or just to tell us which croissant changed your week —
          every message is read by a human.
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        {done ? (
          <div className="rounded-card border border-sage/40 bg-sage/10 p-10 text-center" role="status">
            <p className="font-display text-2xl">Message received.</p>
            <p className="mt-3 text-sm text-cocoa/80">We reply within two working days — usually sooner.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-5 rounded-card border border-espresso/10 bg-white/70 p-7 shadow-card sm:p-9">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="ct-name" className="field-label">Name *</label>
                <input id="ct-name" required value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} className={`input-field ${errors.name ? "!border-red-600" : ""}`} autoComplete="name" />
                {errors.name && <p role="alert" className="field-error">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="ct-email" className="field-label">Email *</label>
                <input id="ct-email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} className={`input-field ${errors.email ? "!border-red-600" : ""}`} autoComplete="email" />
                {errors.email && <p role="alert" className="field-error">{errors.email}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="ct-subject" className="field-label">Subject *</label>
              <input id="ct-subject" required value={form.subject} onChange={(e) => set("subject", e.target.value)} aria-invalid={!!errors.subject} className={`input-field ${errors.subject ? "!border-red-600" : ""}`} placeholder="Wedding cake enquiry…" />
              {errors.subject && <p role="alert" className="field-error">{errors.subject}</p>}
            </div>
            <div>
              <label htmlFor="ct-message" className="field-label">Message *</label>
              <textarea id="ct-message" rows={6} required value={form.message} onChange={(e) => set("message", e.target.value)} aria-invalid={!!errors.message} className={`input-field ${errors.message ? "!border-red-600" : ""}`} />
              {errors.message && <p role="alert" className="field-error">{errors.message}</p>}
            </div>
            {errors._ && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{errors._}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full sm:w-auto">
              {busy ? "Sending…" : "Send message"}
            </button>
          </form>
        )}

        <aside className="space-y-8">
          <div>
            <h2 className="font-display text-lg">Visit us</h2>
            <address className="mt-2 not-italic leading-relaxed text-bark/90">
              58 Lamb&apos;s Conduit Street<br />Bloomsbury, London WC1N<br />
              <a href="tel:+442079460810" className="hover:underline">+44 20 7946 0810</a><br />
              <a href="mailto:hello@maisondouce.co.uk" className="hover:underline">hello@maisondouce.co.uk</a>
            </address>
          </div>
          <div>
            <h2 className="font-display text-lg">Opening hours</h2>
            <dl className="mt-2 space-y-1.5 text-sm text-bark/90">
              {[
                ["Tuesday – Friday", "7:30 – 18:00"],
                ["Saturday", "8:00 – 17:00"],
                ["Sunday", "8:00 – 14:00"],
                ["Monday", "Closed — the ovens rest"],
              ].map(([d, t]) => (
                <div key={d} className="flex justify-between gap-4">
                  <dt>{d}</dt>
                  <dd className="text-cocoa/75">{t}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="font-display text-lg">Wholesale</h2>
            <p className="mt-2 text-sm leading-relaxed text-cocoa/85">
              We supply a small family of cafés and restaurants. Email{" "}
              <a href="mailto:wholesale@maisondouce.co.uk" className="underline hover:text-espresso">wholesale@maisondouce.co.uk</a>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
