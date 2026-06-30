import { Link } from "react-router-dom";
import { useCart } from "@/components/CartContext";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  tag?: string;
};
// const { addToCart } = useCart();

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to="/shop" className="product-card group block">
      <div className="img-wrap relative  bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={900}
          height={1100}
          className="w-full h-full aspect-[4/5] object-cover"
        />
        {product.tag && (
          <span className="absolute top-4 left-4 text-[10px] tracking-[0.28em] uppercase text-gold border border-gold/60 px-2.5 py-1 bg-ink/40 backdrop-blur-sm">
            {product.tag}
          </span>
        )}
        <div className="absolute inset-x-4 bottom-4 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <button
            className="btn-gold"
            onClick={() =>
              addToCart({
                id: product.id,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity: 1,
              })
            }
          >
            Add to Cart
          </button>       
           </div>
      </div>
      <div className="pt-5 text-center">
        <p className="text-[10px] tracking-[0.32em] uppercase text-gold/80">{product.category}</p>
        <h3 className="mt-2 font-serif text-xl md:text-2xl text-foreground group-hover:text-gold transition-colors">
          {product.name}
        </h3>
        <p className="mt-1.5 text-sm text-foreground/70">${product.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}
export default ProductCard;
