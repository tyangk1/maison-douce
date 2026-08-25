/**
 * Central image asset layer.
 * Every visual on the site resolves through here so sources (Unsplash today,
 * self-hosted photography tomorrow) can be swapped without touching components.
 */

export type Asset = { src: string; alt: string };

const U = (id: string, params = "q=80&w=1600&auto=format&fit=crop") =>
  `https://images.unsplash.com/${id}?${params}`;

export const IMG = {
  hero: U("photo-1555507036-ab1f4038808a", "q=85&w=2000&auto=format&fit=crop"),
  heroAlt: "Golden butter croissants fresh from the oven",
  story: U("photo-1517686469429-8bdb88b9f907"),
  storyAlt: "Baker's hands shaping dough by hand",
  interior: U("photo-1556742049-0cfed4f6a45d"),
  interiorAlt: "Inside the Maison Douce atelier",
  seasonalHero: U("photo-1565958011703-44f9829ba187"),
  seasonalAlt: "Strawberry tart with fresh berries",
  processIngredients: U("photo-1509440159596-0249088772ff"),
  processFermentation: U("photo-1568254183919-78a4f43a2877"),
  processHandcrafted: U("photo-1556910103-1c02745aae4d"),
  processDelivery: U("photo-1523294587484-bae6cc870010"),
  newsletter: U("photo-1486427944299-d1955d23e34d"),
  gallery1: U("photo-1499636136210-6f4ee915583e", "q=80&w=900&auto=format&fit=crop"),
  gallery2: U("photo-1578985545062-69928b1d9587", "q=80&w=900&auto=format&fit=crop"),
  gallery3: U("photo-1509365465985-25d11c17e812", "q=80&w=900&auto=format&fit=crop"),
  gallery4: U("photo-1464349095431-e9a21285b5f3", "q=80&w=900&auto=format&fit=crop"),
  gallery5: U("photo-1587668178277-295251f900ce", "q=80&w=900&auto=format&fit=crop"),
  gallery6: U("photo-1534620808146-d33bb39128b2", "q=80&w=900&auto=format&fit=crop"),
  aboutMain: U("photo-1556910103-1c02745aae4d"),
  aboutSecondary: U("photo-1608198093002-ad4e005484ec"),
} as const;

/** Deterministic fallback per product slug so missing imagery degrades gracefully. */
export function fallbackFor(seed: string): string {
  const pool = [
    U("photo-1509440159596-0249088772ff", "q=75&w=1200&auto=format&fit=crop"),
    U("photo-1555507036-ab1f4038808a", "q=75&w=1200&auto=format&fit=crop"),
    U("photo-1499636136210-6f4ee915583e", "q=75&w=1200&auto=format&fit=crop"),
    U("photo-1568254183919-78a4f43a2877", "q=75&w=1200&auto=format&fit=crop"),
    U("photo-1578985545062-69928b1d9587", "q=75&w=1200&auto=format&fit=crop"),
    U("photo-1565958011703-44f9829ba187", "q=75&w=1200&auto=format&fit=crop"),
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return pool[h % pool.length];
}
