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

    let updatedVariant = null;

    for (const prod of db.products) {
      if (prod.variants) {
        const v = prod.variants.find((variant) => String(variant.id) === id);
        if (v) {
          if (payload.stock !== undefined) {
            v.stock = Number(payload.stock);
            // Sync product level stock
            prod.stock = prod.variants.reduce((acc, curr) => acc + (curr.stock || 0), 0);
            prod.availability = prod.stock > 0 ? "in-stock" : "out-of-season";
          }
          if (payload.price !== undefined) {
            v.price = Number(payload.price);
            if (prod.variants[0]?.id === v.id) prod.price = v.price;
          }
          if (payload.mrp !== undefined) {
            v.mrp = Number(payload.mrp);
            if (prod.variants[0]?.id === v.id) prod.mrp = v.mrp;
          }
          if (payload.name !== undefined) v.name = String(payload.name);
          if (payload.sku !== undefined) v.sku = payload.sku;
          updatedVariant = v;
          prod.updatedAt = new Date().toISOString();
          break;
        }
      }
    }

    if (!updatedVariant) {
      return NextResponse.json({ error: { message: "Variant not found" } }, { status: 404 });
    }

    saveDb();

    return NextResponse.json({ data: updatedVariant });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 400 });
  }
}
