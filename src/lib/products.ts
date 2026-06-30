// src/lib/products.ts
import p1 from "@/assets/p-1.jpg";
import p2 from "@/assets/p-2.jpg";
import p3 from "@/assets/p-3.jpg";
import p4 from "@/assets/p-4.jpg";
import earrings from "@/assets/cat-earrings.jpg";
import necklaces from "@/assets/cat-necklaces.jpg";
import bracelets from "@/assets/cat-bracelets.jpg";
import rings from "@/assets/cat-rings.jpg";
import belts from "@/assets/cat-belts.jpg";
import type { Product } from "@/components/ProductCard";

export const heroImages = { p1, p2, p3, p4 };

export const collections = [
  { slug: "earrings", name: "Earrings", image: earrings, tagline: "Whisper at the lobe" },
  { slug: "necklaces", name: "Necklaces", image: necklaces, tagline: "Set against the skin" },
  { slug: "bracelets", name: "Bracelets", image: bracelets, tagline: "A stack of stories" },
  { slug: "rings", name: "Rings", image: rings, tagline: "Vows in 18k gold" },
  { slug: "belts", name: "Beaded Belts", image: belts, tagline: "Sculpt the silhouette" },
] as const;

export const bestSellers: Product[] = [
  { id: "1", name: "Soleil Pavé Hoops", category: "Earrings", price: 1280, image: p1, tag: "New" },
  { id: "2", name: "Étoile Solitaire", category: "Necklaces", price: 1850, image: p2 },
  { id: "3", name: "Aurore Tennis", category: "Bracelets", price: 2640, image: p3, tag: "Bestseller" },
  { id: "4", name: "Rubis de Lira", category: "Rings", price: 3420, image: p4, tag: "Limited" },
];

// Mock data tracking luxury carts currently active across users
export const mockCartData = [
  { id: "C-901", user: "Eleanor V.", items: ["Soleil Pavé Hoops", "Aurore Tennis"], total: 3920, itemsCount: 2, status: "Active Checkout" },
  { id: "C-902", user: "Julian M.", items: ["Rubis de Lira"], total: 3420, itemsCount: 1, status: "Abandoned" },
  { id: "C-903", user: "Clara D.", items: ["Étoile Solitaire", "Soleil Pavé Hoops"], total: 3130, itemsCount: 2, status: "Saved to Wishlist" },
];