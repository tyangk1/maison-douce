# MAISON DOUCE — VISUAL DIRECTION

> Single source of truth for the product's art direction. Every UI decision
> should be traceable to a line in this document.

## 1. Product visual identity

**"An editorial bakery that happens to sell online."**

Maison Douce feels like a beautifully printed bakery journal: warm paper,
generous margins, photography that does the selling, and typography with an
opinion. The interface recedes; the food and craft come forward.

- **Brand temperature:** warm, patient, precise — never corporate, never cutesy
- **Design references synthesized (not copied):** premium DTC food brands
  (Gusto-style warmth), editorial fashion e-commerce (whitespace, serif
  display), French patisserie packaging (muted gold + deep brown)
- **Anti-references:** SaaS dashboards, gradient-hero templates, neon "AI"
  aesthetics, dense grid marketplaces

## 2. Typography

| Role | Face | Usage |
| --- | --- | --- |
| Display / editorial | Playfair Display (`font-display`) | H1–H3, prices, pull quotes, numerals in stats |
| UI / body | Inter (`font-sans`) | Body, buttons, forms, tables, meta |

- Display sizes use fluid clamps: `text-display-xl` ≈ clamp(2.75rem → 5rem)
- Uppercase micro-labels ("eyebrows") use `tracking-[0.22em]` at ~12px —
  the signature typographic device across storefront **and** admin headings
- Line length for reading copy ≤ 65ch; leading relaxed (1.6–1.75) for body

## 3. Color palette

Warm neutrals carry the page; accents are used sparingly like spice.

| Token | Hex | Role |
| --- | --- | --- |
| parchment | `#FBF7F1` | Page background |
| cream | `#F4EDE2` | Alternate sections, image placeholders |
| sand | `#E9DECF` | Callouts, soft fills |
| espresso | `#231A12` | Primary text, dark sections, primary buttons |
| bark / cocoa | `#4A3826` / `#6B4F3A` | Secondary text |
| caramel | `#B98A44` | Accent: highlights, badges, admin focus, charts |
| blush | `#C98D82` | Favourite/heart states only |
| sage | `#7D8A70` | Success states, free-delivery messaging |

**Admin inverts the world:** near-black browns (`#14100c`, `#191410`), stone
text scale, amber-600 as the single accent. Same family, different job — the
console should feel like a workshop, not a showroom.

Contrast: body text on parchment exceeds WCAG AA; muted text never below
~4.5:1 for meaningful content.

## 4. Spacing system

Tailwind default scale (4px base). Rhythm rules:

- Page gutters: 16px → 24px → 32px (mobile → tablet → desktop)
- Section padding: 96px desktop / 64px mobile vertical rhythm
- Max content width: `max-w-7xl`; prose blocks capped at `max-w-2xl/3xl`
- Cards breathe: internal padding ≥ 20px, radius token `rounded-card` (14px)

## 5. Layout philosophy

- **Editorial asymmetry where it tells a story** (signature collection:
  1.4fr/1fr split; story section: overlapping offset image cards); symmetric
  grids only where scanning matters (catalog)
- Sticky, minimal chrome: header collapses to blur-on-scroll; cart drawer
  overlays rather than navigates away
- Dark "baked today" band acts as the homepage's visual fulcrum between
  light sections

## 6. Image treatment

- Warm natural-light food photography only; consistent 4:5 catalog ratio,
  4/5–3/4 editorial ratios in gallery masonry
- Rounded corners (14–16px), soft layered shadows (`shadow-card/lift`)
- Hover: slow 1.03–1.04 scale (500ms, elegant ease) — never zoom-bounce
- All remote imagery resolves through the asset layer (`src/lib/assets.ts`)
  with deterministic warm-gradient fallbacks via `SmartImage` — no broken
  image icons are ever possible
- Next/Image everywhere; sizes hints per breakpoint; priority only for hero

## 7. Animation system

| Token | Value | Use |
| --- | --- | --- |
| fast | 160ms | hovers, button states |
| base | 320ms | drawers, dropdowns, toggles |
| slow | 700ms | scroll reveals, hero entrance |

- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` ("elegant") for entrances;
  spring physics only for interactive feedback
- Scroll reveals: opacity 0→1 + y 24→0, staggered 80ms, fire once
  (`Reveal`/`Stagger` primitives)
- Feedback loops are always short: add-to-cart shows "Added ✓" then opens the
  drawer — state change is never left ambiguous

## 8. Interaction philosophy

1. Motion supports hierarchy or feedback — nothing decorates
2. Touch targets ≥ 44px; focus rings always visible (caramel outline)
3. Optimistic UI only where lossless (cart quantity, favourites); money and
   inventory always confirm server-side
4. Empty states invite action (illustrative copy + CTA), error states explain
   recovery

## 9. Component principles

- Storefront primitives: `btn-primary` (espresso pill), `btn-secondary`
  (outlined pill), `btn-accent` (caramel) — pills everywhere, generous px
- Forms share `.input-field`/`.field-label`/`.field-error`; errors inline,
  aria-invalid wired, server field errors map by name
- Admin components are denser: 13–14px type, table-first, status pills,
  amber focus rings; every list has search/filter/skeleton states

## 10. Responsive strategy

- Mobile-first CSS; breakpoints honored at 390 / 768 / 1024 / 1440
- Header: centered wordmark + hamburger < lg; nav inline ≥ lg
- Catalog: 1 → 2 → 3(4) columns; checkout collapses summary above form
- Admin sidebar becomes off-canvas drawer under lg
- Tables scroll horizontally inside rounded containers rather than breaking

## 11. Accessibility strategy

- Semantic landmarks (`header/main/footer/nav/article`), skip target `#main`
- Full keyboard operability (drawer, modals, galleries, quantity steppers);
  visible focus-visible outlines
- `aria-live` on quantities/status, `role=dialog` + labels on drawers/modals,
  alt text on all meaningful imagery
- Colour contrast per palette table; never colour-only status

## 12. Reduced-motion strategy

Global `prefers-reduced-motion: reduce` block zeroes animation/transition
durations; framer-motion primitives check `useReducedMotion()` and render
static content; parallax and WebGL animation disable to static frames.
Content is never hidden when motion is off (noscript fallback included).

## 13. WebGL usage policy

One canvas on the entire site: the homepage hero (`HeroCanvas`) — a raw
WebGL fragment shader rendering a slowly drifting warm "flour grain" field
behind the headline. Rules enforced:

- Loaded lazily after first paint (dynamic import), paused off-screen via
  IntersectionObserver, destroyed with context loss tolerance
- Static cream/sand gradient fallback when: reduced motion, no WebGL, low
  DPI/mobile-low-memory, or module load failure
- Budget: shader pass ≤ 1ms/frame GPU on integrated graphics; zero JS on
  other routes; LCP element (hero image/text) is pure HTML/CSS

No Three.js dependency — raw GL achieves the effect at ~2KB instead of ~600KB.

## 14. Performance budget

| Metric | Budget |
| --- | --- |
| First Load JS (storefront route) | ≤ 160KB gz |
| Hero LCP | < 2.5s on Fast 3G |
| Images | next/image optimized, lazy below fold |
| Fonts | next/font self-hosted, `display: swap`, 2 families max |
| CLS | 0 (aspect-ratio boxes reserved for all media) |
| WebGL JS cost | dynamic chunk, idle-loaded, ≤ 3KB gz |

