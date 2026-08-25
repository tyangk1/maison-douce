"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function AccountNav() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const items = [
    { href: "/account", label: "Overview" },
    { href: "/account/orders", label: "Orders" },
    { href: "/account/wishlist", label: "Favourites" },
    { href: "/account/profile", label: "Profile & addresses" },
  ];
  return (
    <nav aria-label="Account" className="flex flex-wrap gap-2">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
            pathname === i.href ? "border-espresso bg-espresso text-parchment" : "border-espresso/15 hover:border-espresso"
          }`}
        >
          {i.label}
        </Link>
      ))}
      <LogoutButton />
    </nav>
  );
}

export function LogoutButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setRole(d.user?.role ?? null))
      .catch(() => {});
  }, []);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="ml-auto flex items-center gap-2">
      {role === "ADMIN" && (
        <Link href="/admin" className="text-xs font-medium text-caramel underline underline-offset-2 hover:text-espresso">
          Admin
        </Link>
      )}
      <button
        type="button"
        onClick={logout}
        disabled={busy}
        className={className ?? "rounded-full border border-espresso/15 px-4 py-1.5 text-xs font-medium transition hover:border-red-700 hover:text-red-800"}
      >
        {busy ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
