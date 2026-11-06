import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";
import type { GalleryItem } from "@/lib/types";

export async function GET() {
  return NextResponse.json({
    data: db.gallery,
    meta: { pagination: { page: 1, pageSize: 20, pageCount: 1, total: db.gallery.length } },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body.data || body;

    const newItem: GalleryItem = {
      id: Date.now(),
      documentId: `gal-${Date.now()}`,
      title: String(payload.title || ""),
      image: null,
      category: String(payload.category || "General"),
      rank: Number(payload.rank || db.gallery.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };

    db.gallery.push(newItem);
    saveDb();

    return NextResponse.json({ data: newItem }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}
