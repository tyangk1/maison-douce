"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/components/store/store-provider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=seasonal", label: "Seasonal" },
  { href: "/about", label: "Our Story" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Header({ announcement }: { announcement?: string }) {
  const { count, openDrawer } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      {announcement ? (
        <div className="bg-espresso px-4 py-2 text-center text-xs tracking-wide text-parchment/90">
          {announcement}
        </div>
      ) : null}
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled ? "border-espresso/10 bg-parchment/95 shadow-card backdrop-blur" : "border-transparent bg-parchment"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-[13px] font-medium uppercase tracking-[0.14em] text-bark transition-colors hover:text-espresso"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-center" aria-label="Maison Douce home">
            <span className="font-display text-xl tracking-wide sm:text-2xl">MAISON&nbsp;DOUCE</span>
            <span className="block text-[9px] uppercase tracking-[0.34em] text-cocoa/70">Artisan Bakery</span>
          </Link>

          <div className="flex items-center gap-1.5">
            <Link
              href="/account"
              className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-sand"
              aria-label="My account"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <circle cx="12" cy="8" r="3.6" />
                <path d="M4.5 20c1.3-3.4 4.1-5 7.5-5s6.2 1.6 7.5 5" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={openDrawer}
              className="relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-sand"
              aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M6 8h12l-1 12H7L6 8z" />
                <path d="M9 8V6.5a3 3 0 016 0V8" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-caramel px-1 text-[11px] font-semibold text-espresso">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-espresso/10 bg-parchment lg:hidden"
              aria-label="Mobile"
            >
              <div className="space-y-1 px-4 py-4">
                {links.map((l) => (
                  <Link key={l.label} href={l.href} className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-sand">
                    {l.label}
                  </Link>
                ))}
                <Link href="/account/wishlist" className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-sand">
                  Favourites
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
