"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/content", label: "Homepage content" },
  { href: "/admin/media", label: "Media library" },
  { href: "/admin/settings", label: "Site settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#14100c] text-stone-200">
      <div className="flex">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-60 shrink-0 border-r border-white/8 bg-[#191410] transition-transform lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            <Link href="/admin/dashboard" className="border-b border-white/8 px-5 py-5 block">
              <span className="font-display text-lg tracking-wide">MAISON DOUCE</span>
              <span className="block text-[9px] uppercase tracking-[0.3em] text-stone-500">Operations Console</span>
            </Link>
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Admin">
              {nav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3.5 py-2.5 text-sm transition",
                      active ? "bg-amber-600/15 font-medium text-amber-400" : "text-stone-400 hover:bg-white/5 hover:text-stone-200"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-white/8 p-3">
              <Link href="/" target="_blank" className="block rounded-lg px-3.5 py-2 text-xs text-stone-500 hover:text-stone-300">
                View storefront ↗
              </Link>
              <button type="button" onClick={logout} className="w-full rounded-lg px-3.5 py-2 text-left text-xs text-stone-500 hover:text-red-400">
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {open && (
          <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/8 bg-[#14100c]/95 px-4 py-3 backdrop-blur lg:hidden">
            <button type="button" onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10" aria-label="Open menu">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
            <span className="font-display">Console</span>
          </header>
          <main id="main" className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function AdminPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-stone-400">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
