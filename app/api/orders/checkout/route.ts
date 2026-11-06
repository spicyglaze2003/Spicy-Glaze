import { NextResponse } from "next/server";
import { db, saveDb, reloadDbIfChanged } from "@/lib/store-data";
import type { Order, OrderProductSnapshot, OrderItem } from "@/lib/admin-types";
import { normalizeImageUrl } from "@/lib/utils";

function generateOrderId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `LM${dateStr}${randomSuffix}`;
}

export async function POST(request: Request) {
  try {
    reloadDbIfChanged();
    const body = await request.json();
    const payload = body.data || body;

    const rawItems: any[] = payload.items || [];
    if (!rawItems || rawItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Your cart is empty" },
        { status: 400 }
      );
    }

    const shippingAddress = payload.shippingAddress || {
      name: payload.customerName || "Customer",
      phone: payload.customerPhone || "",
      line1: payload.address || "",
      city: payload.city || "Erode",
      state: payload.state || "Tamil Nadu",
      pincode: payload.pincode || "638001",
    };

    const customerName = payload.customerName || shippingAddress.name || "Customer";
    const customerPhone = payload.customerPhone || shippingAddress.phone || "";
    const customerAddress =
      typeof payload.address === "string"
        ? payload.address
        : `${shippingAddress.line1 || ""}, ${shippingAddress.city || ""}, ${shippingAddress.state || ""} ${shippingAddress.pincode || ""}`.trim();

    const verifiedSnapshots: OrderProductSnapshot[] = [];
    const verifiedOrderItems: OrderItem[] = [];
    let calculatedSubtotal = 0;
    let totalItemsQuantity = 0;

    for (const item of rawItems) {
      const pId = item.productId || item.id || item.variantId;
      const requestedQty = parseInt(String(item.quantity || 1), 10);

      if (requestedQty <= 0) {
        return NextResponse.json(
          { success: false, message: "Invalid item quantity" },
          { status: 400 }
        );
      }

      // Find product in database (case-insensitive & variant-aware)
      const cleanPId = String(pId || "").trim().toLowerCase();
      const cleanVId = String(item.variantId || "").trim().toLowerCase();

      const product = db.products.find(
        (p) =>
          String(p.id).toLowerCase() === cleanPId ||
          (p.productId && p.productId.toLowerCase() === cleanPId) ||
          (p.slug && p.slug.toLowerCase() === cleanPId) ||
          (p.documentId && p.documentId.toLowerCase() === cleanPId) ||
          (p.variants &&
            p.variants.some(
              (v) =>
                String(v.id).toLowerCase() === cleanPId ||
                String(v.id).toLowerCase() === cleanVId ||
                (v.documentId && v.documentId.toLowerCase() === cleanVId)
            ))
      );

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Product not found in database: ID ${pId}`,
          },
          { status: 404 }
        );
      }

      if (product.isActive === false) {
        return NextResponse.json(
          {
            success: false,
            message: `Product "${product.name}" is no longer available`,
          },
          { status: 400 }
        );
      }

      const availableStock = product.stock ?? product.variants?.[0]?.stock ?? 0;
      if (requestedQty > availableStock) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for "${product.name}". Requested: ${requestedQty}, Available: ${availableStock}`,
            error: {
              code: "INSUFFICIENT_STOCK",
              details: {
                productName: product.name,
                availableStock,
                requestedQuantity: requestedQty,
              },
            },
          },
          { status: 400 }
        );
      }

      // Resolve unit price from variant, payload, or product
      const matchedVariant = product.variants?.find(
        (v) => String(v.id) === String(item.variantId) || String(v.id) === String(pId)
      );

      const unitPrice = Number(
        (matchedVariant && Number(matchedVariant.price) > 0 ? Number(matchedVariant.price) : null) ??
        (item.unitPrice && Number(item.unitPrice) > 0 ? Number(item.unitPrice) : null) ??
        (item.price && Number(item.price) > 0 ? Number(item.price) : null) ??
        (product.price && Number(product.price) > 0 ? Number(product.price) : 0)
      );

      const itemSubtotal = unitPrice * requestedQty;
      calculatedSubtotal += itemSubtotal;
      totalItemsQuantity += requestedQty;

      const resolvedImg = normalizeImageUrl(
        product.imageUrl || product.image || product.thumbnail?.url || item.imageUrl || ""
      );

      verifiedSnapshots.push({
        productId: product.productId || String(product.id),
        name: item.name || product.name,
        quantity: requestedQty,
        price: unitPrice,
        unitPrice,
        subtotal: itemSubtotal,
        imageUrl: resolvedImg,
      });

      verifiedOrderItems.push({
        id: Date.now() + verifiedOrderItems.length,
        product,
        productId: product.productId || String(product.id),
        name: item.name || product.name,
        quantity: requestedQty,
        unitPrice,
        price: unitPrice,
        total: itemSubtotal,
        subtotal: itemSubtotal,
      });
    }

    const orderId = generateOrderId();
    const totalAmount = calculatedSubtotal > 0 ? calculatedSubtotal : Number(payload.totalAmount || payload.subtotal || 0);
    const paymentMethod = payload.paymentMethod || "cod";

    // Create pending order in database
    const newOrder: Order = {
      id: Date.now(),
      documentId: `ord-${Date.now()}`,
      orderId,
      orderNumber: orderId,
      userId: payload.userId || "GUEST",
      customerName,
      customerPhone,
      customerAddress,
      customer: {
        id: Date.now(),
        documentId: `cust-${Date.now()}`,
        name: customerName,
        email: payload.customerEmail || "customer@localmart.in",
        phone: customerPhone,
        totalOrders: 1,
        totalSpent: totalAmount,
        segment: "new",
        isBlocked: false,
        lastOrderAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      items: verifiedOrderItems,
      products: verifiedSnapshots,
      quantity: totalItemsQuantity,
      subtotal: calculatedSubtotal,
      shippingFee: 0,
      discount: 0,
      tax: 0,
      total: totalAmount,
      totalAmount,
      status: "new",
      orderStatus: "PENDING",
      paymentStatus: "PENDING",
      paymentMethod,
      paymentId: `PAY-${Date.now()}`,
      invoiceUrl: `/api/orders/${orderId}/invoice`,
      shippingAddress: {
        name: customerName,
        phone: customerPhone,
        line1: customerAddress,
        city: shippingAddress.city || "Erode",
        state: shippingAddress.state || "Tamil Nadu",
        pincode: shippingAddress.pincode || "638001",
        country: "India",
      },
      notes: payload.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    saveDb();

    return NextResponse.json({
      success: true,
      message: "Checkout initialized",
      data: {
        orderId,
        amount: totalAmount,
        currency: "INR",
        payment: {
          provider: paymentMethod,
          clientSecret: `pi_mock_${orderId}_secret_${Date.now()}`,
          paymentId: newOrder.paymentId,
        },
        order: newOrder,
      },
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}
