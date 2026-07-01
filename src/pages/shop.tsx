import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProductCard from "../components/ProductCard";
import { Reveal, SectionLabel } from "../components/Reveal";

export default function ShopPage() {
  interface Category {
    id: string;
    name: string;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  // const [activeFilter, setActiveFilter] = useState("All");

  //   const all = [...collections.flatMap((c) =>
  //     bestSellers.filter((p) => p.category === c.name)
  //   )];
  useEffect(() => {
    getProducts();
    getCategories();
  }, []);

  const getProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select(`
      *,
      categories(name)
    `);

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data || []);
  };

  const getCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setCategories(data || []);
  };
  const filteredProducts =
    activeFilter === "All"
      ? products
      : products.filter(
        (p) => p.categories?.name === activeFilter
      );

  return (
    <div className="pt-32 pb-24">
      <section className="container-luxe text-center">
        <SectionLabel>
          La Boutique
        </SectionLabel>

        <h1 className="mt-6 font-serif text-5xl md:text-7xl">
          The Atelier{" "}
          <em className="italic gradient-gold-text">
            Catalogue
          </em>
        </h1>

        <p className="mt-6 max-w-xl mx-auto text-foreground/70">
          Every piece in the Maison — by category,
          gemstone, or hand of the maker.
        </p>
      </section>

      {/* FILTERS */}
      <section className="container-luxe mt-16 flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setActiveFilter("All")}
          className={`btn-ghost-gold !py-2.5 !px-5 text-[10px] ${activeFilter === "All"
            ? "bg-gold text-black"
            : ""
            }`}
        >
          All
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveFilter(c.name)}
            className={`btn-ghost-gold !py-2.5 !px-5 text-[10px] ${activeFilter === c.name
              ? "bg-gold text-black"
              : ""
              }`}
          >
            {c.name}
          </button>
        ))}
      </section>

      {/* PRODUCTS */}
      <section className="container-luxe mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
        {filteredProducts.map((p, i) => (
          <Reveal key={p.id} delay={i * 60}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </section>
    </div>
  );
}