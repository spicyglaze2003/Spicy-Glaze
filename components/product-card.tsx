"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { formatPrice, getProductImageUrl } from "@/lib/utils";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const { addItem } = useCartStore();
  const thumbnailUrl = getProductImageUrl(product);
  const productHref = `/products/${product.slug || product.productId || product.id}`;

  const currentPrice = product.variants?.length
    ? product.variants[0].price
    : product.price;

  const currentMrp = product.mrp || 0;
  const hasDiscount = currentMrp > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100)
    : 0;

  const handleQuickAddToCart = () => {
    const defaultVariant = product.variants?.[0];
    const variantId = defaultVariant ? String(defaultVariant.id) : `default-${product.id}`;
    const variantName = defaultVariant?.name || "Standard";

    addItem({
      variantId,
      productId: String(product.id),
      name: variantName,
      productName: product.name,
      price: currentPrice,
      quantity: 1,
      stock: defaultVariant?.stock !== undefined ? defaultVariant.stock : (product.stock ?? 999),
      imageUrl: thumbnailUrl || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div className="group block rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-border/50">
        <Link href={productHref} className="relative aspect-square overflow-hidden bg-gradient-to-br from-cream to-beige block cursor-pointer">
          {thumbnailUrl && !imgError ? (
            <Image
              src={thumbnailUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🌶️</span>
            </div>
          )}

          {/* Availability Badge */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                product.availability === "in-stock"
                  ? "bg-leaf/90 text-white"
                  : product.availability === "pre-order"
                  ? "bg-turmeric/90 text-white"
                  : "bg-charcoal/70 text-white"
              }`}
            >
              {product.availability === "in-stock"
                ? "In Stock"
                : product.availability === "pre-order"
                ? "Pre-Order"
                : "Out of Stock"}
            </span>

            {hasDiscount && (
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary text-white shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </Link>

        <div className="p-5">
          {product.category && (
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1.5">
              {product.category.name}
            </p>
          )}

          <Link href={productHref} className="block group/title">
            <h3 className="font-[var(--font-playfair)] text-lg font-semibold text-charcoal group-hover/title:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {(product.shortDescription || product.description) && (
            <p className="text-xs text-muted mt-1.5 line-clamp-2 min-h-[32px]">
              {product.shortDescription || product.description}
            </p>
          )}

          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-xl font-bold text-charcoal">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted line-through">
                {formatPrice(currentMrp)}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Link
              href={productHref}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary/10 text-primary py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-primary hover:text-white transition-all shadow-sm cursor-pointer group/btn"
            >
              <span>View & Order</span>
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleQuickAddToCart();
              }}
              disabled={product.availability === "out-of-season" || (product.stock !== undefined && product.stock <= 0)}
              className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
              title="Add to Cart"
              aria-label="Add to Cart"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
