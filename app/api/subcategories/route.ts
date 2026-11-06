import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";
import type { Subcategory } from "@/lib/types";

export async function GET() {
  return NextResponse.json({
    data: db.subcategories,
    meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: db.subcategories.length } },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body.data || body;
    const parentCat = db.categories.find((c) => c.id === payload.category);

    const newSub: Subcategory = {
      id: Date.now(),
      documentId: `sub-${Date.now()}`,
      name: payload.name,
      slug: payload.slug,
      description: payload.description || null,
      image: null,
      rank: payload.rank || db.subcategories.length + 1,
      category: parentCat,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };

    db.subcategories.push(newSub);
    saveDb();

    return NextResponse.json({ data: newSub }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}
