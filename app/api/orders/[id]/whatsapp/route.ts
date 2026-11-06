import { NextResponse } from "next/server";
import { db } from "@/lib/store-data";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const phone = body.phone;

    const order = db.orders.find(
      (o) => o.orderId === id || o.orderNumber === id || String(o.id) === id
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: `Order not found: ${id}` },
        { status: 404 }
      );
    }

    const orderId = order.orderId || order.orderNumber;
    const targetPhone = phone || order.customerPhone || order.shippingAddress?.phone || "";
    const cleanPhone = targetPhone.replace(/\D/g, "");

    const items = order.products || order.items || [];
    const productLines = items
      .map((it: any, i: number) => {
        const name = it.name || it.product?.name || "Product";
        const qty = it.quantity || 1;
        const subtotal = it.subtotal || it.total || (it.unitPrice || it.price || 0) * qty;
        return `${i + 1}. ${name} × ${qty} – ₹${subtotal}`;
      })
      .join("\n");

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const invoiceLink = `${protocol}://${host}/api/orders/${orderId}/invoice?format=pdf`;

    const messageText = `SPICYGLAZE – ORDER CONFIRMATION\n\nOrder ID: ${orderId}\n\nYour order has been successfully placed.\n\nProducts:\n${productLines}\n\nTotal: ₹${order.totalAmount || order.total}\n\nPayment Status: ${(order.paymentStatus || "CONFIRMED").toUpperCase()}\n\nOfficial PDF Invoice: ${invoiceLink}\n\nThank you for shopping with SpicyGlaze!`;

    const directUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone}&text=${encodeURIComponent(messageText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

    // Check official WhatsApp Business API credentials in environment
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
      // Prompt requirement: "If WhatsApp API credentials are not configured, show:
      // WhatsApp integration is not configured. Please configure the WhatsApp API credentials.
      // Do not fake successful delivery."
      return NextResponse.json(
        {
          success: false,
          configured: false,
          message:
            "WhatsApp integration is not configured. Please configure the WhatsApp API credentials.",
          error: {
            code: "WHATSAPP_NOT_CONFIGURED",
            details: "WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID is not configured in environment.",
          },
          data: {
            orderId,
            messageText,
            directUrl,
            phone: cleanPhone,
          },
        },
        { status: 200 }
      );
    }

    // If configured, send via Cloud API
    try {
      const waRes = await fetch(
        `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone,
            type: "text",
            text: { body: messageText },
          }),
        }
      );

      const waData = await waRes.json();

      if (!waRes.ok) {
        return NextResponse.json(
          {
            success: false,
            configured: true,
            message: "Unable to send WhatsApp invoice via API.",
            error: { code: "WHATSAPP_SEND_FAILED", details: waData },
            data: { directUrl, messageText },
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Invoice sent to WhatsApp",
        data: {
          orderId,
          deliveryStatus: "SENT",
          whatsappMessageId: waData.messages?.[0]?.id,
        },
      });
    } catch (apiErr: any) {
      return NextResponse.json(
        {
          success: false,
          configured: true,
          message: "Unable to send WhatsApp invoice",
          error: { code: "WHATSAPP_SEND_FAILED", details: apiErr.message },
          data: { directUrl },
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
