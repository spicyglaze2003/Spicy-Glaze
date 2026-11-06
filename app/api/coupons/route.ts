import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";
import type { Coupon } from "@/lib/admin-types";

export async function GET() {
  return NextResponse.json({
    data: db.coupons,
    meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: db.coupons.length } },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body.data || body;

    const newCoupon: Coupon = {
      id: Date.now(),
      documentId: `cp-${Date.now()}`,
      code: String(payload.code).toUpperCase(),
      type: payload.type || "percentage",
      discount: Number(payload.discount || 10),
      minimumOrder: Number(payload.minimumOrder || 499),
      maximumDiscount: payload.maximumDiscount ? Number(payload.maximumDiscount) : null,
      usageLimit: payload.usageLimit ? Number(payload.usageLimit) : null,
      usedCount: 0,
      expiresAt: payload.expiresAt || null,
      isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.coupons.unshift(newCoupon);
    saveDb();

    return NextResponse.json({ data: newCoupon }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}
