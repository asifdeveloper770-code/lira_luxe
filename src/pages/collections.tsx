import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { collections } from "@/lib/products";

import ProductCard from "../components/ProductCard";
import { Reveal, SectionLabel } from "../components/Reveal";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  tagline?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  tag?: string;
  category_id: string;
  categories: {
    name: string;
  };
}

export default function CollectionPage() {
  const { slug } = useParams();

  const [collection, setCollection] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadCollection();
    }
  }, [slug]);

  const loadCollection = async () => {
    setLoading(true);

    // Get category
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (categoryError || !category) {
      setLoading(false);
      return;
    }

    setCollection(category);

    // Get products
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select(`
        *,
        categories(name)
      `)
      .eq("category_id", category.id);

    if (!productError) {
      setProducts(productData || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="pt-40 pb-32 text-center">
        Loading...
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="pt-40 pb-32 text-center">
        <h1 className="text-5xl font-bold">
          Collection not found
        </h1>

        <Link
          to="/shop"
          className="mt-8 inline-flex bg-black text-white px-6 py-3 rounded-xl"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div>
      <section className="relative w-full overflow-hidden bg-black flex flex-col justify-center items-center">

        {/* 1. Background Image - Set to object-contain so the FULL image is visible */}
        {collection.image && (
          <img
            src={collection.image}
            alt={collection.name}
            className="w-full max-h-[70vh] object-contain z-0 block mx-auto"
          />
        )}

        {/* 2. Overlap Overlay Content Wrapper */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center" />

        {/* 3. Foreground Text Layer */}
        <div className="absolute inset-0 z-20 max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
          <SectionLabel>
            Collection
          </SectionLabel>

          <h1 className="mt-6 text-4xl sm:text-6xl font-bold text-white font-serif tracking-tight">
            {collection.name}
          </h1>

          <p className="mt-4 text-white/90 max-w-xl text-sm sm:text-base font-light tracking-wide leading-relaxed">
            {collection.tagline}
          </p>
        </div>

      </section>

      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">

        {products.map((product, index) => (
          <Reveal key={product.id} delay={index * 70}>
            <ProductCard product={product} />
          </Reveal>
        ))}

      </section>
    </div>
  );
}