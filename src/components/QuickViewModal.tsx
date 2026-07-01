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
    category_id: string;
    categories: {
        name: string;
    };
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
            <DialogContent className="max-w-4xl p-0 overflow-hidden sm:rounded-2xl gap-0 border-none bg-background shadow-2xl">
                <div className="grid md:grid-cols-2">

                    {/* Product Image Section */}
                    <div className="img-wrap relative bg-secondary cursor-pointer">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="object-cover w-full h-full min-h-full transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4">
                            <span className="backdrop-blur-md bg-black/40 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                                {product.categories.name}
                            </span>
                        </div>
                    </div>

                    {/* Product Details Section */}
                    <div className="flex flex-col p-6 sm:p-8 md:p-10 justify-between max-h-[90vh] md:max-h-[600px] overflow-y-auto">
                        <div>
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-2xl sm:text-3xl font-serif tracking-tight text-foreground">
                                    {product.name}
                                </DialogTitle>
                            </DialogHeader>

                            <p className="text-2xl font-medium text-gold font-serif mt-4 ">
                                ${product.price.toLocaleString()}
                            </p>

                            <hr className="my-5 border-border" />

                            <p className="text-sm sm:text-base font-serif text-muted-foreground leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Actions Footer */}
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between sm:justify-start gap-6">
                                <span className="text-sm font-medium text-muted-foreground">Quantity</span>

                                {/* Modernized Quantity Selector */}
                                <div className="flex items-center bg-muted border border-input rounded-full p-1 shadow-sm">
                                    <button
                                        type="button"
                                        className="w-8 h-8  flex items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground transition-all duration-200 active:scale-95 disabled:opacity-50"
                                        disabled={qty <= 1}
                                        onClick={() => setQty(Math.max(1, qty - 1))}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>

                                    <span className="w-10 text-center text-sm font-semibold text-foreground select-none">
                                        {qty}
                                    </span>

                                    <button
                                        type="button"
                                        className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground transition-all duration-200 active:scale-95"
                                        onClick={() => setQty(qty + 1)}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Premium CTA Button */}

                            <button
                                className="btn-gold w-full round-lg"
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
                                Add to Cart — ${(product.price * qty).toLocaleString()}
                            </button>
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}