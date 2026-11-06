import { NextResponse } from "next/server";
import { db } from "@/lib/store-data";
import { generateInvoicePdfBuffer } from "@/lib/invoice-pdf";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "").toLowerCase();
    const download = searchParams.get("download");

    const order = db.orders.find(
      (o) =>
        o.orderId?.toLowerCase() === id.toLowerCase() ||
        o.orderNumber?.toLowerCase() === id.toLowerCase() ||
        String(o.id) === id
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: `Order not found: ${id}` },
        { status: 404 }
      );
    }

    const orderId = order.orderId || order.orderNumber || `ORD-${order.id}`;
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const customerName =
      order.customerName ||
      order.customer?.name ||
      order.shippingAddress?.name ||
      "Valued Customer";
    const customerPhone =
      order.customerPhone ||
      order.customer?.phone ||
      order.shippingAddress?.phone ||
      "";
    const customerAddress =
      order.customerAddress ||
      `${order.shippingAddress?.line1 || ""}, ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} ${order.shippingAddress?.pincode || ""}`.trim();

    const items = (order.products || order.items || []).map((item: any) => {
      const unitPrice = Number(item.unitPrice || item.price || 0);
      const quantity = Math.max(1, Number(item.quantity || 1));
      const subtotal = Number(item.subtotal || item.total || unitPrice * quantity);
      return {
        name: item.name || item.product?.name || "Product",
        variant: item.variantName || item.variant || undefined,
        quantity,
        unitPrice,
        subtotal,
      };
    });

    const calculatedSum = items.reduce(
      (sum: number, it: any) => sum + (Number(it.subtotal) || 0),
      0
    );
    const invoiceSubtotal = Number(order.subtotal || calculatedSum || order.total || 0);
    const invoiceTotal = Number(
      order.totalAmount || order.total || invoiceSubtotal
    );

    const invoiceData = {
      orderId,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: (order.paymentStatus || "CONFIRMED").toUpperCase(),
      orderStatus: (order.orderStatus || order.status || "CONFIRMED").toUpperCase(),
      items,
      subtotal: invoiceSubtotal,
      totalAmount: invoiceTotal,
    };

    // If PDF format requested OR any download trigger: ALWAYS send PDF
    const isPdfOrDownload =
      format === "pdf" ||
      format === "download" ||
      download === "1" ||
      download === "true" ||
      download === "pdf" ||
      (!format && download !== null);

    if (isPdfOrDownload) {
      const pdfBuffer = generateInvoicePdfBuffer(invoiceData);
      return new Response(pdfBuffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="SpicyGlaze-Invoice-${orderId}.pdf"`,
          "Content-Length": String(pdfBuffer.byteLength),
        },
      });
    }

    // HTML view when format=html is explicitly requested for web browser preview
    if (format === "html" || format === "view") {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${orderId} - SpicyGlaze</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background: #fffaf5; padding: 40px 20px; color: #1e293b; margin: 0; }
    .invoice-box { max-width: 680px; margin: auto; padding: 40px; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 30px rgba(234, 88, 12, 0.08); border: 1px solid #fed7aa; }
    .header { text-align: center; border-bottom: 2px dashed #f97316; padding-bottom: 24px; margin-bottom: 24px; }
    .logo { font-size: 30px; font-weight: 900; color: #ea580c; letter-spacing: -0.5px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .tagline { font-size: 13px; color: #7c2d12; margin-top: 6px; font-weight: 500; }
    .actions-top { display: flex; justify-content: center; gap: 12px; margin-bottom: 24px; }
    .meta-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 20px; color: #475569; background: #fff7ed; padding: 12px 16px; border-radius: 12px; }
    .customer-box { background: #f8fafc; padding: 18px; border-radius: 14px; margin-bottom: 24px; font-size: 14px; line-height: 1.6; border: 1px solid #e2e8f0; }
    .customer-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #ea580c; letter-spacing: 0.5px; margin-bottom: 8px; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
    .table th { text-align: left; padding: 12px 10px; border-bottom: 2px solid #fed7aa; color: #9a3412; font-weight: 700; text-transform: uppercase; font-size: 12px; }
    .table td { padding: 14px 10px; border-bottom: 1px solid #f1f5f9; }
    .total-section { border-top: 2px dashed #fed7aa; padding-top: 16px; font-size: 15px; margin-bottom: 24px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; }
    .grand-total { font-size: 20px; font-weight: 800; color: #ea580c; border-top: 1px solid #fed7aa; padding-top: 12px; margin-top: 8px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: #ffedd5; color: #c2410c; }
    .footer { text-align: center; font-size: 13px; color: #64748b; margin-top: 32px; border-top: 1px solid #fed7aa; padding-top: 24px; }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; background: #ea580c; color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; text-decoration: none; transition: 0.2s; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25); }
    .btn:hover { background: #c2410c; }
    .btn-outline { background: white; color: #ea580c; border: 1.5px solid #ea580c; box-shadow: none; }
    .btn-outline:hover { background: #fff7ed; }
    @media print { .actions-top, .footer .btn-group { display: none !important; } body { background: white; padding: 0; } .invoice-box { box-shadow: none; border: none; padding: 20px; } }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="actions-top">
      <a class="btn" href="/api/orders/${orderId}/invoice?format=pdf&download=1" download="SpicyGlaze-Invoice-${orderId}.pdf">
        📥 Download Official PDF Invoice
      </a>
      <button class="btn btn-outline" onclick="window.print()">
        🖨️ Print
      </button>
    </div>

    <div class="header">
      <div class="logo">🌶️ SpicyGlaze</div>
      <div class="tagline">Naturally Crafted Artisanal Spices & Gourmet Preserves</div>
    </div>
    
    <div class="meta-row">
      <div><strong>Invoice #:</strong> ${orderId}</div>
      <div><strong>Date:</strong> ${orderDate}</div>
    </div>

    <div class="customer-box">
      <div class="customer-title">Billed To & Delivery Address</div>
      <strong>${customerName}</strong><br>
      📞 ${customerPhone || "N/A"}<br>
      📍 ${customerAddress || "N/A"}
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (it: any) => `<tr>
          <td><strong>${it.name}</strong>${it.variant ? ` <span style="color:#64748b; font-size:12px;">(${it.variant})</span>` : ""}</td>
          <td style="text-align: center;">${it.quantity}</td>
          <td style="text-align: right;">₹${Number(it.unitPrice).toFixed(2)}</td>
          <td style="text-align: right; font-weight: 700; color: #ea580c;">₹${Number(it.subtotal).toFixed(2)}</td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>₹${Number(invoiceSubtotal).toFixed(2)}</span>
      </div>
      <div class="total-row">
        <span>Shipping & Delivery:</span>
        <span style="color: #16a34a; font-weight: 600;">FREE</span>
      </div>
      <div class="total-row grand-total">
        <span>Total Amount:</span>
        <span>₹${Number(invoiceTotal).toFixed(2)}</span>
      </div>
      <div class="total-row" style="margin-top: 10px;">
        <span>Order Status:</span>
        <span class="badge">${(order.orderStatus || order.status || "CONFIRMED").toUpperCase()}</span>
      </div>
      <div class="total-row" style="font-size: 12px; color: #64748b; margin-top: 4px;">
        <span>Payment Method:</span>
        <span>${order.paymentMethod ? String(order.paymentMethod).toUpperCase() : "CASH ON DELIVERY / WHATSAPP PAY"}</span>
      </div>
    </div>

    <div class="footer">
      <p style="font-weight: 600; color: #ea580c; margin-bottom: 4px;">Thank you for your order with SpicyGlaze!</p>
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">For inquiries & tracking, WhatsApp us at +91 73052 56022 or email hello@spicyglaze.in</p>
      <div class="btn-group" style="margin-top: 20px;">
        <a class="btn" href="/api/orders/${orderId}/invoice?format=pdf&download=1" download="SpicyGlaze-Invoice-${orderId}.pdf">
          📥 Download PDF Invoice
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    // Default JSON
    return NextResponse.json({
      success: true,
      message: "Invoice retrieved successfully",
      data: invoiceData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
