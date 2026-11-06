import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const idx = db.orders.findIndex(
      (o) => o.orderId === id || o.orderNumber === id || String(o.id) === id
    );

    if (idx === -1) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // 1. Order Fulfillment Status
    if (body.orderStatus || body.status) {
      const newStatus = (body.orderStatus || body.status).toString().toUpperCase();
      const allowedStatus = [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ];
      if (allowedStatus.includes(newStatus)) {
        db.orders[idx].orderStatus = newStatus as any;
        db.orders[idx].status = newStatus.toLowerCase() as any;
      }
    }

    // 2. Payment Status (PAID / PENDING / FAILED / REFUNDED)
    if (body.paymentStatus) {
      const newPaymentStatus = body.paymentStatus.toString().toUpperCase();
      const allowedPaymentStatus = ["PAID", "PENDING", "FAILED", "REFUNDED"];
      if (allowedPaymentStatus.includes(newPaymentStatus)) {
        db.orders[idx].paymentStatus = newPaymentStatus as any;
      }
    }

    // 3. Payment Method (COD / UPI / CARD / NETBANKING)
    if (body.paymentMethod) {
      db.orders[idx].paymentMethod = body.paymentMethod.toString();
    }

    db.orders[idx].updatedAt = new Date().toISOString();
    saveDb();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: {
        orderId: db.orders[idx].orderId || db.orders[idx].orderNumber,
        orderStatus: db.orders[idx].orderStatus,
        paymentStatus: db.orders[idx].paymentStatus,
        paymentMethod: db.orders[idx].paymentMethod,
        order: db.orders[idx],
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
