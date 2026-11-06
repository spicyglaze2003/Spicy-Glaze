"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { getFeaturedProducts } from "@/lib/api";
import ProductCard from "./product-card";
import ProductCardSkeleton from "./skeletons/product-card-skeleton";

export default function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: getFeaturedProducts,
  });

  const products = data?.data || [];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-white to-cream" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-medium text-primary uppercase tracking-[0.2em] mb-4">
            Our Collection
          </span>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-charcoal">
            Featured <span className="text-gradient">Products</span>
          </h2>
          <p className="mt-4 text-charcoal-light/70 max-w-xl mx-auto">
            Handpicked favourites that showcase the authentic flavours of India
          </p>
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all duration-300"
          >
            View All Products
            <span className="text-lg">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
