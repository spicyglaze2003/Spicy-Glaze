import { NextResponse } from "next/server";
import { db, reloadDbIfChanged } from "@/lib/store-data";

export async function GET() {
  reloadDbIfChanged();
  const products = db.products || [];
  const orders = db.orders || [];
  const customers = db.customers || [];

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive !== false).length;
  const lowStockProducts = products.filter((p) => (p.stock ?? 50) > 0 && (p.stock ?? 50) <= 10).length;
  const outOfStockProducts = products.filter((p) => (p.stock ?? 50) <= 0 || p.availability === "out-of-season").length;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) =>
      o.orderStatus === "PENDING" ||
      o.orderStatus === "PROCESSING" ||
      o.status === "new" ||
      o.status === "processing"
  ).length;

  const completedOrders = orders.filter(
    (o) =>
      o.orderStatus === "DELIVERED" ||
      o.orderStatus === "CONFIRMED" ||
      o.status === "delivered" ||
      o.status === "confirmed"
  ).length;

  // Calculate revenue from all non-cancelled orders
  const totalRevenue = orders.reduce((sum, o) => {
    const isCancelled = (o.orderStatus || o.status || "").toUpperCase() === "CANCELLED";
    return !isCancelled ? sum + Number(o.totalAmount || o.total || 0) : sum;
  }, 0);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySales = orders
    .filter((o) => o.createdAt && o.createdAt.startsWith(todayStr) && (o.orderStatus || "").toUpperCase() !== "CANCELLED")
    .reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0);

  const uniqueCustomerSet = new Set(
    orders.map((o) => o.customerPhone || o.customerName || o.customer?.email).filter(Boolean)
  );
  const totalCustomers = Math.max(customers.length, uniqueCustomerSet.size);

  const recentOrders = orders.slice(0, 6).map((o) => ({
    id: o.orderId || o.orderNumber,
    customer: o.customerName || o.customer?.name || "Customer",
    amount: Number(o.totalAmount || o.total || 0),
    status: (o.orderStatus || o.status || "CONFIRMED").toLowerCase(),
    paymentStatus: (o.paymentStatus || "CONFIRMED").toUpperCase(),
    date: o.createdAt,
  }));

  // Top products from actual orders
  const productSalesMap: Record<string, { name: string; sold: number; revenue: number }> = {};
  for (const o of orders) {
    if ((o.orderStatus || "").toUpperCase() !== "CANCELLED") {
      const items = o.products || o.items || [];
      for (const item of items) {
        const name = (item as any).name || (item as any).product?.name || "Product";
        const qty = item.quantity || 1;
        const sub = Number((item as any).subtotal || (item as any).total || 0);
        if (!productSalesMap[name]) {
          productSalesMap[name] = { name, sold: 0, revenue: 0 };
        }
        productSalesMap[name].sold += qty;
        productSalesMap[name].revenue += sub;
      }
    }
  }

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  return NextResponse.json({
    success: true,
    message: "Dashboard statistics retrieved successfully",
    data: {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      todaySales,
      totalCustomers,
      recentOrders,
      topProducts,
    },
  });
}
