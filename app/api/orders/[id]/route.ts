import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const order = db.orders.find(
    (o) => o.orderId === id || o.orderNumber === id || String(o.id) === id
  );

  if (!order) {
    return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
  }

  const orderId = order.orderId || order.orderNumber;
  const items = (order.products || order.items || []).map((it: any) => ({
    productId: it.productId || String(it.id || ""),
    name: it.name || it.product?.name || "Product",
    quantity: it.quantity || 1,
    unitPrice: it.unitPrice || it.price || 0,
    subtotal: it.subtotal || it.total || (it.unitPrice || it.price || 0) * (it.quantity || 1),
    imageUrl: it.imageUrl || it.product?.thumbnail?.url || "",
  }));

  return NextResponse.json({
    success: true,
    message: "Order retrieved successfully",
    data: {
      order: {
        orderId,
        customerName: order.customerName || order.customer?.name || "Customer",
        customerPhone: order.customerPhone || order.customer?.phone || "",
        customerAddress: order.customerAddress || "",
        items,
        subtotal: order.subtotal || order.total,
        totalAmount: order.totalAmount || order.total,
        paymentStatus: (order.paymentStatus || "PAID").toUpperCase(),
        orderStatus: (order.orderStatus || order.status || "CONFIRMED").toUpperCase(),
        paymentId: order.paymentId || "",
        invoiceUrl: `/api/orders/${orderId}/invoice`,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    },
  });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const payload = body.data || body;

    const idx = db.orders.findIndex(
      (o) => o.orderId === id || o.orderNumber === id || String(o.id) === id
    );
    if (idx === -1) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const updatedStatus = payload.orderStatus || payload.status;
    const updatedPaymentStatus = payload.paymentStatus;

    db.orders[idx] = {
      ...db.orders[idx],
      ...payload,
      status: updatedStatus || db.orders[idx].status,
      orderStatus: updatedStatus || db.orders[idx].orderStatus,
      paymentStatus: updatedPaymentStatus || db.orders[idx].paymentStatus,
      updatedAt: new Date().toISOString(),
    };

    saveDb();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: db.orders[idx],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
