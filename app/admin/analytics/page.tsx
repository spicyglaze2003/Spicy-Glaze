"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  ArrowUpRight,
} from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const revenueData = [
    { day: "Mon", amount: 14200, orders: 18 },
    { day: "Tue", amount: 18450, orders: 24 },
    { day: "Wed", amount: 12800, orders: 15 },
    { day: "Thu", amount: 22100, orders: 29 },
    { day: "Fri", amount: 31500, orders: 42 },
    { day: "Sat", amount: 38900, orders: 51 },
    { day: "Sun", amount: 34200, orders: 46 },
  ];

  const maxRevenue = Math.max(...revenueData.map((d) => d.amount));

  const topCategories = [
    { name: "Artisanal Spices & Masalas", share: 44, revenue: "₹76,500", growth: "+18%" },
    { name: "Forest Honey & Natural Sweeteners", share: 32, revenue: "₹55,600", growth: "+24%" },
    { name: "Handcrafted Pickles & Chutneys", share: 16, revenue: "₹27,800", growth: "+9%" },
    { name: "Organic Cold Pressed Oils", share: 8, revenue: "₹13,900", growth: "+5%" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <BarChart3 className="text-orange-500" />
            Sales & Performance Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time commercial metrics, revenue charts, and product category trends.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeRange === r
                  ? "bg-orange-500 text-white shadow-2xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {r === "7d" ? "Last 7 Days" : r === "30d" ? "Last 30 Days" : "Last Quarter"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <IndianRupee size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹1,73,800</div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
            <TrendingUp size={14} /> +22.4% vs last period
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Orders Placed
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">225</div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
            <TrendingUp size={14} /> +14.8% volume
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Average Order Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹772</div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
            <TrendingUp size={14} /> +6.5% AOV
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Repeat Customer Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">38.2%</div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
            <TrendingUp size={14} /> High brand loyalty
          </div>
        </div>
      </div>

      {/* Main Revenue Chart & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Weekly Revenue Inflow</h2>
              <p className="text-xs text-gray-500">Daily sales figures across verified customer orders</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
              Live Feed
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-gray-100 pb-2">
            {revenueData.map((d, idx) => {
              const heightPercent = Math.round((d.amount / maxRevenue) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[11px] font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{(d.amount / 1000).toFixed(1)}k
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-orange-500 to-amber-400 group-hover:from-orange-600 group-hover:to-amber-500 transition-all shadow-xs"
                  />
                  <span className="text-xs font-medium text-gray-500 mt-1">{d.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
            <span>Peak Day: <strong>Saturday (₹38,900)</strong></span>
            <span>Total Orders: <strong>225 batches</strong></span>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Revenue by Category</h2>
            <p className="text-xs text-gray-500">Distribution across product departments</p>
          </div>

          <div className="space-y-4">
            {topCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-800">{cat.name}</span>
                  <span className="font-bold text-gray-900">{cat.revenue}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${cat.share}%` }}
                    className={`h-full rounded-full ${
                      idx === 0
                        ? "bg-orange-500"
                        : idx === 1
                        ? "bg-amber-400"
                        : idx === 2
                        ? "bg-red-400"
                        : "bg-emerald-500"
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>{cat.share}% of total</span>
                  <span className="text-emerald-600 font-semibold">{cat.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
