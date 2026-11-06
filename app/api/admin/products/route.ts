import { NextResponse } from "next/server";
import { db, saveDb } from "@/lib/store-data";
import type { Product } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  let list = [...db.products];

  if (category) {
    list = list.filter((p) => p.category?.slug === category || p.category?.name.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }

  const total = list.length;
  const startIndex = (page - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    success: true,
    message: total === 0 ? "No products available" : "Products retrieved successfully",
    data: {
      products: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body.data || body;

    const prodName = payload.name || payload.productName || "";
    if (!prodName) {
      return NextResponse.json({ success: false, message: "Product name is required" }, { status: 400 });
    }

    const price = Number(payload.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ success: false, message: "Price must be greater than 0" }, { status: 400 });
    }

    const mrp = payload.mrp ? Number(payload.mrp) : price;
    const stock = payload.stock !== undefined ? Math.max(0, parseInt(String(payload.stock), 10) || 0) : 50;

    let cat = undefined;
    if (typeof payload.category === "number") {
      cat = db.categories.find((c) => c.id === payload.category);
    } else if (typeof payload.category === "string") {
      cat = db.categories.find(
        (c) => c.name.toLowerCase() === payload.category.toLowerCase() || c.slug === payload.category.toLowerCase()
      );
      if (!cat) {
        cat = {
          id: Date.now(),
          documentId: `cat-${Date.now()}`,
          name: payload.category,
          slug: payload.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          rank: db.categories.length + 1,
          description: null,
          image: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        };
        db.categories.push(cat);
      }
    }

    const currentCount = db.products.length + 1;
    const productId = payload.productId || `PROD${String(currentCount).padStart(3, "0")}`;
    const slug =
      payload.slug ||
      prodName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
      `prod-${Date.now()}`;
    const image = payload.imageUrl || payload.image || null;

    const newProd: Product = {
      id: Date.now(),
      documentId: `prod-${Date.now()}`,
      productId,
      productName: prodName,
      name: prodName,
      slug,
      shortDescription: payload.shortDescription || payload.description || null,
      description: payload.description || payload.shortDescription || null,
      category: cat,
      price,
      mrp,
      stock,
      image,
      imageUrl: image,
      isFeatured: Boolean(payload.isFeatured),
      isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
      availability: stock <= 0 ? "out-of-season" : "in-stock",
      rank: currentCount,
      thumbnail: image
        ? {
            id: Date.now(),
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : null,
      images: [],
      seoTitle: prodName,
      seoDescription: payload.description || null,
      seoKeywords: prodName,
      variants: [
        {
          id: Date.now() + 1,
          documentId: `var-${Date.now() + 1}`,
          name: "Standard Pack",
          sku: `${productId}-STD`,
          price,
          mrp,
          stock,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };

    db.products.unshift(newProd);
    saveDb();

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      data: { product: newProd },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
