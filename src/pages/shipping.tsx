import { createFileRoute } from "react-router-dom";
import { SectionLabel } from "@/components/Reveal";

export const Route = createFileRoute("/shipping")({
  head: () => ({ meta: [{ title: "Shipping — Lira Fashion" }] }),
  component: Shipping,
});

function Shipping() {
  return (
    <div className="pt-32 pb-24 container-luxe max-w-3xl">
      <div className="text-center">
        <SectionLabel>White Glove</SectionLabel>
        <h1 className="mt-6 font-serif text-5xl md:text-6xl">Shipping & <em className="italic gradient-gold-text">Handling</em></h1>
      </div>
      <div className="mt-12 space-y-6 text-foreground/75 leading-relaxed">
        <p>All orders are dispatched from our Paris atelier in a hand-stitched leather box, sealed with wax and accompanied by a signed certificate of provenance.</p>
        <p>Complimentary insured express shipping is offered worldwide. Domestic orders arrive within 2 working days; international within 3–5.</p>
        <p>For commissions over €5,000 we offer in-person hand-delivery by a Maison concierge in Paris, Milan, London and New York.</p>
      </div>
    </div>
  );
}
