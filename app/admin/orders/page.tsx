"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingCart,
  Search,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  AlertCircle,
  Package,
  FileText,
  Download,
  RefreshCw,
  IndianRupee,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  QrCode,
  Banknote,
  Building2,
} from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import { toast } from "sonner";
import { getAdminOrders, updateOrderPaymentAndStatus } from "@/lib/admin-api";
import type { Order, OrderStatus } from "@/lib/admin-types";

const statusStyles: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  pending: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Clock },
  new: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Clock },
  confirmed: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", icon: CheckCircle2 },
  processing: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: PackageCheck },
  packed: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", icon: Package },
  shipped: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: Truck },
  "out-for-delivery": { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", icon: Truck },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 },
  cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: AlertCircle },
  refunded: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", icon: AlertCircle },
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => getAdminOrders().catch(() => ({ data: [], meta: {} })),
  });

  const orders: Order[] = (data?.data as Order[]) || [];

  // Metrics
  const totalRevenue = orders.reduce((sum, o: any) => sum + (Number(o.totalAmount || o.total) || 0), 0);
  const pendingCount = orders.filter((o: any) => {
    const st = (o.orderStatus || o.status || "").toLowerCase();
    return st === "pending" || st === "new";
  }).length;
  const processingCount = orders.filter((o: any) => {
    const st = (o.orderStatus || o.status || "").toLowerCase();
    return st === "confirmed" || st === "processing" || st === "packed";
  }).length;
  const deliveredCount = orders.filter((o: any) => {
    const st = (o.orderStatus || o.status || "").toLowerCase();
    return st === "delivered";
  }).length;

  const filteredOrders = orders.filter((o: any) => {
    const oId = (o.orderId || o.orderNumber || "").toLowerCase();
    const cName = (o.customerName || o.customer?.name || "").toLowerCase();
    const cPhone = (o.customerPhone || o.customer?.phone || "").toLowerCase();
    const q = search.trim().toLowerCase();

    const matchesSearch = !q || oId.includes(q) || cName.includes(q) || cPhone.includes(q);
    const ordStatus = (o.orderStatus || o.status || "").toLowerCase();
    const matchesStatus = statusFilter === "all" || ordStatus === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(`Copied Order #${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Comprehensive Order Mutation (Handles Order Status, Payment Status, Payment Method)
  const orderMutation = useMutation({
    mutationFn: async ({
      id,
      orderStatus,
      paymentStatus,
      paymentMethod,
    }: {
      id: string | number;
      orderStatus?: string;
      paymentStatus?: string;
      paymentMethod?: string;
    }) => {
      return await updateOrderPaymentAndStatus(String(id), {
        orderStatus,
        paymentStatus,
        paymentMethod,
      });
    },
    onSuccess: (_, vars) => {
      const parts = [];
      if (vars.orderStatus) parts.push(`Order status: ${vars.orderStatus}`);
      if (vars.paymentStatus) parts.push(`Payment: ${vars.paymentStatus}`);
      if (vars.paymentMethod) parts.push(`Method: ${vars.paymentMethod}`);
      toast.success(parts.join(" | ") || "Order updated successfully!");

      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });

      if (selectedOrder) {
        setSelectedOrder((prev: any) => {
          if (!prev) return null;
          return {
            ...prev,
            ...(vars.orderStatus ? { orderStatus: vars.orderStatus.toUpperCase(), status: vars.orderStatus.toLowerCase() } : {}),
            ...(vars.paymentStatus ? { paymentStatus: vars.paymentStatus.toUpperCase() } : {}),
            ...(vars.paymentMethod ? { paymentMethod: vars.paymentMethod } : {}),
          };
        });
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update order");
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
              <ShoppingCart size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders Management</h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Track client purchases, manage live fulfillment states, edit payments (COD/UPI/Card), and generate invoices.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer shrink-0"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin text-orange-500" : ""} />
          {isFetching ? "Refreshing..." : "Refresh Orders"}
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingCart size={17} className="text-gray-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-2">{orders.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Recorded in store database</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sales</span>
            <IndianRupee size={17} className="text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-900 mt-2">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-1">Gross order volume</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Needs Action</span>
            <Clock size={17} className="text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-900 mt-2">
            {pendingCount + processingCount}
          </div>
          <p className="text-[11px] text-amber-600/80 mt-1">Pending & in fulfillment</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delivered</span>
            <CheckCircle2 size={17} className="text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-purple-900 mt-2">{deliveredCount}</div>
          <p className="text-[11px] text-purple-600/80 mt-1">Successfully fulfilled</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-200/80 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-2.5 text-gray-400" size={17} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, customer name, phone..."
              className="w-full pl-10 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50/60 text-xs sm:text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all text-gray-900"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All Orders", count: orders.length },
              { id: "pending", label: "Pending", count: pendingCount },
              { id: "confirmed", label: "Confirmed", count: orders.filter((o: any) => (o.orderStatus || o.status || "").toLowerCase() === "confirmed").length },
              { id: "shipped", label: "Shipped", count: orders.filter((o: any) => (o.orderStatus || o.status || "").toLowerCase() === "shipped").length },
              { id: "delivered", label: "Delivered", count: deliveredCount },
              { id: "cancelled", label: "Cancelled", count: orders.filter((o: any) => (o.orderStatus || o.status || "").toLowerCase() === "cancelled").length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-gray-900 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === tab.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/80 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-[980px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                <th className="py-3.5 px-5">Order ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-4">Products</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment (Status & Method)</th>
                <th className="py-3.5 px-4">Fulfillment</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-orange-500" />
                      <span>Loading orders catalogue...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <p className="font-semibold text-gray-600">No matching orders found</p>
                    <p className="text-xs text-gray-400 mt-1">Try clearing your search query or switching filters.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord: any) => {
                  const currentSt = (ord.orderStatus || ord.status || "confirmed").toLowerCase();
                  const style = statusStyles[currentSt] || statusStyles.new;
                  const Icon = style.icon;
                  const orderId = ord.orderId || ord.orderNumber;
                  const customerName = ord.customerName || ord.customer?.name || "Customer";
                  const customerPhone = ord.customerPhone || ord.customer?.phone || "-";
                  const items = ord.products || ord.items || [];
                  const isPaid = (ord.paymentStatus || "").toUpperCase() === "PAID";
                  const currentMethod = (ord.paymentMethod || "COD").toUpperCase();
                  const cleanPhone = customerPhone.replace(/\D/g, "");

                  return (
                    <tr key={ord.id || orderId} className="hover:bg-orange-50/30 transition-colors">
                      {/* Order ID */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-gray-900 text-xs">{orderId}</span>
                          <button
                            onClick={() => copyToClipboard(orderId)}
                            className="text-gray-400 hover:text-gray-700 p-0.5 rounded cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedId === orderId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-gray-600 font-medium">
                          <Calendar size={12} className="text-gray-400" />
                          {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(ord.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-xs truncate">{customerName}</p>
                            <p className="text-[11px] text-gray-500 truncate">{customerPhone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Products */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                          <Package size={12} className="text-gray-500" />
                          {items.length} {items.length === 1 ? "Item" : "Items"}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 max-w-[180px]">
                          {items.map((it: any) => it.name || it.product?.name).join(", ")}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-sm text-gray-900">
                          ₹{(ord.totalAmount || ord.total || 0).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Payment (Interactive status toggle + method selector) */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {/* 1-Click Status Toggle */}
                          <button
                            onClick={() => {
                              const nextStatus = isPaid ? "PENDING" : "PAID";
                              orderMutation.mutate({
                                id: orderId,
                                paymentStatus: nextStatus,
                              });
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                                : "bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100"
                            }`}
                            title={`Click to mark as ${isPaid ? "PENDING (Unpaid)" : "PAID (Done)"}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {isPaid ? "PAID (Done)" : "PENDING"}
                          </button>

                          {/* Quick Payment Method Selector */}
                          <div className="flex items-center gap-1 mt-0.5">
                            <select
                              value={currentMethod}
                              onChange={(e) => {
                                orderMutation.mutate({
                                  id: orderId,
                                  paymentMethod: e.target.value,
                                });
                              }}
                              className="text-[10px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                              title="Update payment mode (COD, UPI, Card, Net Banking)"
                            >
                              <option value="COD">COD (Cash on Delivery)</option>
                              <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                              <option value="CARD">Card (Credit / Debit)</option>
                              <option value="NETBANKING">Net Banking</option>
                              <option value="STRIPE">Stripe</option>
                            </select>
                          </div>
                        </div>
                      </td>

                      {/* Fulfillment Status */}
                      <td className="py-4 px-4">
                        <select
                          value={(ord.orderStatus || ord.status || "CONFIRMED").toUpperCase()}
                          onChange={(e) => {
                            orderMutation.mutate({
                              id: orderId,
                              orderStatus: e.target.value,
                            });
                          }}
                          className={`text-[11px] font-bold border rounded-lg px-2 py-1 outline-none cursor-pointer ${style.bg} ${style.text} ${style.border}`}
                          title="Update fulfillment status"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                            title="Inspect Order Details & Edit Payments"
                          >
                            <Eye size={13} /> View
                          </button>

                          <a
                            href={`/api/orders/${orderId}/invoice?format=pdf&download=1`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                            title="Download PDF Invoice"
                          >
                            <Download size={13} /> PDF
                          </a>

                          {cleanPhone && (
                            <button
                              onClick={() => {
                                const formatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                                const msg = `Hello ${customerName}! Regarding your SpicyGlaze Order #${orderId} (₹${ord.totalAmount || ord.total}): Payment: ${(ord.paymentStatus || "PENDING").toUpperCase()} via ${(ord.paymentMethod || "COD").toUpperCase()}. Fulfillment: ${(ord.orderStatus || ord.status || "CONFIRMED").toUpperCase()}. Thank you for choosing SpicyGlaze!`;
                                window.open(`https://api.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(msg)}`, "_blank");
                              }}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                              title="Chat with Customer via WhatsApp"
                            >
                              <BsWhatsapp size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile / Tablet Responsive Cards (< lg) */}
        <div className="lg:hidden divide-y divide-gray-100">
          {isLoading ? (
            <div className="py-12 text-center text-gray-400 text-xs">Loading orders catalogue...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">No orders match your filter criteria.</div>
          ) : (
            filteredOrders.map((ord: any) => {
              const currentSt = (ord.orderStatus || ord.status || "confirmed").toLowerCase();
              const style = statusStyles[currentSt] || statusStyles.new;
              const Icon = style.icon;
              const orderId = ord.orderId || ord.orderNumber;
              const customerName = ord.customerName || ord.customer?.name || "Customer";
              const customerPhone = ord.customerPhone || ord.customer?.phone || "";
              const items = ord.products || ord.items || [];
              const isPaid = (ord.paymentStatus || "").toUpperCase() === "PAID";
              const currentMethod = (ord.paymentMethod || "COD").toUpperCase();
              const cleanPhone = customerPhone.replace(/\D/g, "");

              return (
                <div key={ord.id || orderId} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-gray-900 text-xs sm:text-sm">{orderId}</span>
                        <button
                          onClick={() => copyToClipboard(orderId)}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          {copiedId === orderId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        • {new Date(ord.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                    >
                      <Icon size={11} />
                      {(ord.orderStatus || ord.status || "CONFIRMED").toUpperCase()}
                    </span>
                  </div>

                  {/* Customer & Total Row */}
                  <div className="flex items-center justify-between text-xs bg-gray-50/90 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{customerName}</p>
                        {customerPhone && <p className="text-gray-500 text-[10px]">{customerPhone}</p>}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-extrabold text-sm text-gray-900">
                        ₹{(ord.totalAmount || ord.total || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Payment Controls (Status Toggle + Method Selector) */}
                  <div className="p-2.5 rounded-xl border border-gray-200 bg-white flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-500 font-medium">Payment:</span>
                      <button
                        onClick={() => {
                          orderMutation.mutate({
                            id: orderId,
                            paymentStatus: isPaid ? "PENDING" : "PAID",
                          });
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                      >
                        {isPaid ? "PAID (Done)" : "PENDING (Unpaid)"}
                      </button>
                    </div>

                    <select
                      value={currentMethod}
                      onChange={(e) => {
                        orderMutation.mutate({
                          id: orderId,
                          paymentMethod: e.target.value,
                        });
                      }}
                      className="text-[10px] font-bold text-gray-800 bg-gray-100 border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="COD">COD</option>
                      <option value="UPI">UPI</option>
                      <option value="CARD">Card</option>
                      <option value="NETBANKING">NetBanking</option>
                    </select>
                  </div>

                  {/* Products line */}
                  <div className="text-xs text-gray-500 flex items-center justify-between">
                    <span className="flex items-center gap-1 font-medium text-gray-600">
                      <Package size={12} className="text-gray-400" />
                      {items.length} {items.length === 1 ? "Product" : "Products"}
                    </span>
                    <span className="text-[11px] text-gray-400 truncate max-w-[200px]">
                      {items.map((it: any) => it.name || it.product?.name).join(", ")}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-xl text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                    >
                      <Eye size={13} /> Edit / View
                    </button>

                    <a
                      href={`/api/orders/${orderId}/invoice?format=pdf&download=1`}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                    >
                      <Download size={13} /> PDF
                    </a>

                    {cleanPhone && (
                      <button
                        onClick={() => {
                          const formatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                          const msg = `Hello ${customerName}! Updating regarding your SpicyGlaze Order #${orderId}. Total: ₹${ord.totalAmount || ord.total}. Payment: ${(ord.paymentStatus || "PENDING").toUpperCase()} via ${(ord.paymentMethod || "COD").toUpperCase()}. Status: ${(ord.orderStatus || ord.status || "CONFIRMED").toUpperCase()}`;
                          window.open(`https://api.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(msg)}`, "_blank");
                        }}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs cursor-pointer"
                        title="Message Customer via WhatsApp"
                      >
                        <BsWhatsapp size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Order Detail Modal with Comprehensive Payment Editor */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 font-bold">
                  <Package size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                    Order #{selectedOrder.orderId || selectedOrder.orderNumber}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Payment & Fulfillment Control Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Payment Management Card (User Request) */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Banknote size={14} className="text-emerald-600" />
                      Payment Details
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        (selectedOrder.paymentStatus || "").toUpperCase() === "PAID"
                          ? "bg-emerald-200 text-emerald-900"
                          : "bg-amber-200 text-amber-900"
                      }`}
                    >
                      {selectedOrder.paymentStatus || "PENDING"}
                    </span>
                  </div>

                  {/* Payment Status Dropdown (Done / Not Done) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Payment Status (Done or Not)
                    </label>
                    <select
                      value={(selectedOrder.paymentStatus || "PENDING").toUpperCase()}
                      onChange={(e) => {
                        orderMutation.mutate({
                          id: selectedOrder.orderId || selectedOrder.orderNumber || selectedOrder.id,
                          paymentStatus: e.target.value,
                        });
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 bg-white text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-500 shadow-2xs cursor-pointer"
                    >
                      <option value="PAID">PAID (Done / Received)</option>
                      <option value="PENDING">PENDING (Unpaid / Cash Due)</option>
                      <option value="FAILED">FAILED (Payment Failed)</option>
                      <option value="REFUNDED">REFUNDED (Returned)</option>
                    </select>
                  </div>

                  {/* Payment Method Dropdown (COD / UPI / Card / NetBanking) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Payment Method / Mode
                    </label>
                    <select
                      value={(selectedOrder.paymentMethod || "COD").toUpperCase()}
                      onChange={(e) => {
                        orderMutation.mutate({
                          id: selectedOrder.orderId || selectedOrder.orderNumber || selectedOrder.id,
                          paymentMethod: e.target.value,
                        });
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 bg-white text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-500 shadow-2xs cursor-pointer"
                    >
                      <option value="COD">COD (Cash on Delivery)</option>
                      <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                      <option value="CARD">Credit / Debit Card</option>
                      <option value="NETBANKING">Net Banking</option>
                      <option value="STRIPE">Stripe Gateway</option>
                    </select>
                  </div>
                </div>

                {/* 2. Fulfillment Status Card */}
                <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck size={14} className="text-orange-600" />
                      Fulfillment Status
                    </span>
                    <span className="text-xs font-extrabold text-orange-700 uppercase">
                      {selectedOrder.orderStatus || selectedOrder.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Order Stage
                    </label>
                    <select
                      value={(selectedOrder.orderStatus || selectedOrder.status || "CONFIRMED").toUpperCase()}
                      onChange={(e) =>
                        orderMutation.mutate({
                          id: selectedOrder.orderId || selectedOrder.orderNumber || selectedOrder.id,
                          orderStatus: e.target.value as OrderStatus,
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-orange-300 bg-white text-xs font-bold text-gray-900 focus:outline-none focus:border-orange-500 shadow-2xs cursor-pointer"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <p className="text-[11px] text-gray-500 pt-2">
                    Changing status immediately updates public tracking and reports.
                  </p>
                </div>
              </div>

              {/* Customer & Shipping info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-gray-200/80 space-y-2 bg-gray-50/30">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Customer Information
                  </h4>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedOrder.customerName || selectedOrder.customer?.name}
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Phone size={13} className="text-gray-400" />
                    {selectedOrder.customerPhone || selectedOrder.customer?.phone || "-"}
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Mail size={13} className="text-gray-400" />
                    {selectedOrder.customer?.email || "customer@spicyglaze.in"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-gray-200/80 space-y-2 bg-gray-50/30">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Shipping & Delivery Address
                  </h4>
                  <div className="text-xs text-gray-700 flex items-start gap-1.5">
                    <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      {selectedOrder.customerAddress ||
                        selectedOrder.shippingAddress?.line1 ||
                        "8/37 Chithambaranar Street, Veerappanchatiram, Erode, Tamil Nadu 638001"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                  Ordered Items ({(selectedOrder.products || selectedOrder.items || []).length})
                </h4>
                <div className="rounded-2xl border border-gray-200/80 divide-y divide-gray-100 overflow-hidden">
                  {(selectedOrder.products || selectedOrder.items || []).map((it: any, idx: number) => {
                    const name = it.name || it.product?.name || "Product";
                    const price = it.unitPrice || it.price || 0;
                    const subtotal = it.subtotal || it.total || price * (it.quantity || 1);

                    return (
                      <div key={idx} className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{name}</p>
                            <p className="text-[11px] text-gray-500">
                              Qty: {it.quantity || 1} × ₹{price.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                        <p className="font-extrabold text-gray-900">
                          ₹{subtotal.toLocaleString("en-IN")}
                        </p>
                      </div>
                    );
                  })}

                  <div className="p-4 bg-gray-50/70 space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">
                        ₹{(selectedOrder.subtotal || selectedOrder.totalAmount || selectedOrder.total || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee</span>
                      <span className="font-semibold text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-extrabold text-gray-900">
                      <span>Total Amount</span>
                      <span className="text-orange-600">
                        ₹{(selectedOrder.totalAmount || selectedOrder.total || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 text-xs">
                      <span>Payment Status:</span>
                      <span className="font-bold uppercase text-emerald-700">
                        {selectedOrder.paymentStatus || "PAID"} ({selectedOrder.paymentMethod || "COD"})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50/50">
              <a
                href={`/api/orders/${selectedOrder.orderId || selectedOrder.orderNumber}/invoice?format=html`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink size={13} /> Preview HTML
              </a>
              <a
                href={`/api/orders/${selectedOrder.orderId || selectedOrder.orderNumber}/invoice?format=pdf&download=1`}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Download size={14} /> Download PDF Invoice
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
