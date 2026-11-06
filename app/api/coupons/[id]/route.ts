import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const payload = body.data || body;

    const idx = db.coupons.findIndex((c) => String(c.id) === id || c.code.toLowerCase() === id.toLowerCase());
    if (idx === -1) {
      return NextResponse.json({ error: { message: "Coupon not found" } }, { status: 404 });
    }

    db.coupons[idx] = {
      ...db.coupons[idx],
      ...payload,
      code: payload.code ? String(payload.code).toUpperCase() : db.coupons[idx].code,
      updatedAt: new Date().toISOString(),
    };

    saveDb();

    return NextResponse.json({ data: db.coupons[idx] });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  db.coupons = db.coupons.filter((c) => String(c.id) !== id);
  saveDb();
  return NextResponse.json({ data: { message: "Coupon deleted" } });
}
