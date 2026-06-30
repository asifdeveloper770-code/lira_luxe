import { Mail, MapPin, Phone } from "lucide-react";
import { Reveal, SectionLabel } from "@/components/Reveal";

export default function Contact() {
  return (
    <div className="pt-32 pb-24 container-luxe">
      <Reveal className="text-center">
        <SectionLabel>
          Le Concierge
        </SectionLabel>

        <h1 className="mt-6 font-serif text-5xl md:text-7xl">
          Speak to the{" "}
          <em className="italic gradient-gold-text">
            Maison
          </em>
        </h1>

        <p className="mt-5 text-foreground/70 max-w-xl mx-auto">
          Bespoke commissions, private
          viewings or simply a question —
          our concierge replies within the
          working day.
        </p>
      </Reveal>

      <div className="mt-20 grid lg:grid-cols-2 gap-14">
        <Reveal>
          <form
            className="space-y-5"
            onSubmit={(e) =>
              e.preventDefault()
            }
          >
            <input
              placeholder="Name"
              className="w-full bg-transparent border border-border focus:border-gold outline-none px-4 py-4 text-sm"
            />

            <input
              placeholder="Email"
              type="email"
              className="w-full bg-transparent border border-border focus:border-gold outline-none px-4 py-4 text-sm"
            />

            <input
              placeholder="Subject"
              className="w-full bg-transparent border border-border focus:border-gold outline-none px-4 py-4 text-sm"
            />

            <textarea
              placeholder="Message"
              rows={6}
              className="w-full bg-transparent border border-border focus:border-gold outline-none px-4 py-4 text-sm resize-none"
            />

            <button className="btn-gold w-full sm:w-auto">
              Send Message
            </button>
          </form>
        </Reveal>

        <Reveal
          delay={140}
          className="space-y-10"
        >
          {[
            {
              icon: MapPin,
              t: "Atelier Paris",
              v: "12 Rue Saint-Honoré, 75001 Paris",
            },

            {
              icon: Phone,
              t: "Concierge",
              v: "+347 867 3122",
            },

            {
              icon: Mail,
              t: "Correspondence",
              v: "lirafashion@yahoo.com",
            },
          ].map((c) => (
            <div
              key={c.t}
              className="flex gap-5 items-start"
            >
              <c.icon
                className="text-gold mt-1"
                size={22}
                strokeWidth={1.3}
              />

              <div>
                <h4 className="text-[11px] tracking-[0.32em] uppercase text-gold/80">
                  {c.t}
                </h4>

                <p className="mt-2 font-serif text-2xl">
                  {c.v}
                </p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </div>
  );
}