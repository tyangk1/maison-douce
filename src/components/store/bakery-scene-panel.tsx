"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { SmartImage } from "@/components/ui/smart-image";

const BakeryScene = dynamic(() => import("./bakery-scene"), { ssr: false });

type Quality = {
  segments: number;
  dustCount: number;
  dpr: [number, number];
  grains: number;
};

const DESKTOP: Quality = { segments: 5, dustCount: 320, dpr: [1, 1.5], grains: 22 };
const MOBILE: Quality = { segments: 4, dustCount: 130, dpr: [1, 1.2], grains: 12 };

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

/**
 * Signature 3D hero panel. The photography remains underneath as the
 * progressive-enhancement fallback: if the user prefers reduced motion,
 * the device lacks WebGL/low memory, or the scene fails, the image simply
 * stays visible — no broken state exists.
 */
export function BakeryScenePanel({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const nav = navigator as Navigator & { deviceMemory?: number };
    if ((nav.deviceMemory ?? 8) < 4) return;
    if (!webglAvailable()) return;
    // Defer scene mount so it never competes with LCP paint.
    const t = setTimeout(() => setAllowed(true), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const quality: Quality =
    typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches ? MOBILE : DESKTOP;

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      {/* Scene-active backdrop: a warm studio gradient the 3D object lives in */}
      {allowed && (
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_100%_at_75%_15%,#fdf9f2_0%,#f0e4d0_45%,#d9c19a_100%)]"
        />
      )}

      {/* True fallback (reduced motion / no WebGL / low memory): photography */}
      {!allowed && (
        <SmartImage
          src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=85&w=1800&auto=format&fit=crop"
          alt="Golden croissants on a linen-covered counter at Maison Douce"
          priority
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      )}

      {allowed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <BakeryScene quality={quality} active={active} scrollRef={scrollRef} onReady={() => setReady(true)} />
        </motion.div>
      )}
      {/* Warm grade + soft vignette keeps the composition cinematic */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/20 via-transparent to-white/10" />
    </div>
  );
}
