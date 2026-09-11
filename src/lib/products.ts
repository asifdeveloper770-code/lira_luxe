// src/lib/products.ts
import p1 from "@/assets/earring mockup.png";
import p2 from "@/assets/p-2.jpg";
import p3 from "@/assets/p-3.jpg";
import p4 from "@/assets/p-4.jpg";
import earrings from "@/assets/cat-earrings.jpg";
import necklaces from "@/assets/cat-necklaces.jpg";
import bracelets from "@/assets/cat-bracelets.jpg";
import rings from "@/assets/cat-rings.jpg";
import belts from "@/assets/cat-belts.jpg";
import type { Product } from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
// import type { Product } from "@/components/ProductCard";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  tagline: string | null;
  created_at: string;
}

// Fetch categories from Supabase database
export async function getCategories(): Promise<Category[]> {
  const excludedSlugs = ["watches", "keychains", "pendants"];

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .not("slug", "in", `(${excludedSlugs.map((s) => `"${s}"`).join(",")})`)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error.message);
    return [];
  }

  return data;
}

// Optional helper to resolve full image URLs if images are stored in Supabase Storage buckets
export function getCategoryImageUrl(path: string | null): string {
  if (!path) return "/placeholder.jpg"; // Default fallback image
  if (path.startsWith("http")) return path; // Direct external URL

  // Resolves image from a public bucket named 'category-images'
  const { data } = supabase.storage.from("category-images").getPublicUrl(path);
  return data.publicUrl;
}

export const heroImages = { p1, p2, p3, p4 };

export const collections = [
  { slug: "earrings", name: "Earrings", image: earrings, tagline: "Whisper at the lobe" },
  { slug: "necklaces", name: "Necklaces", image: necklaces, tagline: "Set against the skin" },
  { slug: "bracelets", name: "Bracelets", image: bracelets, tagline: "A stack of stories" },
  { slug: "rings", name: "Rings", image: rings, tagline: "Vows in 18k gold" },
  { slug: "belts", name: "Beaded Belts", image: belts, tagline: "Sculpt the silhouette" },
] as const;

export const collections_product = [
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