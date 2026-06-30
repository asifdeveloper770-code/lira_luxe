import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

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
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">

        {collection.image && (
          <img
            src={collection.image}
            alt={collection.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">

          <SectionLabel>
            Collection
          </SectionLabel>

          <h1 className="mt-6 text-6xl font-bold text-white">
            {collection.name}
          </h1>

          <p className="mt-4 text-white/80 max-w-xl">
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