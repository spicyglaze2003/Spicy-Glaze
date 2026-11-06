"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Search,
  Save,
  RefreshCw,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getAdminProducts, updateStock } from "@/lib/admin-api";
import type { Product, ProductVariant } from "@/lib/types";

interface FlatInventoryItem {
  productId: number;
  productName: string;
  productSlug: string;
  variantId: number;
  variantName: string;
  sku: string;
  price: number;
  stock: number;
  originalStock: number;
}

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "low" | "out">("all");
  const [localStock, setLocalStock] = useState<Record<number, number>>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-products", "inventory"],
    queryFn: () => getAdminProducts({ pageSize: 100 }),
  });

  const products: Product[] = data?.data || [];

  // Flatten products into variant inventory list
  const inventoryItems: FlatInventoryItem[] = products.flatMap((p) => {
    if (!p.variants || p.variants.length === 0) {
      return [
        {
          productId: p.id,
          productName: p.name,
          productSlug: p.slug,
          variantId: p.id, // Fallback if no variants
          variantName: "Standard",
          sku: "-",
          price: p.price,
          stock: (p as any).stock !== undefined ? (p as any).stock : 50,
          originalStock: (p as any).stock !== undefined ? (p as any).stock : 50,
        },
      ];
    }

    return p.variants.map((v) => ({
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      variantId: v.id,
      variantName: v.name,
      sku: v.sku || "-",
      price: v.price,
      stock: localStock[v.id] !== undefined ? localStock[v.id] : v.stock,
      originalStock: v.stock,
    }));
  });

  // Filters
  const filtered = inventoryItems.filter((item) => {
    const currentStock = localStock[item.variantId] !== undefined ? localStock[item.variantId] : item.stock;
    const matchesSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.variantName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === "low") {
      return currentStock > 0 && currentStock <= 10;
    }
    if (filterTab === "out") {
      return currentStock <= 0;
    }
    return true;
  });

  const lowStockCount = inventoryItems.filter(
    (i) => (localStock[i.variantId] ?? i.stock) > 0 && (localStock[i.variantId] ?? i.stock) <= 10
  ).length;

  const outOfStockCount = inventoryItems.filter(
    (i) => (localStock[i.variantId] ?? i.stock) <= 0
  ).length;

  // Stock Adjustment mutation
  const stockMutation = useMutation({
    mutationFn: async ({ variantId, stock }: { variantId: number; stock: number }) => {
      setUpdatingId(variantId);
      return await updateStock(String(variantId), stock);
    },
    onSuccess: (_, vars) => {
      toast.success("Stock quantity updated!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setUpdatingId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || "Failed to update stock");
      setUpdatingId(null);
    },
  });

  const handleStockChange = (variantId: number, val: number) => {
    const clamped = Math.max(0, val);
    setLocalStock((prev) => ({ ...prev, [variantId]: clamped }));
  };

  const handleSaveStock = (item: FlatInventoryItem) => {
    const targetStock = localStock[item.variantId] !== undefined ? localStock[item.variantId] : item.stock;
    stockMutation.mutate({ variantId: item.variantId, stock: targetStock });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Package className="text-orange-500" />
            Inventory & Stock Control
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time stock adjustments. Changes immediately reflect on the public customer catalogue.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <RefreshCw size={15} /> Refresh Stock
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterTab("all")}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            filterTab === "all"
              ? "bg-white border-orange-500 ring-2 ring-orange-100 shadow-sm"
              : "bg-white border-gray-200/80 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total SKUs Tracked
            </span>
            <Package size={18} className="text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{inventoryItems.length}</div>
        </div>

        <div
          onClick={() => setFilterTab("low")}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            filterTab === "low"
              ? "bg-amber-50 border-amber-500 ring-2 ring-amber-100 shadow-sm"
              : "bg-white border-gray-200/80 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Low Stock Warnings (≤ 10)
            </span>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-2">{lowStockCount}</div>
        </div>

        <div
          onClick={() => setFilterTab("out")}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            filterTab === "out"
              ? "bg-red-50 border-red-500 ring-2 ring-red-100 shadow-sm"
              : "bg-white border-gray-200/80 hover:border-red-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
              Out of Stock (0)
            </span>
            <XCircle size={18} className="text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-900 mt-2">{outOfStockCount}</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, variant or SKU..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["all", "low", "out"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterTab === tab
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "all" ? "All" : tab === "low" ? "Low Stock" : "Out of Stock"}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="py-3.5 px-6">Product & Pack</th>
                <th className="py-3.5 px-6">SKU</th>
                <th className="py-3.5 px-6">Price</th>
                <th className="py-3.5 px-6">Current Stock</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Quick Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Loading inventory records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No items match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const current = localStock[item.variantId] !== undefined ? localStock[item.variantId] : item.stock;
                  const isModified = localStock[item.variantId] !== undefined && localStock[item.variantId] !== item.originalStock;
                  const isLow = current > 0 && current <= 10;
                  const isOut = current <= 0;

                  return (
                    <tr key={`${item.productId}-${item.variantId}`} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          href={`/admin/products/${item.productId}/edit`}
                          className="font-semibold text-gray-900 hover:text-orange-600 transition-colors inline-block"
                        >
                          {item.productName}
                        </Link>
                        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-gray-700">{item.variantName}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-mono text-xs text-gray-600">
                        {item.sku}
                      </td>

                      <td className="py-4 px-6 font-semibold text-gray-900">
                        ₹{item.price}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStockChange(item.variantId, current - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                          >
                            <Minus size={13} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={current}
                            onChange={(e) => handleStockChange(item.variantId, Number(e.target.value))}
                            className="w-16 text-center py-1 rounded-lg border border-gray-300 font-bold text-sm text-gray-900 focus:border-orange-500 focus:outline-none"
                          >
                          </input>
                          <button
                            type="button"
                            onClick={() => handleStockChange(item.variantId, current + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700">
                            <XCircle size={13} /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800">
                            <AlertTriangle size={13} /> Low Stock ({current})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                            <CheckCircle size={13} /> In Stock ({current})
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleSaveStock(item)}
                          disabled={updatingId === item.variantId || !isModified}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            isModified
                              ? "bg-orange-500 text-white shadow-xs hover:bg-orange-600 cursor-pointer"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <Save size={13} />
                          {updatingId === item.variantId ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-400">Loading inventory records...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No items match the current filter.</div>
          ) : (
            filtered.map((item) => {
              const current = localStock[item.variantId] !== undefined ? localStock[item.variantId] : item.stock;
              const isModified = localStock[item.variantId] !== undefined && localStock[item.variantId] !== item.originalStock;
              const isLow = current > 0 && current <= 10;
              const isOut = current <= 0;

              return (
                <div key={`m-${item.productId}-${item.variantId}`} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/admin/products/${item.productId}/edit`}
                        className="font-bold text-gray-900 text-sm hover:text-orange-600 line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-gray-700">{item.variantName}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-gray-500">{item.sku}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">₹{item.price}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div>
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-700">
                          <XCircle size={11} /> Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800">
                          <AlertTriangle size={11} /> Low ({current})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                          <CheckCircle size={11} /> In Stock ({current})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStockChange(item.variantId, current - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-600 text-xs"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={current}
                        onChange={(e) => handleStockChange(item.variantId, Number(e.target.value))}
                        className="w-12 text-center py-1 rounded-lg border border-gray-300 font-bold text-xs text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleStockChange(item.variantId, current + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-600 text-xs"
                      >
                        <Plus size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveStock(item)}
                        disabled={updatingId === item.variantId || !isModified}
                        className={`ml-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isModified
                            ? "bg-orange-500 text-white shadow-xs"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {updatingId === item.variantId ? "..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
