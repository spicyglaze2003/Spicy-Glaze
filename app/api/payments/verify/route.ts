import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, paymentId, simulateFailure } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    const orderIdx = db.orders.findIndex(
      (o) => o.orderId === orderId || o.orderNumber === orderId || String(o.id) === orderId
    );

    if (orderIdx === -1) {
      return NextResponse.json(
        { success: false, message: `Order not found: ${orderId}` },
        { status: 404 }
      );
    }

    const order = db.orders[orderIdx];

    // Idempotency check: if already paid, do not deduct stock again
    if (order.paymentStatus === "PAID" || order.paymentStatus === "paid") {
      return NextResponse.json({
        success: true,
        message: "Payment already verified",
        data: {
          orderId: order.orderId || order.orderNumber,
          paymentStatus: "PAID",
          orderStatus: order.orderStatus || "CONFIRMED",
          order,
        },
      });
    }

    // Check for payment failure
    if (simulateFailure === true) {
      db.orders[orderIdx].paymentStatus = "FAILED";
      db.orders[orderIdx].status = "cancelled";
      db.orders[orderIdx].orderStatus = "CANCELLED";
      db.orders[orderIdx].updatedAt = new Date().toISOString();
      saveDb();

      return NextResponse.json(
        {
          success: false,
          message: "Payment failed. Your card was declined or transaction was cancelled.",
          error: {
            code: "PAYMENT_FAILED",
            details: "Transaction could not be completed.",
          },
        },
        { status: 400 }
      );
    }

    // Successful payment:
    // 1. Update Order
    db.orders[orderIdx].paymentStatus = "PAID";
    db.orders[orderIdx].status = "confirmed";
    db.orders[orderIdx].orderStatus = "CONFIRMED";
    db.orders[orderIdx].paymentId = paymentId || `PAY-STRIPE-${Date.now()}`;
    db.orders[orderIdx].updatedAt = new Date().toISOString();

    // 2. Reduce Stock in Database automatically
    const itemsToDeduct = order.products || order.items || [];
    for (const item of itemsToDeduct) {
      const pId = (item as any).productId || (item as any).id;
      const qty = item.quantity || 1;

      const pIdx = db.products.findIndex(
        (p) =>
          p.productId === String(pId) ||
          String(p.id) === String(pId) ||
          (p.variants && p.variants.some((v) => String(v.id) === String(pId)))
      );

      if (pIdx !== -1) {
        const currentStock = db.products[pIdx].stock ?? 50;
        const newStock = Math.max(0, currentStock - qty);
        db.products[pIdx].stock = newStock;
        db.products[pIdx].availability = newStock > 0 ? "in-stock" : "out-of-season";
        if (db.products[pIdx].variants && db.products[pIdx].variants.length > 0) {
          db.products[pIdx].variants[0].stock = newStock;
        }
        db.products[pIdx].updatedAt = new Date().toISOString();
      }
    }

    saveDb();

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      data: {
        orderId: db.orders[orderIdx].orderId || db.orders[orderIdx].orderNumber,
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        paymentId: db.orders[orderIdx].paymentId,
        order: db.orders[orderIdx],
      },
    });
  } catch (err: any) {
    console.error("Payment verification error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
