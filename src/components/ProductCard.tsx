import { Link } from "react-router-dom";
import { useCart } from "@/components/CartContext";
import { useState } from "react";
import QuickViewModal from "./QuickViewModal";

export type Product = {
  id: string;
  name: string;
  category_id: string;
  categories: {
    name: string;
  };
  price: number;
  image: string;
  tag?: string;
};

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addToCart } = useCart();
  const [open, setOpen] = useState(false);


  return (
    <div className="product-card group block">
      <div className="img-wrap relative bg-secondarycursor-pointer"
        onClick={() => setOpen(true)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full aspect-[4/5] object-cover"
        />

        {product.tag && (
          <span className="absolute top-4 left-4 text-[10px] tracking-[0.28em] uppercase text-gold border border-gold/60 px-2.5 py-1 bg-ink/40 backdrop-blur-sm">
            {product.tag}
          </span>
        )}

        <div className="absolute inset-x-4 bottom-4 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">

          <button
            className="btn-gold w-full"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(true);
            }}
          >
            Quick View
          </button>

        </div>
      </div>

      <div className="pt-5 text-center">
        <p className="text-[10px] tracking-[0.32em]  uppercase text-gold/80">
          {product.categories?.name ?? "Uncategorized"}
        </p>

        <h3 className="mt-2 font-serif text-xl md:text-2xl text-foreground group-hover:text-gold transition-colors">
          {product.name}
        </h3>

        <p className="mt-1.5 text-sm text-foreground/70 group-hover:text-foreground">
          ${product.price.toLocaleString()}
        </p>
      </div>
      <QuickViewModal
        product={product}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>


  );

}
