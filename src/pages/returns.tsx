import { createFileRoute } from "react-router-dom";
import { SectionLabel } from "@/components/Reveal";

export const Route = createFileRoute("/returns")({
  head: () => ({ meta: [{ title: "Returns — Lira Fashion" }] }),
  component: Returns,
});

function Returns() {
  return (
    <div className="pt-32 pb-24 container-luxe max-w-3xl">
      <div className="text-center">
        <SectionLabel>Atelier Policy</SectionLabel>
        <h1 className="mt-6 font-serif text-5xl md:text-6xl">Return <em className="italic gradient-gold-text">Policy</em></h1>
      </div>
      <div className="mt-12 space-y-6 text-foreground/75 leading-relaxed">
        <p>We accept returns of unworn, non-engraved pieces within 30 days of delivery, in their original Maison Lira box. A complimentary insured return label is included with every order.</p>
        <p>Engraved or bespoke commissions are final sale, but covered by our Lifetime Atelier Care — we will polish, re-plate or restring any Lira piece for life.</p>
        <p>Refunds are issued to the original payment method within 5 working days of receipt at our Paris atelier.</p>
      </div>
    </div>
  );
}
