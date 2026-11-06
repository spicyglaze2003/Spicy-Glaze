import { jsPDF } from "jspdf";

export interface InvoiceItem {
  name: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface InvoiceOrderData {
  orderId: string;
  orderNumber?: string;
  createdAt: string | Date;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  items: InvoiceItem[];
  subtotal: number;
  shippingFee?: number;
  discountAmount?: number;
  totalAmount: number;
}

export function generateInvoicePdfBuffer(order: InvoiceOrderData): Uint8Array {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // 1. Top Accent Bar
  doc.setFillColor(234, 88, 12); // #ea580c (Terracotta / Orange)
  doc.rect(0, 0, pageWidth, 5, "F");

  // 2. Brand & Header Section
  let y = 18;

  // Logo text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(234, 88, 12);
  doc.text("SPICYGLAZE", margin, y);

  // INVOICE title on the right
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text("TAX INVOICE", pageWidth - margin, y, { align: "right" });

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Naturally Crafted Artisanal Spices & Gourmet Preserves", margin, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(234, 88, 12);
  doc.text(`Invoice #: ${order.orderId}`, pageWidth - margin, y, { align: "right" });

  y += 5;
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${formattedDate}`, pageWidth - margin, y, { align: "right" });

  y += 6;
  // Divider
  doc.setDrawColor(254, 215, 170); // #fed7aa
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 7;

  // 3. Info Boxes: Billed To (Left) & Order Details (Right)
  const boxWidth = (contentWidth - 6) / 2;
  const boxHeight = 36;

  // Billed To Box
  doc.setFillColor(248, 250, 252); // #f8fafc
  doc.setDrawColor(226, 232, 240); // #e2e8f0
  doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(234, 88, 12);
  doc.text("BILLED TO & SHIPPING ADDRESS", margin + 4, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(order.customerName || "Valued Customer", margin + 4, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const phoneText = order.customerPhone ? `Phone: ${order.customerPhone}` : "";
  if (phoneText) {
    doc.text(phoneText, margin + 4, y + 17);
  }

  const rawAddress = order.customerAddress || "Address provided during checkout";
  const addressLines = doc.splitTextToSize(rawAddress, boxWidth - 8);
  doc.text(addressLines.slice(0, 3), margin + 4, y + (phoneText ? 22 : 18));

  // Order Details Box
  const rightBoxX = margin + boxWidth + 6;
  doc.setFillColor(255, 247, 237); // #fff7ed
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(rightBoxX, y, boxWidth, boxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(234, 88, 12);
  doc.text("ORDER SUMMARY", rightBoxX + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text("Order ID:", rightBoxX + 4, y + 13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(order.orderId, rightBoxX + 26, y + 13);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Status:", rightBoxX + 4, y + 19);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 163, 74);
  doc.text((order.orderStatus || "CONFIRMED").toUpperCase(), rightBoxX + 26, y + 19);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Payment:", rightBoxX + 4, y + 25);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(
    (order.paymentMethod || "COD / WhatsApp Pay").toUpperCase(),
    rightBoxX + 26,
    y + 25
  );

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Pay Status:", rightBoxX + 4, y + 31);
  doc.setFont("helvetica", "bold");
  const pStatus = (order.paymentStatus || "PENDING").toUpperCase();
  doc.setTextColor(pStatus === "PAID" ? 22 : 234, pStatus === "PAID" ? 163 : 88, pStatus === "PAID" ? 74 : 12);
  doc.text(pStatus, rightBoxX + 26, y + 31);

  y += boxHeight + 8;

  // 4. Products Table
  // Table Header
  const tableHeaderHeight = 8;
  doc.setFillColor(254, 215, 170); // #fed7aa
  doc.rect(margin, y, contentWidth, tableHeaderHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(154, 52, 18); // #9a3412

  doc.text("#", margin + 3, y + 5.5);
  doc.text("ITEM DESCRIPTION", margin + 12, y + 5.5);
  doc.text("QTY", margin + 115, y + 5.5, { align: "center" });
  doc.text("UNIT PRICE (INR)", margin + 145, y + 5.5, { align: "right" });
  doc.text("TOTAL (INR)", pageWidth - margin - 3, y + 5.5, { align: "right" });

  y += tableHeaderHeight;

  // Table Rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  order.items.forEach((item, index) => {
    const rowHeight = 10;
    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(250, 250, 250);
    }
    doc.rect(margin, y, contentWidth, rowHeight, "F");

    // Bottom border
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.3);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

    // Number
    doc.setTextColor(100, 116, 139);
    doc.text(String(index + 1), margin + 3, y + 6);

    // Description & variant
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    const itemTitle = item.name + (item.variant ? ` (${item.variant})` : "");
    const truncatedTitle = itemTitle.length > 50 ? itemTitle.substring(0, 48) + "..." : itemTitle;
    doc.text(truncatedTitle, margin + 12, y + 6);

    // Qty
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(String(item.quantity), margin + 115, y + 6, { align: "center" });

    // Unit price
    doc.text(`Rs. ${Number(item.unitPrice).toFixed(2)}`, margin + 145, y + 6, { align: "right" });

    // Subtotal
    doc.setFont("helvetica", "bold");
    doc.setTextColor(234, 88, 12);
    doc.text(`Rs. ${Number(item.subtotal).toFixed(2)}`, pageWidth - margin - 3, y + 6, {
      align: "right",
    });

    y += rowHeight;
  });

  y += 5;

  // 5. Totals Section (Right Aligned Box)
  const totalsWidth = 75;
  const totalsX = pageWidth - margin - totalsWidth;

  doc.setFillColor(255, 247, 237);
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(totalsX, y, totalsWidth, 38, 2, 2, "FD");

  let ty = y + 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Items Subtotal:", totalsX + 4, ty);
  doc.setTextColor(30, 41, 59);
  doc.text(`Rs. ${Number(order.subtotal).toFixed(2)}`, pageWidth - margin - 4, ty, {
    align: "right",
  });

  ty += 6;
  doc.setTextColor(71, 85, 105);
  doc.text("Delivery & Shipping:", totalsX + 4, ty);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 163, 74);
  doc.text("FREE", pageWidth - margin - 4, ty, { align: "right" });

  if (order.discountAmount && order.discountAmount > 0) {
    ty += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Discount:", totalsX + 4, ty);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74);
    doc.text(`- Rs. ${Number(order.discountAmount).toFixed(2)}`, pageWidth - margin - 4, ty, {
      align: "right",
    });
  }

  ty += 3;
  doc.setDrawColor(254, 215, 170);
  doc.setLineWidth(0.4);
  doc.line(totalsX + 4, ty, pageWidth - margin - 4, ty);

  ty += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(234, 88, 12);
  doc.text("Grand Total:", totalsX + 4, ty);
  doc.text(`Rs. ${Number(order.totalAmount).toFixed(2)}`, pageWidth - margin - 4, ty, {
    align: "right",
  });

  // 6. Guarantee & Notes (Left Side)
  const notesWidth = contentWidth - totalsWidth - 8;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, notesWidth, 38, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Thank you for choosing SpicyGlaze!", margin + 4, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "All our products are 100% naturally crafted, sun-cured, and free from artificial colors or chemical preservatives.",
    margin + 4,
    y + 13,
    { maxWidth: notesWidth - 8 }
  );

  doc.text(
    "For customer support or order tracking, reach out to us at hello@spicyglaze.in or via WhatsApp at +91 73052 56022.",
    margin + 4,
    y + 24,
    { maxWidth: notesWidth - 8 }
  );

  // 7. Page Footer
  const footerY = pageHeight - 16;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "SpicyGlaze Artisanal Foods • This is a computer-generated tax invoice and requires no physical signature.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  return new Uint8Array(doc.output("arraybuffer"));
}
