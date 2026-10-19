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
  tag?: string | null;
  sku?: string | null;
  description?: string | null;
  /** Extra photos of the same piece (e.g. A305–A307 paired with the main stand photo) */
  images?: string[] | null;
  /** Available sizes, e.g. ring sizes ["5","6","7","8","9"] */
  sizes?: string[] | null;
};

export default function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const extraPhotos = (product.images || []).filter(Boolean).length;

  return (
    <div className="product-card group block">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full text-left cursor-pointer"
        aria-label={`View details for ${product.name}`}
      >
        <div className="img-wrap relative bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full aspect-[4/5] object-cover"
          />

          {product.tag && (
            <span className="absolute top-4 left-4 text-[10px] tracking-[0.28em] uppercase text-gold border border-gold/60 px-2.5 py-1 bg-ink/40 backdrop-blur-sm">
              {product.tag}
            </span>
          )}

          {extraPhotos > 0 && (
            <span className="absolute top-4 right-4 text-[10px] tracking-[0.2em] uppercase text-foreground/90 px-2 py-1 bg-ink/60 backdrop-blur-sm">
              +{extraPhotos} photo{extraPhotos > 1 ? "s" : ""}
            </span>
          )}

          <div className="absolute inset-x-4 bottom-4 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hidden md:block">
            <span className="btn-gold w-full">Quick View</span>
          </div>
        </div>

        <div className="pt-5 text-center">
          <p className="text-[10px] tracking-[0.32em] uppercase text-gold/80">
            {product.categories?.name ?? "Uncategorized"}
          </p>

          <h3 className="mt-2 font-serif text-xl md:text-2xl text-foreground group-hover:text-gold transition-colors">
            {product.name}
          </h3>

          <p className="mt-1.5 text-sm text-foreground/70 group-hover:text-foreground">
            ${Number(product.price).toLocaleString()}
          </p>

          <p className="mt-2 text-[10px] tracking-[0.28em] uppercase text-gold/70 md:hidden">
            Tap for details
          </p>
        </div>
      </button>

      <QuickViewModal product={product} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
