import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";
import type { Category } from "@/lib/types";

export async function GET() {
  const categories = db.categories.map((c) => ({
    ...c,
    subcategories: db.subcategories.filter((sc) => sc.category?.id === c.id),
  }));

  return NextResponse.json({
    data: categories,
    meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: categories.length } },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body.data || body;

    const newCategory: Category = {
      id: Date.now(),
      documentId: `cat-${Date.now()}`,
      name: payload.name,
      slug: payload.slug,
      description: payload.description || null,
      image: null,
      rank: payload.rank || db.categories.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };

    db.categories.push(newCategory);
    saveDb();

    return NextResponse.json({ data: newCategory }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}
