"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ShoppingBag,
  ShoppingCart,
  Users,
  IndianRupee,
  Package,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Plus,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { getDashboardStats, getAdminOrders } from "@/lib/admin-api";
import type { DashboardStats } from "@/lib/admin-types";

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  color,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  color: string;
  href?: string;
}) {
  const colorMap: Record<string, string> = {
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
  };

  const card = (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            colorMap[color] || colorMap.orange
          )}
        >
          <Icon size={22} />
        </div>
        {subtitle && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-50 text-gray-600">
            {subtitle}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
      {href && (
        <div className="mt-3 flex items-center gap-1 text-xs text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>View details</span>
          <ArrowRight size={12} />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

// Recent Orders Component
function RecentOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: () => getAdminOrders({ pageSize: 5 }),
  });

  const orders = data?.data || [];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-xs text-gray-500">Live order transactions from database</p>
        </div>
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-orange-500 hover:text-orange-600 flex items-center gap-1"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="py-10 text-center">
          <ShoppingCart size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm font-medium text-gray-600">No orders placed yet</p>
          <p className="text-xs text-gray-400 mt-1">
            New customer purchases will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.slice(0, 5).map((order: any) => {
            const orderId = order.orderId || `#${order.id}`;
            const customerName = order.customerName || order.customer?.name || "Customer";
            const amount = order.totalAmount || order.total || 0;
            const isPaid = order.paymentStatus === "PAID" || order.paymentStatus === "paid";

            return (
              <div
                key={order.id}
                className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0">
                    SG
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{orderId}</p>
                    <p className="text-xs text-gray-500 truncate">{customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatPrice(amount)}</p>
                  <span
                    className={cn(
                      "text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5",
                      isPaid
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    )}
                  >
                    {isPaid ? "PAID" : "PENDING"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Inventory Alerts
function InventoryAlerts({ stats }: { stats: DashboardStats | null }) {
  const lowStock = stats?.lowStockProducts ?? 0;
  const outOfStock = stats?.outOfStockProducts ?? 0;

  const alerts = [
    {
      label: "Low Stock Items",
      count: lowStock,
      icon: AlertTriangle,
      color: "text-amber-500 bg-amber-50",
      href: "/admin/products?status=active",
    },
    {
      label: "Out of Stock Items",
      count: outOfStock,
      icon: XCircle,
      color: "text-red-500 bg-red-50",
      href: "/admin/products",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Inventory Health</h3>
      <p className="text-xs text-gray-500 mb-5">Stock levels across all catalog items</p>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Link
            key={alert.label}
            href={alert.href}
            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  alert.color
                )}
              >
                <alert.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{alert.label}</p>
                <p className="text-xs text-gray-500">{alert.count} products</p>
              </div>
            </div>
            <ArrowRight
              size={16}
              className="text-gray-400 group-hover:text-orange-500 transition-colors"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboardStats,
    retry: 1,
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            SpicyGlaze real-time store management, CRM, and inventory overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            <FileSpreadsheet size={16} />
            Excel Import
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={isLoading ? "..." : formatPrice(stats?.totalRevenue ?? 0)}
          icon={IndianRupee}
          subtitle="All confirmed orders"
          color="green"
        />
        <StatCard
          title="Catalogue Products"
          value={isLoading ? "..." : stats?.totalProducts ?? 0}
          icon={ShoppingBag}
          subtitle={`${stats?.activeProducts ?? 0} active`}
          color="blue"
          href="/admin/products"
        />
        <StatCard
          title="Total Orders"
          value={isLoading ? "..." : stats?.totalOrders ?? 0}
          icon={ShoppingCart}
          subtitle={`${stats?.pendingOrders ?? 0} pending`}
          color="purple"
          href="/admin/orders"
        />
        <StatCard
          title="Active Customers"
          value={isLoading ? "..." : stats?.totalCustomers ?? 0}
          icon={Users}
          subtitle="Verified users"
          color="orange"
          href="/admin/customers"
        />
      </div>

      {/* Grid: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <div>
          <InventoryAlerts stats={stats || null} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Management</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "New Product",
              href: "/admin/products/new",
              icon: Package,
              color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
            },
            {
              label: "All Products",
              href: "/admin/products",
              icon: ShoppingBag,
              color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
            },
            {
              label: "Orders & Invoices",
              href: "/admin/orders",
              icon: ShoppingCart,
              color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
            },
            {
              label: "Store Front",
              href: "/products",
              icon: ArrowRight,
              color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
            },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl transition-colors text-center",
                action.color
              )}
            >
              <action.icon size={22} />
              <span className="text-sm font-semibold">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
