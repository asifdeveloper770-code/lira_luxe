import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "@/components/CartContext";
import { CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { SectionLabel } from "@/components/Reveal";

export default function Success() {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id");
  const paymentIntent = searchParams.get("payment_intent");
  const referenceId =
    sessionId?.slice(-8).toUpperCase() ||
    paymentIntent?.slice(-8).toUpperCase() ||
    Math.random().toString(36).substring(2, 10).toUpperCase();

  useEffect(() => {
    // Clear cart on successful checkout
    clearCart();
  }, []);

  return (
    <div className="container-luxe pt-36 pb-24 max-w-2xl text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1c1a17] border border-[#c5a880]/40 text-[#c5a880] mb-6">
        <CheckCircle2 size={32} />
      </div>

      <SectionLabel>Maison Confirmation</SectionLabel>

      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">
        Payment <em className="italic gradient-gold-text">Successful</em>
      </h1>

      <p className="mt-4 text-foreground/75 leading-relaxed">
        Thank you for choosing Maison Lira. Your order has been registered at our atelier and is being prepared with our signature white-glove craftsmanship.
      </p>

      {/* Luxury Receipt Card */}
      <div className="mt-8 bg-[#141311] border border-[#2e2a22] p-6 text-left space-y-4">
        <div className="flex items-center justify-between border-b border-[#2e2a22] pb-3 text-xs font-mono text-[#c5a880]">
          <span className="uppercase tracking-widest">Order Dossier</span>
          <span>#{referenceId}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-foreground/50 block font-mono text-[10px] uppercase">
              Payment Gateway
            </span>
            <span className="text-foreground font-mono">Stripe Secure (USD)</span>
          </div>

          <div>
            <span className="text-foreground/50 block font-mono text-[10px] uppercase">
              Fulfillment Status
            </span>
            <span className="text-emerald-400 font-mono">Confirmed & Queued</span>
          </div>

          <div className="col-span-2">
            <span className="text-foreground/50 block font-mono text-[10px] uppercase">
              Provenance & Logistics
            </span>
            <span className="text-foreground/80 leading-relaxed block mt-1">
              Hand-packaged in a wax-sealed box, insured worldwide dispatch. A confirmation and tracking receipt have been dispatched to your email.
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#2e2a22] flex items-center justify-between text-[11px] font-mono text-foreground/60">
          <span className="inline-flex items-center gap-1.5 text-[#c5a880]">
            <ShieldCheck size={14} />
            <span>Lifetime Atelier Care Activated</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Sparkles size={12} />
            <span>Certified 18k</span>
          </span>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/shop" className="btn-gold text-xs">
          <span>Continue Browsing</span>
          <ArrowRight size={14} className="inline ml-1" />
        </Link>
        <Link to="/" className="btn-ghost-gold text-xs">
          Return Home
        </Link>
      </div>
    </div>
  );
}
