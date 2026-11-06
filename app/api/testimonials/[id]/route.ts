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

    const idx = db.testimonials.findIndex((t) => String(t.id) === id);
    if (idx === -1) {
      return NextResponse.json({ error: { message: "Testimonial not found" } }, { status: 404 });
    }

    db.testimonials[idx] = {
      ...db.testimonials[idx],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    saveDb();

    return NextResponse.json({ data: db.testimonials[idx] });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  db.testimonials = db.testimonials.filter((t) => String(t.id) !== id);
  saveDb();
  return NextResponse.json({ data: { message: "Testimonial deleted" } });
}
