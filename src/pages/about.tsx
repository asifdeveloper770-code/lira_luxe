import story from "@/assets/story.jpg";
import hero from "@/assets/hero-necklace.jpg";
import { Reveal, SectionLabel } from "@/components/Reveal";

export default function About() {
  return (
    <div>
      <section className="relative h-[70svh] min-h-[500px] overflow-hidden">
        <img
          src={hero}
          alt="Maison Lira"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/30 to-ink" />

        <div className="relative container-luxe h-full flex flex-col items-center justify-center text-center pt-20">
          <SectionLabel>
            Maison Lira · Est. 1924
          </SectionLabel>

          <h1 className="mt-6 font-serif text-5xl md:text-7xl max-w-3xl">
            A century of{" "}
            <em className="italic gradient-gold-text">
              savoir-faire
            </em>
          </h1>
        </div>
      </section>

      <section className="container-luxe py-28 grid lg:grid-cols-12 gap-12 items-center">
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