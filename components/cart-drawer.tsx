"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { useSiteConfig, cleanPhoneNumber } from "@/components/site-config-provider";

export default function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, updateQuantity, removeItem, clearCart } = useCartStore();
  const siteConfig = useSiteConfig();
  const waNum = cleanPhoneNumber(siteConfig.whatsappNumber);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mounted]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  if (!mounted) return null;

  // Calculate accurate subtotal and total item count
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const totalCount = items.reduce((count, item) => count + (Number(item.quantity) || 1), 0);

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    const lines = [
      `🌶️ *ORDER INQUIRY – SPICYGLAZE*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ...items.map(
        (i, idx) =>
          `${idx + 1}. *${i.productName}* (${i.name})\n   ↳ Qty: ${i.quantity} × ${formatPrice(i.price)} = ${formatPrice(
            i.price * i.quantity
          )}`
      ),
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📦 *Total Items:* ${totalCount}`,
      `💰 *Subtotal Amount:* ${formatPrice(subtotal)}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Hello SpicyGlaze Team! I would like to place this order. Please confirm availability and share payment/delivery steps!`,
    ];

    const waUrl = `https://api.whatsapp.com/send?phone=${waNum}&text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(waUrl, "_blank");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/50 z-[998] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] md:w-[480px] bg-white z-[999] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping Cart Drawer"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-cream via-white to-cream">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-charcoal">Your Cart</h2>
              <p className="text-xs text-gray-500">
                {totalCount} {totalCount === 1 ? "item" : "items"} selected
              </p>
            </div>
          </div>

          <button
            onClick={closeCart}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping / Quality Banner */}
        <div className="bg-emerald-50 border-b border-emerald-100/60 px-4 py-2 flex items-center justify-center gap-2 text-xs text-emerald-800 font-medium">
          <Sparkles size={14} className="text-emerald-600 flex-shrink-0" />
          <span>Naturally Crafted Indian Goodness • Pure & Authentic</span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center text-4xl shadow-inner">
                🌶️
              </div>
              <div>
                <h3 className="font-bold text-lg text-charcoal">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                  Looks like you haven&apos;t added any artisanal spices or pickles yet.
                </p>
              </div>
              <button
                onClick={() => {
                  closeCart();
                  router.push("/products");
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                <span>Explore Products</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-3.5 p-3 sm:p-3.5 bg-cream/30 hover:bg-cream/50 rounded-2xl border border-gray-100 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🌶️
                      </div>
                    )}
                  </div>

                  {/* Info & Quantity */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-charcoal line-clamp-1">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {item.name && (
                        <p className="text-xs text-primary font-medium mt-0.5 truncate">
                          Variant: {item.name}
                        </p>
                      )}

                      <div className="text-xs text-gray-500 mt-1">
                        {formatPrice(item.price)} each
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-sm">
                        <button
                          onClick={() => {
                            if (item.quantity <= 1) {
                              removeItem(item.variantId);
                            } else {
                              updateQuantity(item.variantId, item.quantity - 1);
                            }
                          }}
                          className="p-1.5 text-gray-600 hover:text-primary transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>

                        <span className="w-8 text-center text-xs font-bold text-charcoal">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-1.5 text-gray-600 hover:text-primary transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Total for Item */}
                      <span className="font-extrabold text-sm text-charcoal">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer (when cart has items) */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-white space-y-3.5 shadow-lg">
            {/* Subtotal */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-gray-500 font-medium">Subtotal Amount</span>
                <p className="text-[11px] text-gray-400">Taxes included</p>
              </div>
              <span className="text-2xl font-black text-charcoal">
                {formatPrice(subtotal)}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={handleWhatsAppCheckout}
                className="w-full py-3 px-4 rounded-xl bg-leaf hover:bg-leaf/90 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-leaf/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <BsWhatsapp size={16} />
                <span>Instant Order on WhatsApp</span>
              </button>
            </div>

            {/* Clear Cart Link */}
            <div className="text-center pt-1">
              <button
                onClick={clearCart}
                className="text-[11px] text-gray-400 hover:text-red-500 transition-colors cursor-pointer underline"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
