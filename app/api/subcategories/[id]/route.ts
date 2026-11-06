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

    const idx = db.subcategories.findIndex((sc) => String(sc.id) === id);
    if (idx === -1) {
      return NextResponse.json({ error: { message: "Subcategory not found" } }, { status: 404 });
    }

    const current = db.subcategories[idx];
    const parentCat = payload.category !== undefined
      ? db.categories.find((c) => c.id === payload.category)
      : current.category;

    db.subcategories[idx] = {
      ...current,
      ...payload,
      category: parentCat,
      updatedAt: new Date().toISOString(),
    };

    saveDb();

    return NextResponse.json({ data: db.subcategories[idx] });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  db.subcategories = db.subcategories.filter((sc) => String(sc.id) !== id);
  saveDb();
  return NextResponse.json({ data: { message: "Subcategory deleted" } });
}
