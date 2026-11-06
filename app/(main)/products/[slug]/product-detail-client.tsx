"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { formatPrice, getProductImageUrl, normalizeImageUrl } from "@/lib/utils";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";
import {
  Minus,
  Plus,
  ShoppingCart,
  ChevronRight,
  ShieldCheck,
  Truck,
  Sparkles,
  CheckCircle2,
  PackageCheck,
  Flame,
  ArrowRight,
} from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSiteConfig, cleanPhoneNumber } from "@/components/site-config-provider";
import ProductCard from "@/components/product-card";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts?: Product[];
}

export default function ProductDetailClient({
  product,
  relatedProducts = [],
}: ProductDetailClientProps) {
  const router = useRouter();
  const siteConfig = useSiteConfig();
  const waNum = cleanPhoneNumber(siteConfig.whatsappNumber);

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants?.length ? String(product.variants[0].id) : ""
  );
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "shipping">("description");

  const addItem = useCartStore((state) => state.addItem);

  const selectedVariant =
    product.variants?.find((v) => String(v.id) === selectedVariantId) || null;

  const effectivePrice = Number(selectedVariant?.price ?? product.price ?? 0);
  const effectiveMrp = Number(selectedVariant?.mrp ?? product.mrp ?? 0);
  const effectiveVariantId = selectedVariant
    ? String(selectedVariant.id)
    : String(product.id);
  const effectiveVariantName = selectedVariant
    ? selectedVariant.name
    : "Standard Pack";

  const stockAvailable =
    selectedVariant?.stock !== undefined
      ? selectedVariant.stock
      : product.stock !== undefined
      ? product.stock
      : 50;

  const isOutOfStock = product.availability === "out-of-season" || stockAvailable <= 0;
  const hasDiscount = effectiveMrp > effectivePrice;
  const savings = hasDiscount ? effectiveMrp - effectivePrice : 0;
  const discountPercent = hasDiscount
    ? Math.round((savings / effectiveMrp) * 100)
    : 0;

  const thumbnailUrl = getProductImageUrl(product);

  // Collect all product images for gallery
  const galleryImages: string[] = [];
  if (thumbnailUrl) galleryImages.push(thumbnailUrl);
  if (product.imageUrl) {
    const norm = normalizeImageUrl(product.imageUrl);
    if (norm && !galleryImages.includes(norm)) {
      galleryImages.push(norm);
    }
  }
  if (Array.isArray(product.images)) {
    product.images.forEach((img: any) => {
      const rawUrl = typeof img === "string" ? img : img?.url;
      if (rawUrl) {
        const norm = normalizeImageUrl(rawUrl);
        if (norm && !galleryImages.includes(norm)) {
          galleryImages.push(norm);
        }
      }
    });
  }

  const [activeImage, setActiveImage] = useState<string>(galleryImages[0] || "");

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("This product is currently out of stock");
      return;
    }

    addItem({
      variantId: effectiveVariantId,
      productId: String(product.id),
      name: effectiveVariantName,
      productName: product.name,
      price: effectivePrice,
      quantity,
      stock: stockAvailable,
      imageUrl: activeImage || thumbnailUrl || undefined,
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error("This product is currently out of stock");
      return;
    }

    addItem({
      variantId: effectiveVariantId,
      productId: String(product.id),
      name: effectiveVariantName,
      productName: product.name,
      price: effectivePrice,
      quantity,
      stock: stockAvailable,
      imageUrl: activeImage || thumbnailUrl || undefined,
    });

    router.push("/checkout");
  };

  const handleDirectWhatsApp = () => {
    const totalItemPrice = effectivePrice * quantity;
    const msg = [
      `🌶️ *ORDER INQUIRY – SPICYGLAZE*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📦 *Product:* ${product.name}`,
      `🏷️ *Variant:* ${effectiveVariantName}`,
      `🔢 *Quantity:* ${quantity}`,
      `💰 *Price:* ${formatPrice(totalItemPrice)} (${formatPrice(effectivePrice)} each)`,
      `📌 *Code:* ${product.productId || `PROD-${product.id}`}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Hello SpicyGlaze Team! I want to order this product. Please share confirmation and delivery details!`,
    ].join("\n");

    const waUrl = `https://api.whatsapp.com/send?phone=${waNum}&text=${encodeURIComponent(
      msg
    )}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs md:text-sm text-charcoal/60 mb-2">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <Link href="/products" className="hover:text-primary transition-colors">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight size={14} className="text-gray-400" />
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-primary transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-charcoal font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-border/50">
        {/* Left: Image Showcase & Gallery (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl overflow-hidden bg-gradient-to-br from-cream to-beige relative aspect-square shadow-inner border border-border/40"
          >
            {(activeImage || thumbnailUrl) && !imgError ? (
              <Image
                src={activeImage || thumbnailUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <span className="text-7xl animate-pulse">🌶️</span>
                <span className="text-xs text-charcoal/40 font-medium">Naturally Crafted</span>
              </div>
            )}

            {/* Badges on Image */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                  isOutOfStock
                    ? "bg-red-500/95 text-white"
                    : product.availability === "pre-order"
                    ? "bg-amber-500/95 text-white"
                    : "bg-leaf text-white"
                }`}
              >
                <CheckCircle2 size={13} />
                {isOutOfStock
                  ? "Out of Stock"
                  : product.availability === "pre-order"
                  ? "Pre-Order"
                  : "In Stock & Fresh"}
              </span>

              {hasDiscount && (
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-primary text-white shadow-md">
                  <Flame size={12} /> Save {discountPercent}%
                </span>
              )}
            </div>
          </motion.div>

          {/* Thumbnail Strip (if multiple images) */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scrollbar-none">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveImage(img);
                    setImgError(false);
                  }}
                  className={cn(
                    "relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer",
                    activeImage === img
                      ? "border-primary shadow-sm scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt={`${product.name} view ${i + 1}`} fill className="object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-cream/40 border border-orange-100/60">
              <ShieldCheck size={20} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-charcoal">100% Pure & Fresh</p>
                <p className="text-[11px] text-gray-500">No preservatives</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-cream/40 border border-orange-100/60">
              <Truck size={20} className="text-leaf flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-charcoal">Fast Dispatch</p>
                <p className="text-[11px] text-gray-500">Across India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product Details, Options, & Actions (7 columns) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Category & Product ID */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              {product.category && (
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {product.category.name}
                  {product.subcategory ? ` • ${product.subcategory.name}` : ""}
                </span>
              )}

              {product.productId && (
                <span className="text-xs text-gray-400 font-mono">
                  SKU: {product.productId}
                </span>
              )}
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-[var(--font-playfair)] font-bold text-charcoal tracking-tight">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="text-charcoal-light/90 text-base mt-2.5 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Price & Savings Display */}
            <div className="p-4 rounded-2xl bg-cream/30 border border-orange-100/80 flex items-baseline gap-4 flex-wrap">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-extrabold text-charcoal">
                  {formatPrice(effectivePrice)}
                </span>
                {effectiveMrp && effectiveMrp > effectivePrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(effectiveMrp)}
                  </span>
                )}
              </div>

              {hasDiscount && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  You Save {formatPrice(savings)} ({discountPercent}% OFF)
                </span>
              )}

              <span className="text-xs text-gray-500 ml-auto font-medium">
                Inclusive of all taxes
              </span>
            </div>

            {/* Variants Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal">
                    Select Pack Size / Variant:
                  </label>
                  <span className="text-xs text-primary font-semibold">
                    {effectiveVariantName}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariantId === String(v.id);
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(String(v.id))}
                        className={cn(
                          "p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative",
                          isSelected
                            ? "border-primary bg-primary/5 text-primary shadow-sm ring-2 ring-primary/20"
                            : "border-border bg-white text-charcoal hover:border-primary/40 hover:bg-orange-50/20"
                        )}
                      >
                        <p className="text-xs font-bold truncate">{v.name}</p>
                        <p className="text-sm font-extrabold mt-1 text-charcoal">
                          {formatPrice(v.price)}
                        </p>
                        {v.mrp && v.mrp > v.price && (
                          <p className="text-[10px] text-gray-400 line-through">
                            MRP: {formatPrice(v.mrp)}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Stock status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  Quantity:
                </label>
                {!isOutOfStock && (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <PackageCheck size={14} />
                    {stockAvailable > 10 ? "In Stock (Ready to dispatch)" : `Only ${stockAvailable} left in stock`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-2xl bg-white p-1 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2 text-charcoal hover:text-primary transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold text-charcoal text-base">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(stockAvailable || 99, quantity + 1))}
                    disabled={quantity >= stockAvailable || isOutOfStock}
                    className="p-2 text-charcoal hover:text-primary transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="text-xs text-gray-500">
                  Subtotal: <strong className="text-charcoal font-bold text-sm">{formatPrice(effectivePrice * quantity)}</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 bg-charcoal hover:bg-black text-white py-4 px-6 rounded-2xl font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  <ShoppingCart size={18} />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-4 px-6 rounded-2xl font-bold transition-all shadow-lg shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  <span>Buy Now • {formatPrice(effectivePrice * quantity)}</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              <button
                onClick={handleDirectWhatsApp}
                className="w-full flex items-center justify-center gap-2.5 bg-leaf hover:bg-leaf/90 text-white py-3.5 px-6 rounded-2xl font-bold transition-all shadow-md shadow-leaf/20 cursor-pointer text-sm"
              >
                <BsWhatsapp size={19} />
                <span>Instant Order on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Detailed Description, Specifications, Shipping */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-10 shadow-sm border border-border/50">
        <div className="flex border-b border-border/70 gap-2 sm:gap-6 mb-8 overflow-x-auto no-scrollbar scrollbar-none py-1">
          <button
            onClick={() => setActiveTab("description")}
            className={cn(
              "pb-3.5 px-3 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 cursor-pointer flex-shrink-0 whitespace-nowrap",
              activeTab === "description"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-charcoal"
            )}
          >
            Product Description & Story
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={cn(
              "pb-3.5 px-3 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 cursor-pointer flex-shrink-0 whitespace-nowrap",
              activeTab === "details"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-charcoal"
            )}
          >
            Specifications & Features
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={cn(
              "pb-3.5 px-3 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 cursor-pointer flex-shrink-0 whitespace-nowrap",
              activeTab === "shipping"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-charcoal"
            )}
          >
            Delivery & Guarantee
          </button>
        </div>

        {activeTab === "description" && (
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-xl font-[var(--font-playfair)] font-bold text-charcoal">
              About {product.name}
            </h3>
            <div className="text-charcoal-light/90 leading-relaxed text-sm md:text-base space-y-3 whitespace-pre-line">
              {product.description ||
                product.shortDescription ||
                "Handcrafted using authentic culinary traditions. Each batch is made with carefully chosen natural ingredients, sun-cured to lock in real flavours and aroma. No artificial essences, chemical preservatives, or synthetic food colors are ever used."}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="p-4 rounded-2xl bg-cream/40 border border-orange-100">
                <Sparkles size={20} className="text-primary mb-2" />
                <h4 className="text-xs font-bold text-charcoal uppercase">Pure Heritage</h4>
                <p className="text-xs text-gray-600 mt-1">Ground and prepared following timeless recipes.</p>
              </div>
              <div className="p-4 rounded-2xl bg-cream/40 border border-orange-100">
                <ShieldCheck size={20} className="text-leaf mb-2" />
                <h4 className="text-xs font-bold text-charcoal uppercase">Zero Adulteration</h4>
                <p className="text-xs text-gray-600 mt-1">100% natural, tested for purity and aroma.</p>
              </div>
              <div className="p-4 rounded-2xl bg-cream/40 border border-orange-100">
                <PackageCheck size={20} className="text-turmeric mb-2" />
                <h4 className="text-xs font-bold text-charcoal uppercase">Aroma Seal Pack</h4>
                <p className="text-xs text-gray-600 mt-1">Hygienically packed to retain freshness.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="max-w-2xl">
            <h3 className="text-xl font-[var(--font-playfair)] font-bold text-charcoal mb-4">
              Product Specifications
            </h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 font-semibold text-gray-500 w-1/3">Product Code:</td>
                  <td className="py-3 text-charcoal font-mono">{product.productId || `PROD-${product.id}`}</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-gray-500">Category:</td>
                  <td className="py-3 text-charcoal">{product.category?.name || "Artisanal Gourmet"}</td>
                </tr>
                {product.subcategory && (
                  <tr>
                    <td className="py-3 font-semibold text-gray-500">Subcategory:</td>
                    <td className="py-3 text-charcoal">{product.subcategory.name}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-3 font-semibold text-gray-500">Shelf Life:</td>
                  <td className="py-3 text-charcoal">9 to 12 Months from packing</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-gray-500">Storage Instructions:</td>
                  <td className="py-3 text-charcoal">Store in a cool, dry place. Keep container airtight.</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-gray-500">Origin:</td>
                  <td className="py-3 text-charcoal">Crafted in India with single-origin raw spices</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="max-w-3xl space-y-4 text-sm text-charcoal-light/90">
            <h3 className="text-xl font-[var(--font-playfair)] font-bold text-charcoal mb-2">
              Shipping & Customer Care
            </h3>
            <p>
              🚚 <strong>Fast Dispatch:</strong> Orders placed before 2:00 PM are processed and dispatched within 24 hours. Delivery usually takes 2–5 business days depending on location.
            </p>
            <p>
              📦 <strong>Safe Eco-Friendly Packaging:</strong> Products are sealed in food-grade, leak-proof airtight jars to preserve freshness during transit.
            </p>
            <p>
              💬 <strong>Dedicated WhatsApp Support:</strong> Have a question about ingredients, custom spice levels, or bulk gift hampers? Ping us directly on WhatsApp at +91 73052 56022.
            </p>
          </div>
        )}
      </div>

      {/* Recommended / Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-[var(--font-playfair)] font-bold text-charcoal">
                You May Also <span className="text-gradient">Love</span>
              </h2>
              <p className="text-xs md:text-sm text-muted mt-1">
                Handcrafted gourmet delicacies you will enjoy
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs md:text-sm font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar (phones & small tablets only) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 lg:hidden shadow-2xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] text-gray-400 font-medium uppercase truncate">
            {effectiveVariantName}
          </p>
          <p className="text-base font-extrabold text-charcoal leading-tight">
            {formatPrice(effectivePrice * quantity)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end max-w-[280px]">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 py-2.5 px-3 rounded-xl bg-charcoal text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ShoppingCart size={14} />
            <span>Cart</span>
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Buy Now</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
