import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "./CartContext";

interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  description?: string;
  price: number;
}

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export default function QuickViewModal({
  product,
  open,
  onClose,
}: Props) {
  const { addToCart } = useCart();

  const [qty, setQty] = useState(1);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">

        <div className="grid md:grid-cols-2 gap-10">

          <img
            src={product.image}
            alt={product.name}
            className="rounded-lg object-cover w-full"
          />

          <div>

            <DialogHeader>
              <DialogTitle className="text-3xl font-serif">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            <p className="uppercase tracking-[0.3em] text-gold text-xs mt-2">
              {product.category}
            </p>

            <p className="mt-6 text-foreground/70">
              {product.description}
            </p>

            <h2 className="text-3xl font-serif mt-8">
              ${product.price.toLocaleString()}
            </h2>

            <div className="flex items-center gap-4 mt-8">

              <button
                onClick={() =>
                  setQty(Math.max(1, qty - 1))
                }
              >
                <Minus />
              </button>

              <span>{qty}</span>

              <button
                onClick={() =>
                  setQty(qty + 1)
                }
              >
                <Plus />
              </button>

            </div>

            <button
              className="btn-gold w-full mt-8"
              onClick={() => {
                addToCart({
                  id: product.id,
                  name: product.name,
                  image: product.image,
                  price: product.price,
                  quantity: qty,
                });

                onClose();
              }}
            >
              Add To Cart
            </button>

          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}