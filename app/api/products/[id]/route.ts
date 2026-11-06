import { NextResponse } from "next/server";
import { db, saveDb, reloadDbIfChanged } from "@/lib/store-data";

function findProductIndex(idParam: string): number {
  const clean = decodeURIComponent(idParam || "").trim().toLowerCase();
  return db.products.findIndex((p) => {
    return (
      String(p.id).toLowerCase() === clean ||
      (p.productId && p.productId.toLowerCase() === clean) ||
      (p.slug && p.slug.toLowerCase() === clean) ||
      (p.documentId && p.documentId.toLowerCase() === clean) ||
      (p.name && p.name.toLowerCase() === clean)
    );
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  reloadDbIfChanged();
  const { id } = await context.params;
  const idx = findProductIndex(id);

  if (idx === -1) {
    return NextResponse.json({ success: false, error: { message: "Product not found" } }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: db.products[idx] });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    reloadDbIfChanged();
    const { id } = await context.params;
    const body = await request.json();
    const payload = body.data || body;

    const idx = findProductIndex(id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: { message: "Product not found" } }, { status: 404 });
    }

    const current = db.products[idx];

    // Category resolution
    let cat = current.category;
    if (payload.category !== undefined) {
      if (typeof payload.category === "number") {
        cat = db.categories.find((c) => c.id === payload.category) || current.category;
      } else if (typeof payload.category === "string" && payload.category.trim()) {
        const catName = payload.category.trim().toLowerCase();
        cat = db.categories.find(
          (c) => c.name.toLowerCase() === catName || c.slug.toLowerCase() === catName
        ) || current.category;
      } else if (payload.category && typeof payload.category === "object") {
        cat = payload.category;
      }
    }

    // Subcategory resolution
    let subcat = current.subcategory;
    if (payload.subcategory !== undefined) {
      if (typeof payload.subcategory === "number") {
        subcat = db.subcategories.find((sc) => sc.id === payload.subcategory);
      } else if (typeof payload.subcategory === "string" && payload.subcategory.trim()) {
        const subName = payload.subcategory.trim().toLowerCase();
        subcat = db.subcategories.find(
          (sc) => sc.name.toLowerCase() === subName || sc.slug.toLowerCase() === subName
        );
      } else if (payload.subcategory === null) {
        subcat = undefined;
      } else if (payload.subcategory && typeof payload.subcategory === "object") {
        subcat = payload.subcategory;
      }
    }

    const price = payload.price !== undefined ? Number(payload.price) : current.price;
    const mrp = payload.mrp !== undefined ? Number(payload.mrp) : (current.mrp || price);
    const stock = payload.stock !== undefined ? Math.max(0, parseInt(String(payload.stock), 10) || 0) : (current.stock ?? 50);
    const prodName = payload.name || payload.productName || current.name;
    const image = payload.image || payload.imageUrl || current.image || current.imageUrl;

    // Handle variants with preserved or newly assigned IDs
    let resolvedVariants = current.variants || [];
    if (Array.isArray(payload.variants) && payload.variants.length > 0) {
      resolvedVariants = payload.variants.map((v: any, vIdx: number) => {
        const vId = v.id || (current.variants?.[vIdx]?.id) || (Date.now() + vIdx + 1);
        return {
          id: vId,
          documentId: v.documentId || `var-${vId}`,
          name: v.name || "Standard Pack",
          sku: v.sku || null,
          price: Number(v.price) || price,
          mrp: Number(v.mrp) || mrp || price,
          stock: v.stock !== undefined ? Number(v.stock) : stock,
        };
      });
    } else if (resolvedVariants.length > 0) {
      resolvedVariants[0].price = price;
      resolvedVariants[0].mrp = mrp;
      resolvedVariants[0].stock = stock;
    } else {
      resolvedVariants = [
        {
          id: Date.now() + 1,
          documentId: `var-${Date.now() + 1}`,
          name: "Standard Pack",
          sku: null,
          price,
          mrp,
          stock,
        },
      ];
    }

    // Thumbnail sync
    let thumbnail = current.thumbnail;
    if (image) {
      thumbnail = {
        id: current.thumbnail?.id || Date.now(),
        name: prodName,
        url: image,
        formats: {},
        alternativeText: prodName,
        caption: null,
        width: 400,
        height: 400,
        hash: "",
        ext: ".jpg",
        mime: "image/jpeg",
        size: 50,
        previewUrl: null,
        provider: "local",
        provider_metadata: null,
        createdAt: current.thumbnail?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    db.products[idx] = {
      ...current,
      ...payload,
      name: prodName,
      productName: prodName,
      slug: payload.slug || current.slug,
      price,
      mrp,
      stock,
      image,
      imageUrl: image,
      thumbnail,
      category: cat,
      subcategory: subcat,
      variants: resolvedVariants,
      availability: stock <= 0 ? "out-of-season" : (payload.availability || current.availability || "in-stock"),
      isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : (current.isActive !== false),
      isFeatured: payload.isFeatured !== undefined ? Boolean(payload.isFeatured) : Boolean(current.isFeatured),
      updatedAt: new Date().toISOString(),
    };

    saveDb();

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: db.products[idx],
    });
  } catch (err: any) {
    console.error("PUT product error:", err);
    return NextResponse.json({ success: false, error: { message: err.message || "Failed to update product" } }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  reloadDbIfChanged();
  const { id } = await context.params;
  const idx = findProductIndex(id);

  if (idx === -1) {
    return NextResponse.json({ success: false, error: { message: "Product not found" } }, { status: 404 });
  }

  const deletedId = db.products[idx].productId || String(db.products[idx].id);
  db.products.splice(idx, 1);
  saveDb();

  return NextResponse.json({
    success: true,
    message: "Product deleted successfully",
    data: { productId: deletedId },
  });
}
