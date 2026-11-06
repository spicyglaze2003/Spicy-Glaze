import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";
import type { Testimonial } from "@/lib/types";

export async function GET() {
  return NextResponse.json({
    data: db.testimonials,
    meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: db.testimonials.length } },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body.data || body;

    const newItem: Testimonial = {
      id: Date.now(),
      documentId: `test-${Date.now()}`,
      name: String(payload.name || ""),
      designation: String(payload.designation || ""),
      quote: String(payload.quote || ""),
      image: null,
      rank: Number(payload.rank || db.testimonials.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };

    db.testimonials.push(newItem);
    saveDb();

    return NextResponse.json({ data: newItem }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}
