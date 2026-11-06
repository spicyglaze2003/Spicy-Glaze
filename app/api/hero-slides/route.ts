import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";
import type { HeroSlide } from "@/lib/types";

export async function GET() {
  return NextResponse.json({
    data: db.heroSlides,
    meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: db.heroSlides.length } },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body.data || body;

    const newSlide: HeroSlide = {
      id: Date.now(),
      documentId: `slide-${Date.now()}`,
      title: String(payload.title || ""),
      subtitle: String(payload.subtitle || ""),
      image: null,
      ctaText: String(payload.ctaText || "Explore Products"),
      ctaLink: String(payload.ctaLink || "/products"),
      rank: Number(payload.rank || db.heroSlides.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };

    db.heroSlides.push(newSlide);
    saveDb();

    return NextResponse.json({ data: newSlide }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}
