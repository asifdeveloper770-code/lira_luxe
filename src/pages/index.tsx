import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  Gem,
} from "lucide-react";

import heroNecklace from "@/assets/hero-necklace.jpg";
import story from "@/assets/story.jpg";

import {
  bestSellers,
  collections,
} from "@/lib/products";

import ProductCard from "@/components/ProductCard";

import {
  Reveal,
  SectionLabel,
} from "@/components/Reveal";


function Index() {
  return (
    <>
      <Hero />
      <Marquee />
      <Collections />
      <Gallery />

      <BestSellers />
      <Story />
      <Promises />
      <Testimonials />
      <Newsletter />
    </>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroNecklace}
          alt="Lira Fashion diamond necklace"
          className="w-full h-full object-cover object-center scale-105"
          width={1600}
          height={1920}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-transparent to-ink/40" />
      </div>

      {/* Floating sparkles */}
      <span className="sparkle absolute top-[22%] left-[12%] w-1.5 h-1.5 bg-gold rounded-full shadow-glow" />
      <span className="sparkle absolute top-[68%] left-[18%] w-1 h-1 bg-gold-soft rounded-full" style={{ animationDelay: "1s" }} />
      <span className="sparkle absolute top-[34%] right-[22%] w-2 h-2 bg-gold rounded-full" style={{ animationDelay: "1.6s" }} />

      <div className="container-luxe relative z-10 min-h-[100svh] grid place-items-center pt-28 pb-20">
        <div className="max-w-3xl text-center">
          <div className="inline-flex items-center gap-3 text-[11px] tracking-[0.4em] uppercase text-gold/90 reveal in">
            <span className="w-10 h-px bg-gold/70" />
            Maison Lira · Atelier 1924
            <span className="w-10 h-px bg-gold/70" />
          </div>

          <h1 className="mt-6 sm:mt-8 font-serif fluid-display tracking-tight">
            <span className="block text-foreground">The art of</span>
            <span className="block italic shimmer-text">éternité</span>
            <span className="block text-foreground">in 18k gold.</span>
          </h1>

          <p className="mt-6 sm:mt-8 mx-auto max-w-xl fluid-lead text-foreground/75 px-2">
            Heirloom jewellery and luxury accessories — sculpted by hand in our Parisian
            atelier, set with conflict-free gemstones from a single house.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Link to="/shop" className="btn-gold">
              Discover Collection <ArrowRight size={14} />
            </Link>
            <Link to="/about" className="btn-ghost-gold">Our Maison</Link>
          </div>
        </div>
      </div>

      <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase text-gold/70 flex-col items-center gap-3">
        <span>Scroll</span>
        <span className="w-px h-10 bg-gradient-to-b from-gold/80 to-transparent" />
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Hand-Set in Paris", "18k Recycled Gold", "Conflict-Free Stones", "Lifetime Atelier Care", "Complimentary Engraving", "Worldwide Express"];
  return (
    <div className="border-y border-border bg-ink/60 overflow-hidden py-5">
      <div className="flex marquee whitespace-nowrap gap-16 text-[11px] tracking-[0.4em] uppercase text-gold/80">
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-16">
            {t} <span className="text-gold/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Collections() {
  return (
    <section className="container-luxe py-5 sm:py-28 md:py-10">
      <Reveal className="text-center">
        <SectionLabel>Les Collections</SectionLabel>
        <h2 className="mt-6 font-serif fluid-h2">
          Curated for the <em className="italic gradient-gold-text">modern muse</em>
        </h2>
      </Reveal>

      <div className="mt-12 sm:mt-16 grid gap-4 sm:gap-6 md:gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {collections.map((c, i) => (
          <Reveal key={c.slug} delay={i * 90}>
            <Link to={`/collections/${c.slug}`} className="group block product-card">
              <div className="img-wrap relative aspect-[3/4] bg-secondary">
                <img src={c.image} alt={c.name} loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-center">
                  <p className="text-[10px] tracking-[0.32em] uppercase text-gold/80">{c.tagline}</p>
                  <h3 className="mt-2 font-serif text-2xl md:text-3xl text-foreground group-hover:gradient-gold-text transition-all">
                    {c.name}
                  </h3>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function BestSellers() {
  return (
    <section className="container-luxe py-20 sm:py-28 md:py-36">
      <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <SectionLabel>Coveted Pieces</SectionLabel>
          <h2 className="mt-6 font-serif fluid-h2 max-w-xl">
            Bestsellers, <em className="italic gradient-gold-text">whispered</em> from atelier
            to wardrobe.
          </h2>
        </div>
        <Link to="/shop" className="link-underline text-[11px] tracking-[0.32em] uppercase text-gold inline-flex items-center gap-2 self-start md:self-end">
          View All <ArrowRight size={14} />
        </Link>
      </Reveal>

      {/* Mobile: horizontal swipe rail · Tablet+: grid */}
      <div className="mt-12 sm:mt-16  scrollbar-luxe sm:hidden">
        {bestSellers.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <div className="hidden sm:grid mt-16 grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
        {bestSellers.map((p, i) => (
          <Reveal key={p.id} delay={i * 90}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="relative py-20 sm:py-28 md:py-44 overflow-hidden">
      <div className="absolute inset-0 gradient-dark-bg" />
      <div className="container-luxe relative grid lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-20 items-center">
        <Reveal className="lg:col-span-6">
          <div className="relative max-w-md mx-auto lg:max-w-none">
            <div className="absolute -inset-4 border border-gold/30" />
            <img
              src={story}
              alt="Lira atelier portrait"
              loading="lazy"
              className="relative w-full aspect-[4/5] object-cover"
              width={1200}
              height={1500}
            />
          </div>
        </Reveal>

        <Reveal delay={150} className="lg:col-span-6">
          <SectionLabel>Maison Since 1924</SectionLabel>
          <h2 className="mt-6 font-serif fluid-h2">
            A century of <em className="italic gradient-gold-text">savoir-faire</em>
          </h2>
          <div className="hairline w-32 my-8" />
          <p className="text-foreground/75 text-base md:text-lg leading-relaxed max-w-lg">
            Founded above a quiet courtyard on the Rue Saint-Honoré, Lira began as a single
            engraver's bench. Four generations later, every clasp, every facet, every
            millimetre of pavé is still set under the same brass lamps — by the hands of
            artisans who learned from their mothers.
          </p>
          <p className="mt-5 text-foreground/65 leading-relaxed max-w-lg">
            We choose patience over production. Each piece is the work of weeks, not minutes —
            a quiet rebellion against the disposable.
          </p>
          <div className="mt-10 flex gap-4">
            <Link to="/about" className="btn-gold">Read Our Story</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Promises() {
  const items = [
    { icon: Gem, title: "18k Recycled Gold", body: "Sourced from a single refiner, traceable by lot." },
    { icon: ShieldCheck, title: "Lifetime Atelier Care", body: "Complimentary polishing and re-plating, forever." },
    { icon: Truck, title: "White-Glove Delivery", body: "Hand-couriered, insured worldwide." },
    { icon: Sparkles, title: "Engraved by Hand", body: "A signature, a date, a secret — your story." },
  ];
  return (
    <section className="container-luxe py-14 sm:py-20 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-6 border-y border-border">
      {items.map((it, i) => (
        <Reveal key={it.title} delay={i * 80} className="text-center px-2">
          <it.icon className="mx-auto text-gold" size={26} strokeWidth={1.2} />
          <h4 className="mt-5 font-serif text-xl">{it.title}</h4>
          <p className="mt-2 text-sm text-foreground/65 leading-relaxed">{it.body}</p>
        </Reveal>
      ))}
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      q: "The Rubis ring arrived in a hand-stitched box. My grandmother cried — she said it looked like her mother's.",
      n: "Elena V.", c: "Milano",
    },
    {
      q: "I have worn the Aurore bracelet every day for three years. It still catches light like the day I unwrapped it.",
      n: "Camille R.", c: "Paris",
    },
    {
      q: "There is a quietness to Lira pieces. They do not shout. They simply belong.",
      n: "Aiko M.", c: "Tokyo",
    },
  ];
  return (
    <section className="container-luxe py-20 sm:py-28 md:py-36">
      <Reveal className="text-center">
        <SectionLabel>Whispered Reviews</SectionLabel>
        <h2 className="mt-6 font-serif fluid-h2">
          From those who <em className="italic gradient-gold-text">wear us</em>
        </h2>
      </Reveal>
      <div className="mt-12 sm:mt-16 grid md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
        {quotes.map((t, i) => (
          <Reveal key={i} delay={i * 110}>
            <figure className="relative h-full bg-card/60 backdrop-blur border border-border p-8 md:p-10 group hover:border-gold/40 transition-colors">
              <span className="absolute -top-4 left-8 font-serif text-7xl gradient-gold-text leading-none">“</span>
              <blockquote className="mt-4 font-serif text-lg md:text-xl italic text-foreground/85 leading-relaxed">
                {t.q}
              </blockquote>
              <figcaption className="mt-8 pt-6 border-t border-border text-[11px] tracking-[0.32em] uppercase text-gold/80">
                {t.n} <span className="text-foreground/40">·</span> {t.c}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
function Gallery() {
  const imgs = [
    bestSellers[0].image,
    bestSellers[2].image,
    bestSellers[1].image,
    bestSellers[3].image,
    collections[1].image,
    collections[2].image,
  ];

  const sizes = [
    "row-span-2 col-span-2",
    "row-span-1 col-span-1",
    "row-span-1 col-span-1",
    "row-span-2 col-span-1",
    "row-span-1 col-span-2",
    "row-span-1 col-span-1",
  ];

  return (
    <section className="container-luxe py-20 sm:py-28">
      <Reveal className="text-center">
        <SectionLabel>@LiraFashion</SectionLabel>

        <h2 className="mt-6 font-serif fluid-h2">
          The <em className="italic gradient-gold-text">muse</em>, in the wild
        </h2>
      </Reveal>

      <div className="mt-12 sm:mt-14 grid grid-cols-2 md:grid-cols-4 auto-rows-[220px] gap-3 md:gap-4">
        {imgs.map((src, i) => (
          <Reveal
            key={i}
            delay={i * 60}
            className={`group relative overflow-hidden rounded-[18px] ${sizes[i]}`}
          >
            <img
              src={src}
              alt="instagram"
              loading="lazy"
              className="w-full h-full object-cover bg-black transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-ink/10 group-hover:bg-ink/60 transition-all duration-500 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] tracking-[0.32em] uppercase text-gold">
                View
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="container-luxe py-20 sm:py-28">
      <div className="relative overflow-hidden border border-gold/30 bg-gradient-to-br from-ink to-card px-5 sm:px-12 py-14 sm:py-16 md:py-24 text-center noise-overlay">
        <span className="sparkle absolute top-6 left-10 w-1 h-1 bg-gold rounded-full" />
        <span className="sparkle absolute bottom-10 right-12 w-1.5 h-1.5 bg-gold rounded-full" style={{ animationDelay: "1.2s" }} />
        <Reveal>
          <SectionLabel>The Salon</SectionLabel>
          <h2 className="mt-6 font-serif fluid-h2 max-w-2xl mx-auto">
            Private previews. <em className="italic gradient-gold-text">First access.</em>
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-foreground/70">
            Subscribe to the Salon for atelier whispers, capsule releases and a complimentary
            engraving on your first commission.
          </p>
          <form
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="Your email"
              className="flex-1 bg-transparent border border-border focus:border-gold outline-none px-4 py-3.5 text-sm placeholder:text-foreground/40 transition-colors"
            />
            <button type="submit" className="btn-gold">Subscribe</button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
export default Index;