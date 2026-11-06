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

    const idx = db.categories.findIndex((c) => String(c.id) === id);
    if (idx === -1) {
      return NextResponse.json({ error: { message: "Category not found" } }, { status: 404 });
    }

    db.categories[idx] = {
      ...db.categories[idx],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    saveDb();

    return NextResponse.json({ data: db.categories[idx] });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  db.categories = db.categories.filter((c) => String(c.id) !== id);
  saveDb();
  return NextResponse.json({ data: { message: "Category deleted" } });
}
