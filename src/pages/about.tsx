import { useSiteImage } from "@/lib/site-images";
import { Reveal, SectionLabel } from "@/components/Reveal";

export default function About() {
  const hero = useSiteImage("about_hero");
  const story = useSiteImage("about_story");
  return (
    <div>
      <section className="relative h-[70svh] min-h-[500px] overflow-hidden">
        <img
          src={hero}
          alt="Maison Lira"
          className="absolute inset-0 w-full h-full object-cover brightness-[1.35] contrast-[1.05] saturate-[1.1]"
        />

        {/* Lighter overlay (client asked to brighten this image) — only a soft fade at the top for the menu and at the bottom into the page */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/35 via-transparent to-ink/80" />

        <div className="relative container-luxe h-full flex flex-col items-center justify-center text-center pt-20">
          <SectionLabel>
            Maison Lira · Est. 1924
          </SectionLabel>

          <h1 className="mt-6 font-serif text-5xl md:text-7xl max-w-3xl [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]">
            A century of{" "}
            <em className="italic gradient-gold-text">
              savoir-faire
            </em>
          </h1>
        </div>
      </section>

      <section id="story" className="container-luxe py-28 grid lg:grid-cols-12 gap-12 items-center scroll-mt-28">
        <Reveal className="lg:col-span-6">
          <img
            src={story}
            alt="atelier"
            className="w-full aspect-[4/5] object-cover"
          />
        </Reveal>

        <Reveal
          delay={140}
          className="lg:col-span-6 space-y-6 text-foreground/75 leading-relaxed"
        >
          <SectionLabel>
            Our Story
          </SectionLabel>

          <p className="text-lg">
            Maison Lira began in 1924 above a
            quiet courtyard on the Rue
            Saint-Honoré.
          </p>

          <p>
            Four generations later, we still
            set every stone by hand.
          </p>

          <p>
            We choose patience over
            production.
          </p>
        </Reveal>
      </section>

      <section id="craftsmanship" className="container-luxe py-20 border-t border-border scroll-mt-28">
        <Reveal className="max-w-3xl mx-auto text-center space-y-5 text-foreground/75 leading-relaxed">
          <SectionLabel>Craftsmanship</SectionLabel>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            Made by <em className="italic gradient-gold-text">hand</em>
          </h2>
          <p>
            Every piece is handmade &amp; designed by Lira Fashion — beads strung, wires wrapped and
            details painted one at a time. Because each item is handcrafted, colours, shapes and sizes
            may vary slightly, making every piece one of a kind.
          </p>
        </Reveal>
      </section>

      <section id="sustainability" className="container-luxe py-20 border-t border-border scroll-mt-28">
        <Reveal className="max-w-3xl mx-auto text-center space-y-5 text-foreground/75 leading-relaxed">
          <SectionLabel>Sustainability</SectionLabel>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            Natural <em className="italic gradient-gold-text">materials</em>
          </h2>
          <p>
            We work with natural materials wherever we can — shell, coconut, wood, leather and natural
            stones — and make in small batches, so nothing is mass-produced and little goes to waste.
          </p>
        </Reveal>
      </section>

      <section id="journal" className="container-luxe py-20 border-t border-border scroll-mt-28">
        <Reveal className="max-w-3xl mx-auto text-center space-y-5 text-foreground/75 leading-relaxed">
          <SectionLabel>Journal</SectionLabel>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            From the <em className="italic gradient-gold-text">atelier</em>
          </h2>
          <p>New pieces, behind-the-scenes and styling notes — coming soon.</p>
        </Reveal>
      </section>

      <section className="container-luxe py-20 border-t border-border grid md:grid-cols-3 gap-10 text-center">
        {[
          {
            n: "100",
            l: "Years of Atelier",
          },
          {
            n: "12",
            l: "Master Artisans",
          },
          {
            n: "∞",
            l: "Lifetime Care",
          },
        ].map((s, i) => (
          <Reveal
            key={i}
            delay={i * 100}
          >
            <div className="font-serif text-7xl gradient-gold-text">
              {s.n}
            </div>

            <p className="mt-3 text-[11px] tracking-[0.32em] uppercase text-foreground/60">
              {s.l}
            </p>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
