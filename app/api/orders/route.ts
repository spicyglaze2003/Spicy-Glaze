import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";
import type { Order } from "@/lib/admin-types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("filters[status][$eq]");
  const search = searchParams.get("filters[orderNumber][$containsi]");

  let list = [...db.orders];

  if (status) {
    list = list.filter((o) => o.status === status);
  }

  if (search) {
    list = list.filter((o) => o.orderNumber.toLowerCase().includes(search.toLowerCase()));
  }

  return NextResponse.json({
    data: list,
    meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: list.length } },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body.data || body;

    const newOrder: Order = {
      id: Date.now(),
      documentId: `ord-${Date.now()}`,
      orderNumber: `SG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: payload.customer,
      items: payload.items || [],
      subtotal: payload.subtotal || 0,
      shippingFee: payload.shippingFee || 0,
      discount: payload.discount || 0,
      tax: payload.tax || 0,
      total: payload.total || 0,
      status: "new",
      paymentStatus: payload.paymentStatus || "pending",
      paymentMethod: payload.paymentMethod || "cod",
      shippingAddress: payload.shippingAddress,
      notes: payload.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    saveDb();

    return NextResponse.json({ data: newOrder }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}
