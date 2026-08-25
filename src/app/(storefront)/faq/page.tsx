import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ & delivery",
  description: "Delivery, collection, allergens and everything else about ordering from Maison Douce.",
};

const faqs = [
  {
    q: "Where do you deliver?",
    a: "Across central London (zones 1–2) by courier, Tuesday to Sunday. Delivery is free on orders over £50, otherwise £4.95. Same-day delivery is available for orders placed before 2pm.",
  },
  {
    q: "Can I collect in the bakery?",
    a: "Absolutely — choose 'Collect from the bakery' at checkout and pick up at 58 Lamb's Conduit Street during opening hours. Collection is always free and your order will be waiting under your name.",
  },
  {
    q: "When are items actually baked?",
    a: "Viennoiserie comes out of the oven between 6:30 and 9am; bread throughout the morning. Stock counts on the site update live as the day sells through. When something shows 'sold out', it genuinely is — we never bake twice for the same item.",
  },
  {
    q: "How should I keep things overnight?",
    a: "Bread: cut-side down on the counter, or freeze sliced. Pastries: best eaten same day; refresh in a 150°C oven for 4 minutes. Cakes: room temperature, never refrigerated unless stated. Canelés: honestly, just eat them today.",
  },
  {
    q: "What about allergens?",
    a: "Every product lists its ingredients and allergens on its page. Our bakery handles gluten, dairy, eggs, nuts, soya and sesame, so we cannot guarantee any product is free from traces. If you have a severe allergy please call us before ordering — we'd rather talk than take risks with your health.",
  },
  {
    q: "Do you make celebration cakes?",
    a: "Yes — pistachio & rose, burnt Basque, and seasonal fruit cakes can all be ordered whole. For weddings and large events email hello@maisondouce.co.uk at least two weeks ahead and June will design something with you.",
  },
  {
    q: "What payment methods do you accept?",
    a: "This demo storefront runs a clearly labelled mock payment provider — no real cards are charged. The checkout domain is provider-agnostic, so Stripe can be enabled without changing the flow.",
  },
  {
    q: "Can I change or cancel an order?",
    a: "Orders enter the ovens quickly, so changes are only possible within one hour of purchase. Call +44 20 7946 0810 with your order number and we'll do our best.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-16 sm:px-6">
      <header>
        <p className="eyebrow">Good to know</p>
        <h1 className="mt-2 font-display text-display-xl">Questions, answered</h1>
        <p className="mt-4 text-bark">Everything about delivery, freshness and how our kitchen works.</p>
      </header>

      <div className="mt-12 divide-y divide-espresso/10 border-y border-espresso/10">
        {faqs.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-espresso [&::-webkit-details-marker]:hidden">
              {f.q}
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-cocoa/50 transition-transform duration-200 group-open:rotate-45" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-bark/90">{f.a}</p>
          </details>
        ))}
      </div>

      <p className="mt-10 text-sm text-cocoa/70">
        Still curious? <Link href="/contact" className="underline underline-offset-2 hover:text-espresso">Write to us directly</Link> — a human reads every message.
      </p>
    </div>
  );
}
