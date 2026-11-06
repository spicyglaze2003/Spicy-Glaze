import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const stock = parseInt(String(body.stock), 10);

    if (isNaN(stock) || stock < 0) {
      return NextResponse.json(
        { success: false, message: "Stock must be a non-negative integer" },
        { status: 400 }
      );
    }

    let idx = db.products.findIndex(
      (p) => String(p.id) === id || p.productId === id || p.slug === id
    );

    let targetVariantId: string | null = null;
    if (idx === -1) {
      idx = db.products.findIndex(
        (p) => p.variants && p.variants.some((v) => String(v.id) === id)
      );
      if (idx !== -1) {
        targetVariantId = id;
      }
    }

    if (idx === -1) {
      return NextResponse.json(
        { success: false, message: "Product or variant not found" },
        { status: 404 }
      );
    }

    const product = db.products[idx];
    const variants = product.variants;
    if (targetVariantId && variants) {
      const v = variants.find((item) => String(item.id) === targetVariantId);
      if (v) v.stock = stock;
      product.stock = variants.reduce((acc, curr) => acc + (curr.stock || 0), 0);
    } else {
      product.stock = stock;
      if (variants && variants.length > 0) {
        variants[0].stock = stock;
      }
    }
    product.availability = (product.stock ?? 0) > 0 ? "in-stock" : "out-of-season";
    product.updatedAt = new Date().toISOString();

    saveDb();

    return NextResponse.json({
      success: true,
      message: "Stock updated successfully",
      data: {
        productId: product.productId || String(product.id),
        stock: product.stock,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update stock" },
      { status: 500 }
    );
  }
}
