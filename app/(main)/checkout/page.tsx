"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { formatPrice, normalizeImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { useSiteConfig, cleanPhoneNumber } from "@/components/site-config-provider";
import { BsWhatsapp } from "react-icons/bs";
import { CheckCircle2, Download, ArrowRight, ShoppingBag, ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";

interface OrderCompleteState {
  orderId: string;
  totalAmount: number;
  waUrl: string;
  customerName: string;
  itemsSummary: string[];
}

export default function CheckoutPage() {
  const { items, totalAmount: storeTotalAmount, clearCart, removeItem, updateQuantity } = useCartStore();
  const router = useRouter();
  const siteConfig = useSiteConfig();
  const waNum = cleanPhoneNumber(siteConfig.whatsappNumber);

  // Compute live subtotal directly from items to guarantee it is always accurate and never stale 0
  const calculatedSubtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const totalAmount = calculatedSubtotal > 0 ? calculatedSubtotal : (Number(storeTotalAmount) || 0);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<OrderCompleteState | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [autoRedirectCancelled, setAutoRedirectCancelled] = useState(false);

  // Auto-redirect to WhatsApp countdown after successful order
  useEffect(() => {
    if (!orderComplete || autoRedirectCancelled) return;

    if (countdown <= 0) {
      window.location.href = orderComplete.waUrl;
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [orderComplete, countdown, autoRedirectCancelled]);

  // Helper to trigger the browser download for the PDF invoice
  const triggerInvoiceDownload = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice?format=pdf&download=1`);
      if (!response.ok) throw new Error("Could not fetch invoice PDF");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = blobUrl;
      downloadAnchor.download = `SpicyGlaze-Invoice-${orderId}.pdf`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(downloadAnchor);
      }, 500);

      toast.success("Invoice PDF downloaded successfully!");
      return true;
    } catch (err) {
      console.error("Auto invoice PDF download failed:", err);
      // Fallback: open PDF invoice in new tab
      window.open(`/api/orders/${orderId}/invoice?format=pdf`, "_blank");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      const checkoutPayload = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.address,
        notes: formData.notes,
        paymentMethod: "cod",
        subtotal: totalAmount,
        totalAmount: totalAmount,
        items: items.map((item) => ({
          variantId: item.variantId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Number(item.price) || 0,
          price: Number(item.price) || 0,
          name: `${item.productName}${item.name ? ` (${item.name})` : ""}`,
          imageUrl: item.imageUrl || "",
        })),
      };

      const res = await api.post("/orders/checkout", {
        data: checkoutPayload,
      });

      const orderData = res.data?.data?.order;
      const orderId = orderData?.orderId || orderData?.orderNumber || res.data?.data?.orderId || `ORD-${Date.now()}`;
      const finalTotal = Number(orderData?.totalAmount || orderData?.total || res.data?.data?.amount || totalAmount);

      // Build readable product items list
      const itemsListFormatted = items.map(
        (it, idx) =>
          `${idx + 1}. *${it.productName}* (${it.name}) x ${it.quantity} — ${formatPrice((Number(it.price) || 0) * it.quantity)}`
      );

      // Build WhatsApp message with detailed product & total info
      const waMessage = [
        `🌶️ *NEW ORDER - SPICYGLAZE*`,
        `━━━━━━━━━━━━━━━━━━━━━━━`,
        `📋 *Order ID:* #${orderId}`,
        `📅 *Date:* ${new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        ``,
        `👤 *Customer Details:*`,
        `• Name: ${formData.customerName}`,
        `• Phone: ${formData.customerPhone}`,
        `• Address: ${formData.address}`,
        formData.notes ? `• Note: ${formData.notes}` : "",
        ``,
        `📦 *Selected Products:*`,
        ...itemsListFormatted,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━`,
        `💰 *Total Amount:* ${formatPrice(finalTotal)}`,
        `💳 *Payment Method:* Cash on Delivery / WhatsApp Pay`,
        `📄 *Invoice:* Automatically Downloaded to Device`,
        ``,
        `Hi SpicyGlaze Team! I have placed this order on your website. Please confirm my order and shipping status. Thank you! 🙏`,
      ]
        .filter(Boolean)
        .join("\n");

      const waUrl = `https://api.whatsapp.com/send?phone=${waNum}&text=${encodeURIComponent(waMessage)}`;

      // 1. Auto-trigger invoice download immediately
      await triggerInvoiceDownload(orderId);

      // 2. Clear cart
      clearCart();

      // 3. Set completion state with redirect countdown
      setOrderComplete({
        orderId,
        totalAmount: finalTotal,
        waUrl,
        customerName: formData.customerName,
        itemsSummary: itemsListFormatted,
      });

      toast.success("Order placed! Invoice downloaded.");
    } catch (err: any) {
      console.error("Checkout submission failed:", err);
      toast.error(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Post-Checkout Success Screen ──────────────────────────────────────────
  if (orderComplete) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-cream/40 flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-orange-100 p-8 text-center relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-leaf/10 rounded-full blur-2xl" />

          {/* Success Badge */}
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner">
            <CheckCircle2 size={46} className="animate-bounce" />
          </div>

          <h1 className="text-3xl font-[var(--font-playfair)] font-bold text-charcoal mb-2">
            Order Confirmed!
          </h1>
          <p className="text-charcoal-light mb-6">
            Thank you, <span className="font-semibold text-charcoal">{orderComplete.customerName}</span>. Your order has been registered.
          </p>

          {/* Order Details Card */}
          <div className="bg-orange-50/60 border border-orange-200/60 rounded-2xl p-5 mb-6 text-left space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Order Number:</span>
              <span className="font-mono font-bold text-primary">#{orderComplete.orderId}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Total Amount:</span>
              <span className="font-bold text-lg text-charcoal">{formatPrice(orderComplete.totalAmount)}</span>
            </div>
            <div className="pt-2 border-t border-orange-200/50 flex items-center gap-2 text-xs text-green-700 font-medium">
              <FileText size={15} />
              <span>Official Invoice was downloaded automatically</span>
            </div>
          </div>

          {/* Auto-redirect Status */}
          <div className="p-4 bg-leaf/10 border border-leaf/30 rounded-2xl mb-6">
            <p className="text-sm font-medium text-leaf flex items-center justify-center gap-2">
              <BsWhatsapp size={18} />
              {!autoRedirectCancelled ? (
                <>Redirecting to WhatsApp chat in <span className="font-bold text-base">{countdown}s</span>...</>
              ) : (
                <>Automatic redirect paused. Click below to chat.</>
              )}
            </p>
            {!autoRedirectCancelled && (
              <button
                onClick={() => setAutoRedirectCancelled(true)}
                className="text-xs text-charcoal-light underline mt-1 hover:text-charcoal cursor-pointer"
              >
                Cancel auto-redirect & stay on page
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <a
              href={orderComplete.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 bg-leaf text-white font-semibold rounded-2xl hover:bg-leaf/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-leaf/25 text-base cursor-pointer"
            >
              <BsWhatsapp size={20} />
              Open WhatsApp Chat Now
            </a>

            <div className="flex gap-3">
              <button
                onClick={() => triggerInvoiceDownload(orderComplete.orderId)}
                className="flex-1 py-3 px-4 border border-orange-200 text-primary bg-orange-50/50 hover:bg-orange-100/60 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={16} />
                Download PDF Invoice
              </button>

              <Link
                href="/products"
                className="py-3 px-5 border border-border text-charcoal hover:bg-gray-50 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Shop More
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Empty Cart State ───────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 text-center px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-border">
          <div className="w-16 h-16 bg-orange-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={28} />
          </div>
          <h1 className="text-3xl font-[var(--font-playfair)] font-bold text-charcoal mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-charcoal-light text-sm mb-6">
            Explore our handcrafted gourmet pickles, spices, and artisanal preserves.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            Explore Products
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // ─── Main Checkout Form ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-28 pb-20 bg-cream/30">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Cart Items & Summary */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-[var(--font-playfair)] font-bold text-charcoal">
              Selected Products
            </h2>
            <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>

            {items.map((item) => {
              const itemPrice = Number(item.price) || 0;
              const itemQty = Number(item.quantity) || 1;
              const itemImg = normalizeImageUrl(item.imageUrl);

              return (
                <div
                  key={item.variantId}
                  className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-border"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream/60 border border-orange-100 flex-shrink-0 flex items-center justify-center relative">
                    {itemImg ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={itemImg}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-2xl">🌶️</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-charcoal">{item.productName}</h4>
                    <p className="text-sm text-charcoal-light">Variant: {item.name}</p>
                    <div className="font-bold text-primary mt-1">
                      {formatPrice(itemPrice)}
                      <span className="text-xs text-charcoal-light font-normal ml-2">
                        ({formatPrice(itemPrice * itemQty)} total)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.variantId, Math.max(1, itemQty - 1))}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-gray-50 text-charcoal font-semibold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-semibold text-charcoal">
                      {itemQty}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, itemQty + 1)}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-gray-50 text-charcoal font-semibold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-red-500 hover:text-red-700 text-sm ml-2 font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              );
            })}

          {/* Pricing breakdown */}
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-border space-y-3">
            <div className="flex justify-between text-sm text-charcoal-light">
              <span>Subtotal:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-charcoal-light">
              <span>Standard Delivery:</span>
              <span className="text-leaf font-semibold">FREE</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-xl font-bold text-charcoal">
              <span>Total Amount:</span>
              <span className="text-primary">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mt-6 p-4 bg-orange-50/70 border border-orange-200/70 rounded-2xl flex items-start gap-3 text-xs text-charcoal-light">
            <ShieldCheck size={22} className="text-primary shrink-0 mt-0.5" />
            <div>
              <strong className="text-charcoal block mb-0.5 font-semibold">
                Instant Invoice & Direct WhatsApp Confirmation
              </strong>
              Upon clicking Place Order, your official invoice file will be automatically downloaded to your device, and you will be directed to WhatsApp with your pre-filled order details.
            </div>
          </div>
        </div>

        {/* Right: Checkout Details Form */}
        <div>
          <h2 className="text-3xl font-[var(--font-playfair)] font-bold text-charcoal mb-6">
            Delivery & Contact Details
          </h2>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-border space-y-5">
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">
                Full Name *
              </label>
              <input
                required
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="e.g. Ramesh Kumar"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="ramesh@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  WhatsApp / Phone Number *
                </label>
                <input
                  required
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">
                Complete Delivery Address *
              </label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[90px]"
                placeholder="Flat / House No., Street, City, State, PIN Code"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">
                Order Notes (Optional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Special delivery instructions, extra spicy preference, etc."
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-xs text-charcoal-light space-y-1">
              <div className="font-semibold text-primary flex items-center gap-1.5">
                <FileText size={14} />
                Automatic Invoice & WhatsApp Redirection
              </div>
              <p>
                1. Your official tax invoice will automatically download to your phone or computer.
                <br />
                2. You will be redirected to WhatsApp with all product names, variants, and amounts filled in.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Place Order & Download Invoice • {formatPrice(totalAmount)}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
