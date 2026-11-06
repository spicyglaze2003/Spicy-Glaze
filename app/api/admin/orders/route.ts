import { NextResponse } from "next/server";
import { db } from "@/lib/store-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const orderStatus = searchParams.get("orderStatus");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "25", 10);

  let list = [...db.orders];

  if (status) {
    list = list.filter(
      (o) =>
        o.paymentStatus?.toLowerCase() === status.toLowerCase() ||
        o.status?.toLowerCase() === status.toLowerCase()
    );
  }

  if (orderStatus) {
    list = list.filter(
      (o) =>
        o.orderStatus?.toLowerCase() === orderStatus.toLowerCase() ||
        o.status?.toLowerCase() === orderStatus.toLowerCase()
    );
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter((o) => {
      const orderId = (o.orderId || o.orderNumber || "").toLowerCase();
      const name = (o.customerName || o.customer?.name || "").toLowerCase();
      const phone = (o.customerPhone || o.customer?.phone || "").toLowerCase();
      return orderId.includes(q) || name.includes(q) || phone.includes(q);
    });
  }

  const total = list.length;
  const startIndex = (page - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit);

  const formattedOrders = paginated.map((o) => ({
    id: o.id,
    orderId: o.orderId || o.orderNumber,
    orderNumber: o.orderNumber || o.orderId,
    customerName: o.customerName || o.customer?.name || "Customer",
    customerPhone: o.customerPhone || o.customer?.phone || "",
    customer: o.customer,
    totalAmount: o.totalAmount || o.total,
    total: o.totalAmount || o.total,
    subtotal: o.subtotal,
    items: o.items,
    products: o.products || o.items,
    quantity: o.quantity || o.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1,
    paymentStatus: (o.paymentStatus || "PAID").toUpperCase(),
    orderStatus: (o.orderStatus || o.status || "CONFIRMED").toUpperCase(),
    status: o.status || "new",
    paymentId: o.paymentId || "N/A",
    paymentMethod: o.paymentMethod,
    shippingAddress: o.shippingAddress,
    invoiceUrl: `/api/orders/${o.orderId || o.orderNumber}/invoice`,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  }));

  return NextResponse.json({
    success: true,
    message: "Orders retrieved successfully",
    data: {
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
}
