"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

type Mode = "login" | "register";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-24 text-center text-cocoa/60">Loading…</div>}>
      <AuthForm />
    </Suspense>
  );
}

function AuthForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next");
  const [mode, setMode] = useState<Mode>(sp.get("mode") === "register" ? "register" : "login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login"
            ? { email: form.email, password: form.password }
            : { name: form.name, email: form.email, password: form.password }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        throw new Error(data.error ?? "Something went wrong");
      }
      // Hard navigation: the client router may hold a prefetched redirect for
      // the protected page from before the session cookie existed.
      const dest = next || (data.user?.role === "ADMIN" ? "/admin" : "/account");
      window.location.assign(dest);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 pb-28 pt-16">
      <div className="text-center">
        <p className="eyebrow">{mode === "login" ? "Welcome back" : "Join the Maison"}</p>
        <h1 className="mt-2 font-display text-headline sm:text-display">
          {mode === "login" ? "Good morning." : "A little sweetness awaits."}
        </h1>
        <p className="mt-3 text-sm text-cocoa/70">
          {mode === "login"
            ? "Sign in for faster checkout, order history and your favourites."
            : "Create an account to track orders, save favourites and check out in seconds."}
        </p>
      </div>

      <form onSubmit={submit} noValidate className="mt-10 space-y-5 rounded-card border border-espresso/10 bg-white/70 p-7 shadow-card">
        {mode === "register" && (
          <div>
            <label htmlFor="auth-name" className="field-label">Full name *</label>
            <input id="auth-name" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={!!errors.name} className={`input-field ${errors.name ? "!border-red-600" : ""}`} />
            {errors.name && <p role="alert" className="field-error">{errors.name}</p>}
          </div>
        )}
        <div>
          <label htmlFor="auth-email" className="field-label">Email *</label>
          <input id="auth-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" aria-invalid={!!errors.email} className={`input-field ${errors.email ? "!border-red-600" : ""}`} />
          {errors.email && <p role="alert" className="field-error">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="auth-password" className="field-label">Password *</label>
          <input
            id="auth-password"
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            aria-invalid={!!errors.password}
            className={`input-field ${errors.password ? "!border-red-600" : ""}`}
          />
          {errors.password && <p role="alert" className="field-error">{errors.password}</p>}
          {mode === "register" && !errors.password && (
            <p className="mt-1 text-[11px] text-cocoa/55">At least 8 characters with a letter and a number.</p>
          )}
        </div>

        {serverError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{serverError}</p>}

        <button type="submit" disabled={busy} className="btn-primary w-full !py-3.5">
          {busy ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <p className="text-center text-sm text-cocoa/75">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button type="button" onClick={() => setMode("register")} className="font-medium underline underline-offset-2 hover:text-espresso">
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("login")} className="font-medium underline underline-offset-2 hover:text-espresso">
                Sign in
              </button>
            </>
          )}
        </p>
      </form>

      <p className="mt-6 text-center text-xs leading-relaxed text-cocoa/50">
        Demo accounts — customer: customer@example.com / DemoCustomer1 · admin:{" "}
        <Link href="/admin/login" className="underline hover:text-espresso">admin sign-in here</Link>
      </p>
    </div>
  );
}
