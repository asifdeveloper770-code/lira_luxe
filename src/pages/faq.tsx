import { createFileRoute } from "react-router-dom";
import { SectionLabel } from "@/components/Reveal";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — Lira Fashion" }] }),
  component: FAQ,
});

const items = [
  { q: "How long does a custom engraving take?", a: "Engraving adds 3–5 atelier days to your order. It is offered complimentary on every piece." },
  { q: "Do you offer ring resizing?", a: "Yes. Resizing within ±2 sizes is complimentary for life, performed by the original setter." },
  { q: "Are gemstones conflict-free?", a: "Every stone is sourced from a single house with full chain-of-custody traceability since 1968." },
  { q: "What gold do you use?", a: "100% recycled 18k gold, refined in France, hallmarked by the Bureau de Garantie." },
  { q: "Can I commission a bespoke piece?", a: "Of course. Write to our concierge — a master artisan will reply within the working day." },
];

function FAQ() {
  return (
    <div className="pt-32 pb-24 container-luxe max-w-3xl">
      <div className="text-center">
        <SectionLabel>Atelier Questions</SectionLabel>
        <h1 className="mt-6 font-serif text-5xl md:text-6xl">Frequently <em className="italic gradient-gold-text">Asked</em></h1>
      </div>
      <div className="mt-16 divide-y divide-border border-y border-border">
        {items.map((it, i) => (
          <details key={i} className="group py-7">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="font-serif text-xl md:text-2xl group-hover:text-gold transition-colors">{it.q}</span>
              <span className="text-gold text-2xl font-light transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-4 text-foreground/70 leading-relaxed">{it.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
export default FAQ;
