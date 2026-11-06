"use client";

import { useState, useMemo, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getProducts, getCategories } from "@/lib/api";
import ProductCard from "@/components/product-card";
import ProductCardSkeleton from "@/components/skeletons/product-card-skeleton";
import { cn } from "@/lib/utils";

const getCategorySlug = (cat: { slug?: string | null; name?: string }) =>
  cat.slug || cat.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");

  // Read category directly from URL parameter (ignore "null" or "undefined" literals)
  const rawCategoryParam = searchParams.get("category");
  const selectedCategory =
    rawCategoryParam && rawCategoryParam !== "null" && rawCategoryParam !== "undefined"
      ? rawCategoryParam
      : "";

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: () =>
      getProducts({
        category: selectedCategory || undefined,
        pageSize: 100,
      }),
  });

  const categories = categoriesData?.data || [];

  const handleCategoryClick = (catSlug: string) => {
    const nextCat = selectedCategory === catSlug ? "" : catSlug;
    if (nextCat) {
      router.push(`${pathname}?category=${nextCat}`, { scroll: false });
    } else {
      router.push(pathname, { scroll: false });
    }
  };

  const filteredProducts = useMemo(() => {
    const all = data?.data || [];
    let list = all.filter((p) => {
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        p.shortDescription?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.category?.name.toLowerCase().includes(term)
      );
    });

    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => {
        const priceA = a.variants?.[0]?.price ?? a.price;
        const priceB = b.variants?.[0]?.price ?? b.price;
        return priceA - priceB;
      });
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => {
        const priceA = a.variants?.[0]?.price ?? a.price;
        const priceB = b.variants?.[0]?.price ?? b.price;
        return priceB - priceA;
      });
    } else if (sortBy === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [data, search, sortBy]);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-cream/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-4 py-1.5 rounded-full inline-block mb-3">
            Pure & Artisanal
          </span>
          <h1 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-charcoal">
            Our <span className="text-gradient">Products</span>
          </h1>
          <p className="mt-3 text-charcoal-light/80 max-w-xl mx-auto text-sm md:text-base">
            Explore our curated range of authentic Indian spices, raw forest honey, stone-ground masalas, and handcrafted gourmet preserves.
          </p>
        </motion.div>

        {/* Search, Filter & Sort Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto">
            <div className="relative w-full">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by spice name, flavour, or ingredients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-full bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort Control */}
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-border shadow-sm text-xs font-semibold text-charcoal w-full sm:w-auto flex-shrink-0">
              <SlidersHorizontal size={14} className="text-primary" />
              <label htmlFor="sort-select" className="text-gray-500 whitespace-nowrap">Sort:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-charcoal focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <button
              onClick={() => handleCategoryClick("")}
              className={cn(
                "px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 cursor-pointer shadow-sm",
                !selectedCategory
                  ? "bg-primary text-white shadow-primary/20 scale-105"
                  : "bg-white text-charcoal-light hover:bg-orange-50 border border-border"
              )}
            >
              All Products
            </button>
            {categories.map((cat) => {
              const catSlug = getCategorySlug(cat);
              const isSelected = selectedCategory === catSlug;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(catSlug)}
                  className={cn(
                    "px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 cursor-pointer shadow-sm",
                    isSelected
                      ? "bg-primary text-white shadow-primary/20 scale-105"
                      : "bg-white text-charcoal-light hover:bg-orange-50 border border-border"
                  )}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-xs text-gray-500 max-w-7xl mx-auto px-2 pt-2">
            <span>
              Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "product" : "products"}
              {selectedCategory && ` in ${categories.find(c => getCategorySlug(c) === selectedCategory)?.name || selectedCategory}`}
            </span>

            {(selectedCategory || search) && (
              <button
                onClick={() => {
                  setSearch("");
                  handleCategoryClick("");
                }}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-3xl p-8 max-w-md mx-auto shadow-sm border border-border"
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-charcoal mb-2 font-[var(--font-playfair)]">
              No products found
            </h3>
            <p className="text-muted text-sm mb-6">
              {search
                ? `No products match "${search}". Try checking for typos or searching general terms.`
                : "No products currently available in this category."}
            </p>
            <button
              onClick={() => {
                setSearch("");
                handleCategoryClick("");
              }}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all cursor-pointer"
            >
              Reset Filters & Show All
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-28 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
