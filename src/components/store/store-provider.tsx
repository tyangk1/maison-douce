"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image: string | null;
  quantity: number;
  stockQuantity: number;
  variantId?: string;
  variantName?: string | null;
};

const lineKey = (l: { productId: string; variantId?: string }) => `${l.productId}:${l.variantId ?? "base"}`;

export function getLineKey(l: { productId: string; variantId?: string }) {
  return lineKey(l);
}

type StoreContextValue = {
  lines: CartLine[];
  favorites: string[];
  drawerOpen: boolean;
  hydrated: boolean;
  count: number;
  subtotalCents: number;
  addToCart: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  lastAdded: string | null;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_KEY = "md.cart.v1";
const FAV_KEY = "md.favorites.v1";

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    setLines(readLS<CartLine[]>(CART_KEY, []));
    setFavorites(readLS<string[]>(FAV_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  const addToCart = useCallback((line: Omit<CartLine, "quantity">, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => lineKey(l) === lineKey(line));
      if (existing) {
        return prev.map((l) =>
          lineKey(l) === lineKey(line)
            ? { ...l, quantity: Math.min(l.quantity + quantity, Math.max(1, l.stockQuantity)) }
            : l
        );
      }
      return [...prev, { ...line, quantity }];
    });
    setLastAdded(line.name);
    setDrawerOpen(true);
    setTimeout(() => setLastAdded(null), 2600);
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => lineKey(l) !== key)
        : prev.map((l) =>
            lineKey(l) === key
              ? { ...l, quantity: Math.min(quantity, Math.max(1, l.stockQuantity || quantity)) }
              : l
          )
    );
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => lineKey(l) !== key));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((f) => f !== productId) : [...prev, productId]));
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      lines,
      favorites,
      drawerOpen,
      hydrated,
      lastAdded,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      subtotalCents: lines.reduce((s, l) => s + l.priceCents * l.quantity, 0),
      addToCart,
      updateQuantity,
      removeLine,
      clearCart,
      toggleFavorite,
      isFavorite: (id: string) => favorites.includes(id),
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [lines, favorites, drawerOpen, hydrated, lastAdded, addToCart, updateQuantity, removeLine, clearCart, toggleFavorite]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

