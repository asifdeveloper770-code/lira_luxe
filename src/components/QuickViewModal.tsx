import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "./CartContext";
import type { Product } from "./ProductCard";

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, open, onClose }: Props) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string>("");
  const [sizeError, setSizeError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const gallery = useMemo(() => {
    if (!product) return [];
    const all = [product.image, ...(product.images || [])].filter(Boolean) as string[];
    return Array.from(new Set(all));
  }, [product]);

  const sizes = useMemo(
    () => (product?.sizes || []).map((s) => String(s).trim()).filter(Boolean),
    [product],
  );

  // Reset the popup every time it opens
  useEffect(() => {
    if (open) {
      setQty(1);
      setSize("");
      setSizeError(false);
      setActiveImage(0);
    }
  }, [open]);

  if (!product) return null;

  const description = product.description?.trim();

  const handleAdd = () => {
    if (sizes.length > 0 && !size) {
      setSizeError(true);
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: Number(product.price),
      quantity: qty,
      size: size || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* On phones the whole popup scrolls, so the description is always reachable */}
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-4xl max-h-[92svh] overflow-y-auto md:overflow-hidden p-0 gap-0 border border-gold/20 bg-background shadow-2xl sm:rounded-none [&>button:last-child]:z-10 [&>button:last-child]:rounded-full [&>button:last-child]:bg-black/60 [&>button:last-child]:p-1.5 [&>button:last-child]:text-white [&>button:last-child]:opacity-100">
        <div className="grid md:grid-cols-2">
          {/* Images */}
          <div className="bg-secondary">
            <div className="relative">
              <img
                src={gallery[activeImage] || product.image}
                alt={product.name}
                className="w-full aspect-square md:aspect-[4/5] max-h-[48svh] md:max-h-[600px] object-cover"
              />
              <span className="absolute top-4 left-4 backdrop-blur-md bg-black/40 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                {product.categories?.name ?? "Uncategorized"}
              </span>
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto scrollbar-luxe">
                {gallery.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`Photo ${i + 1}`}
                    className={`shrink-0 w-14 h-14 border transition ${
                      i === activeImage ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col p-6 sm:p-8 md:p-10 justify-between md:max-h-[600px] md:overflow-y-auto scrollbar-luxe">
            <div>
              <DialogHeader className="space-y-1 text-left">
                {product.sku && (
                  <p className="text-[10px] tracking-[0.32em] uppercase text-gold/70">Ref. {product.sku}</p>
                )}
                <DialogTitle className="text-2xl sm:text-3xl font-serif tracking-tight text-foreground pr-6">
                  {product.name}
                </DialogTitle>
              </DialogHeader>

              <p className="text-2xl font-medium text-gold font-serif mt-4">
                ${Number(product.price).toLocaleString()}
              </p>

              <hr className="my-5 border-border" />

              <DialogDescription asChild>
                <div className="text-sm sm:text-base font-serif text-foreground/75 leading-relaxed whitespace-pre-line">
                  {description || "Handmade & designed by Lira Fashion. Each handcrafted piece is unique — colours, shapes and sizes may vary."}
                </div>
              </DialogDescription>

              {sizes.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] tracking-[0.28em] uppercase text-foreground/70">Size</span>
                    {sizeError && <span className="text-xs text-red-400">Please choose a size</span>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setSize(s);
                          setSizeError(false);
                        }}
                        className={`min-w-11 h-11 px-3 border text-sm transition ${
                          size === s
                            ? "border-gold bg-gold text-black"
                            : `border-border text-foreground/80 hover:border-gold ${sizeError ? "border-red-400/60" : ""}`
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between sm:justify-start gap-6">
                <span className="text-sm font-medium text-muted-foreground">Quantity</span>
                <div className="flex items-center bg-muted border border-input rounded-full p-1 shadow-sm">
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground transition-all duration-200 active:scale-95 disabled:opacity-50"
                    disabled={qty <= 1}
                    onClick={() => setQty(Math.max(1, qty - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-foreground select-none">{qty}</span>
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground transition-all duration-200 active:scale-95"
                    onClick={() => setQty(qty + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button className="btn-gold w-full" onClick={handleAdd}>
                Add to Cart — ${(Number(product.price) * qty).toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
