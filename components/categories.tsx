"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { getCategories } from "@/lib/api";
import { getStrapiMedia } from "@/lib/utils";

export default function Categories() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const categories = data?.data || [];

  return (
    <section className="relative py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-medium text-primary uppercase tracking-[0.2em] mb-4">
            Browse By
          </span>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-charcoal">
            Shop by <span className="text-gradient">Category</span>
          </h2>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden bg-white shadow-sm">
                <div className="aspect-square animate-shimmer" />
                <div className="p-4">
                  <div className="h-5 w-24 animate-shimmer rounded-full mx-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/products?category=${cat.slug || cat.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || ''}`}
                  className="group block rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-cream to-beige">
                    {cat.image ? (
                      <Image
                        src={getStrapiMedia(cat.image.url)}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        🍯
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-[var(--font-playfair)] text-lg font-semibold text-charcoal group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-xs text-muted mt-1 line-clamp-1">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
