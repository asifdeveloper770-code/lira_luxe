import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative bg-ink text-foreground/80 mt-32 border-t border-border">
      <div className="container-luxe py-20 grid gap-14 md:grid-cols-12">
        <div className="md:col-span-4 space-y-6">
          <Logo />
          <p className="text-sm leading-relaxed text-foreground/60 max-w-xs">
            Maison Lira Fashion crafts heirloom jewellery and accessories for the modern muse —
            sculpted in 18k gold, set by hand.
          </p>
          <div className="flex items-center gap-4 text-gold/80">
            <a aria-label="Instagram" href="#" className="hover:text-gold transition"><Instagram size={18} strokeWidth={1.4} /></a>
            <a aria-label="Facebook" href="#" className="hover:text-gold transition"><Facebook size={18} strokeWidth={1.4} /></a>
            <a aria-label="Youtube" href="#" className="hover:text-gold transition"><Youtube size={18} strokeWidth={1.4} /></a>
          </div>
        </div>

        <FooterCol title="Maison" links={[
          { label: "Our Story", to: "/about" },
          { label: "Craftsmanship", to: "/about" },
          { label: "Sustainability", to: "/about" },
          { label: "Journal", to: "/about" },
        ]} />
        <FooterCol title="Boutique" links={[
          { label: "Earrings", to: "/collections/earrings" },
          { label: "Necklaces", to: "/collections/necklaces" },
          { label: "Bracelets", to: "/collections/bracelets" },
          { label: "Rings", to: "/collections/rings" },
          { label: "Beaded Belts", to: "/collections/belts" },
        ]} />
        <FooterCol title="Client Care" links={[
          { label: "Contact", to: "/contact" },
          { label: "Shipping", to: "/shipping" },
          { label: "Returns", to: "/returns" },
          { label: "FAQ", to: "/faq" },
          { label: "Account", to: "/account" },
        ]} />
      </div>

      <div className="border-t border-border">
        <div className="container-luxe py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] tracking-[0.22em] uppercase text-foreground/50">
          <p>© {new Date().getFullYear()} Lira Fashion — Maison de Bijoux</p>
          <p>Hand-set in Paris · Milan · New York</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div className="md:col-span-2 lg:col-span-2 space-y-5">
      <h4 className="text-[11px] tracking-[0.32em] uppercase text-gold">{title}</h4>
      <ul className="space-y-3 text-sm text-foreground/65">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="hover:text-gold transition">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default Footer;