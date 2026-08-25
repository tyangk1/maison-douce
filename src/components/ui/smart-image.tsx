"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Image with graceful degradation: if a remote asset fails to load we fall
 * back to the supplied fallback (or a warm gradient) instead of showing a
 * broken image. This is part of the swappable asset-layer strategy.
 */
export function SmartImage({
  src,
  alt,
  fallbackSrc,
  className,
  fill,
  sizes,
  priority,
}: {
  src: string | null | undefined;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const resolved = !src || failed ? fallbackSrc ?? null : src;

  if (!resolved) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("bg-gradient-to-br from-sand via-cream to-caramel/40", fill && "absolute inset-0", className)}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill={fill}
      sizes={sizes ?? "100vw"}
      priority={priority}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
