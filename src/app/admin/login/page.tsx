"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/admin/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sign-in failed");
      if (data.user?.role !== "ADMIN") {
        setError("This account does not have admin access.");
        setBusy(false);
        return;
      }
      window.location.assign(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#14100c] px-4 text-stone-200">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="font-display text-2xl tracking-wide">MAISON DOUCE</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.34em] text-stone-500">Operations Console</p>
        </div>
        <form onSubmit={submit} noValidate className="mt-10 space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-7">
          <div>
            <label htmlFor="ad-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Admin email</label>
            <input id="ad-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username"
              className="w-full rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm outline-none transition focus:border-amber-600/70 focus:ring-2 focus:ring-amber-700/25" />
          </div>
          <div>
            <label htmlFor="ad-pass" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">Password</label>
            <input id="ad-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
              className="w-full rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm outline-none transition focus:border-amber-600/70 focus:ring-2 focus:ring-amber-700/25" />
          </div>
          {error && (
            <p role="alert" className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-2.5 text-xs text-red-300">{error}</p>
          )}
          <button type="submit" disabled={busy}
            className="w-full rounded-lg bg-amber-600 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-500 disabled:opacity-50">
            {busy ? "Verifying…" : "Sign in to console"}
          </button>
          <p className="text-center text-[11px] leading-relaxed text-stone-500">
            Role-checked server side. Customers cannot access this console.
          </p>
        </form>
      </div>
    </div>
  );
}
