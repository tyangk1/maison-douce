import type { Metadata } from "next";
import Link from "next/link";
import { SmartImage } from "@/components/ui/smart-image";
import { Reveal } from "@/components/ui/reveal";
import { IMG } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Our story",
  description: "How Maison Douce grew from a railway arch and one deck oven into a Bloomsbury atelier.",
};

export default function AboutPage() {
  return (
    <div className="pb-0">
      <header className="mx-auto max-w-4xl px-4 pb-14 pt-20 text-center sm:px-6">
        <p className="eyebrow">Since 2019 · Bloomsbury, London</p>
        <h1 className="mt-3 font-display text-display-xl">Flour, water, salt — and patience.</h1>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[21/9] overflow-hidden rounded-card shadow-lift">
          <SmartImage src={IMG.aboutMain} alt="Hands at work in the Maison Douce kitchen" fill priority sizes="(max-width:1024px) 100vw, 1152px" className="object-cover" />
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-4 py-16 text-lg leading-relaxed text-bark sm:px-6">
        <Reveal>
          <p className="font-display text-xl leading-relaxed text-espresso sm:text-2xl">
            Maison Douce began with one deck oven, a second-hand mixer, and an unreasonable belief
            that London deserved slower bread.
          </p>
          <p className="mt-6">
            Camille Roux left a Michelin pastry section in Lyon with two suitcases and her
            grandmother&apos;s levain. The first croissants were sold from a trestle table outside the arch on
            Lamb&apos;s Conduit Street; they were gone by nine. Six years later the arch is a full atelier —
            marble benches, a stone hearth, a team of eleven bakers — but nothing essential has changed.
          </p>
          <p className="mt-6">
            We mill British grain for flavour rather than yield. We laminate with cultured butter because it
            tastes like somewhere. Our levains have names and birthdays. Every loaf is scored by hand,
            every tart dressed minutes before it meets the counter, and every recipe earns its place by being
            worth the three days it takes to make properly.
          </p>
        </Reveal>
      </section>

      <section className="bg-cream py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal>
            <div className="aspect-[4/5] overflow-hidden rounded-card shadow-lift">
              <SmartImage src={IMG.aboutSecondary} alt="Sourdough loaves cooling on racks" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <h2 className="font-display text-headline">What we promise</h2>
            <ul className="mt-6 space-y-5 text-bark">
              {[
                ["Nothing artificial, ever", "No additives, no improvers, no shortcuts disguised as technique. If time can do the job, we let it."],
                ["Growers we can name", "Our flour comes from a single mill in Essex; our strawberries from one farm in Kent. We visit both."],
                ["Baked today means today", "Anything unsold at close goes to our neighbourhood shelter partnership — never re-sold next day."],
                ["Priced honestly", "Premium ingredients cost real money. We'd rather explain the price of butter than quietly change the recipe."],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-4">
                  <span className="mt-2 h-1.5 w-6 shrink-0 rounded-full bg-caramel/70" aria-hidden />
                  <span><strong className="block font-semibold text-espresso">{title}</strong>{body}</span>
                </li>
              ))}
            </ul>
            <Link href="/shop" className="btn-primary mt-10">Taste the difference</Link>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-card border border-espresso/10 bg-white/70 p-10 shadow-card md:grid-cols-3">
          {[
            ["Camille Roux", "Founder & head baker", "Ex-Michelin pastry. Guards the levains personally."],
            ["Theo Achebe", "Head of bread", "Stone-milling obsessive. Bakes the first batch daily at 4am."],
            ["June Okafor", "Patisserie", "The mind behind the Basque cheesecake and mille-feuille."],
          ].map(([name, role, bio]) => (
            <figure key={name}>
              <figcaption>
                <p className="font-display text-xl">{name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-caramel">{role}</p>
              </figcaption>
              <blockquote className="mt-3 text-sm leading-relaxed text-cocoa/85">{bio}</blockquote>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
