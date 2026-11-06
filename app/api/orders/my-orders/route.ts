import { NextResponse } from "next/server";
import { db } from "@/lib/store-data";

export async function GET() {
  const orders = db.orders.map((o) => {
    const orderId = o.orderId || o.orderNumber;
    const items = (o.products || o.items || []).map((it: any) => ({
      productId: it.productId || String(it.id || ""),
      name: it.name || it.product?.name || "Product",
      quantity: it.quantity || 1,
      unitPrice: it.unitPrice || it.price || 0,
      subtotal: it.subtotal || it.total || (it.unitPrice || it.price || 0) * (it.quantity || 1),
      imageUrl: it.imageUrl || it.product?.thumbnail?.url || "",
    }));

    return {
      orderId,
      createdAt: o.createdAt,
      items,
      totalAmount: o.totalAmount || o.total,
      paymentStatus: (o.paymentStatus || "PAID").toUpperCase(),
      orderStatus: (o.orderStatus || o.status || "CONFIRMED").toUpperCase(),
      invoiceUrl: `/api/orders/${orderId}/invoice`,
      customerName: o.customerName || o.customer?.name || "Customer",
      customerPhone: o.customerPhone || o.customer?.phone || "",
    };
  });

  return NextResponse.json({
    success: true,
    message: "Orders retrieved successfully",
    data: { orders },
  });
}
