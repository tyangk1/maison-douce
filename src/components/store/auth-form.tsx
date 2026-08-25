"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "register";

export function AuthForm({ defaultMode = "login" }: { defaultMode?: Mode }) {
  const sp = useSearchParams();
  const next = sp.get("next");
  const [mode, setMode] = useState<Mode>(defaultMode === "register" || sp.get("mode") === "register" ? "register" : "login");
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
  );
}
