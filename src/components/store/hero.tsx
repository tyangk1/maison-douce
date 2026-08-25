"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BakeryScenePanel } from "@/components/store/bakery-scene-panel";

/**
 * The WebGL layer is dynamically imported after mount so it never blocks
 * LCP; on reduced-motion or low-end devices nothing extra loads at all.
 */
const HeroCanvas = dynamic(() => import("./hero-canvas"), {
  ssr: false,
  loading: () => <div aria-hidden className="absolute inset-0 bg-gradient-to-bl from-parchment via-cream to-sand" />,
});

function DeferredHeroCanvas() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(t);
  }, []);
  return show ? <HeroCanvas /> : null;
}

export function Hero({
  eyebrow,
  titleLines,
  subtitle,
  primaryCta,
  secondaryCta,
}: {
  eyebrow: string;
  titleLines: string[];
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.35]);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollRef.current = v;
  });

  return (
    <section ref={ref} className="relative overflow-hidden bg-cream">
      <DeferredHeroCanvas />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
        <motion.div style={{ opacity: fade }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow"
          >
            {eyebrow}
          </motion.p>
          <h1 className="mt-4 font-display text-display-xl text-espresso">
            {titleLines.map((line, i) => (
              <motion.span
                key={line}
                className="block"
                initial={reduce ? false : { opacity: 0, y: 34 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.12 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
              >
                {line}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.42 }}
            className="mt-6 max-w-md text-base leading-relaxed text-bark sm:text-lg"
          >
            {subtitle}
          </motion.p>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link href="/shop" className="btn-primary">
              {primaryCta}
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M5 12h14m-6-6l6 6-6 6" />
              </svg>
            </Link>
            <Link href="/about" className="btn-secondary">
              {secondaryCta}
            </Link>
          </motion.div>
        </motion.div>

        <div className="relative">
          <div className="absolute -right-6 -top-6 hidden h-full w-full rounded-card border border-cocoa/15 lg:block" aria-hidden />
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] overflow-hidden rounded-card shadow-lift sm:aspect-[5/4] lg:aspect-[4/5]"
          >
            <BakeryScenePanel scrollRef={scrollRef} />
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="absolute -bottom-5 left-4 rounded-card bg-parchment/95 px-5 py-4 shadow-lift backdrop-blur sm:left-8"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-cocoa/70">Baked this morning</p>
            <p className="font-display text-lg">From 6:30am, by hand</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
