"use client";

import Link from "next/link";
import { useState } from "react";

export function Footer({ contact }: { contact?: { email: string; phone: string; address: string } }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setState("done");
      setMessage(data.message ?? "You're on the list.");
      setEmail("");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <footer className="mt-24 bg-espresso text-parchment">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.4fr]">
          <div>
            <p className="font-display text-2xl">MAISON DOUCE</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.34em] text-parchment/60">Artisan Bakery</p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-parchment/70">
              Small-batch pastries, bread and desserts, baked by hand in Bloomsbury since 2019.
            </p>
          </div>

          <nav aria-label="Shop">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-parchment/50">Shop</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-parchment/80">
              <li><Link href="/shop" className="hover:text-parchment">All products</Link></li>
              <li><Link href="/shop?category=viennoiserie" className="hover:text-parchment">Viennoiserie</Link></li>
              <li><Link href="/shop?category=cakes" className="hover:text-parchment">Cakes</Link></li>
              <li><Link href="/shop?category=bread" className="hover:text-parchment">Bread</Link></li>
              <li><Link href="/shop?category=gift-boxes" className="hover:text-parchment">Gift boxes</Link></li>
            </ul>
          </nav>

          <nav aria-label="Maison Douce">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-parchment/50">Maison</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-parchment/80">
              <li><Link href="/about" className="hover:text-parchment">Our story</Link></li>
              <li><Link href="/faq" className="hover:text-parchment">FAQ &amp; delivery</Link></li>
              <li><Link href="/contact" className="hover:text-parchment">Contact</Link></li>
              <li><Link href="/account" className="hover:text-parchment">My account</Link></li>
            </ul>
          </nav>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-parchment/50">A little sweetness in your inbox</h3>
            <p className="mt-4 text-sm text-parchment/70">Bake lists, seasonal drops and first dibs on limited editions.</p>
            {state === "done" ? (
              <p role="status" className="mt-4 rounded-lg bg-sage/25 px-4 py-3 text-sm text-parchment">{message}</p>
            ) : (
              <form onSubmit={subscribe} className="mt-4 flex gap-2" noValidate={false}>
                <label htmlFor="footer-newsletter" className="sr-only">Email address</label>
                <input
                  id="footer-newsletter"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="min-w-0 flex-1 rounded-full border border-parchment/20 bg-transparent px-4 py-2.5 text-sm placeholder:text-parchment/40 focus:border-caramel focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="rounded-full bg-caramel px-5 py-2.5 text-sm font-semibold text-espresso transition hover:brightness-105 disabled:opacity-50"
                >
                  {state === "loading" ? "…" : "Join"}
                </button>
              </form>
            )}
            {state === "error" && <p role="alert" className="mt-2 text-xs text-blush">{message}</p>}
            {contact && (
              <address className="mt-6 not-italic text-xs leading-relaxed text-parchment/50">
                {contact.address}
                <br />
                {contact.phone} · {contact.email}
              </address>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-parchment/15 pt-6 text-xs text-parchment/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Maison Douce Ltd. Baked with patience in London.</p>
          <p>Demo storefront — payments run through a clearly labelled mock provider.</p>
        </div>
      </div>
    </footer>
  );
}
