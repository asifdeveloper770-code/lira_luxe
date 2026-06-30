import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  X,
} from "lucide-react";

// import { bestSellers } from "@/lib/products";
import { SectionLabel } from "@/components/Reveal";
import { useCart } from "@/components/CartContext";



export default function CartPage() {
  const {
    cart,
    increaseQty,
    decreaseQty,
    removeFromCart,
  } = useCart();

  const items = cart;
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="pt-32 pb-24 container-luxe">
      <div className="text-center">
        <SectionLabel>
          Votre Bag
        </SectionLabel>

        <h1 className="mt-6 font-serif text-5xl md:text-6xl">
          Shopping{" "}
          <em className="italic gradient-gold-text">
            Bag
          </em>
        </h1>
      </div>

      <div className="mt-16 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((p) => (
            <div
              key={p.id}
              className="flex gap-5 border-b border-border pb-6"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-28 h-36 object-cover"
              />

              <div className="flex-1 flex flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="text-[10px] tracking-[0.32em] uppercase text-gold/80">
                      {/* {p.category} */}
                    </p>

                    <h3 className="mt-1 font-serif text-2xl">
                      {p.name}
                    </h3>
                  </div>

                  <button onClick={() => removeFromCart(p.id)}>
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <div className="inline-flex items-center border border-border">
                    <button onClick={() => decreaseQty(p.id)}>
                      <Minus size={14} />
                    </button>

                    <span>{p.quantity}</span>

                    <button onClick={() => increaseQty(p.id)}>
                      <Plus size={14} />
                    </button>
                  </div>

                  <p className="font-serif text-xl text-gold">
                    $
                    {(p.price * p.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-card/70 border border-border p-8 h-fit">
          <h3 className="font-serif text-2xl">
            Order Summary
          </h3>

          <div className="hairline my-6" />

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground/70">
                Subtotal
              </dt>

              <dd>
                $
                {subtotal.toLocaleString()}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-foreground/70">
                Shipping
              </dt>

              <dd className="text-gold">
                Complimentary
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-foreground/70">
                Engraving
              </dt>

              <dd className="text-gold">
                Included
              </dd>
            </div>
          </dl>

          <div className="hairline my-6" />

          <div className="flex justify-between items-end">
            <span className="text-[11px] tracking-[0.32em] uppercase text-foreground/60">
              Total
            </span>

            <span className="font-serif text-3xl gradient-gold-text">
              $
              {subtotal.toLocaleString()}
            </span>
          </div>

          <button className="btn-gold w-full mt-8">
            Secure Checkout
          </button>

          <Link
            to="/shop"
            className="block text-center mt-4 text-[11px] tracking-[0.32em] uppercase text-gold link-underline"
          >
            Continue Browsing
          </Link>
        </aside>
      </div>
    </div>
  );
}