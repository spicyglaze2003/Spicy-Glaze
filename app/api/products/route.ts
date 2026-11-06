import { NextResponse } from "next/server";
import { db, saveDb, reloadDbIfChanged } from "@/lib/store-data";
import type { Product } from "@/lib/types";

export async function GET(request: Request) {
  reloadDbIfChanged();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("filters[category][slug][$eq]");
  const search = searchParams.get("filters[name][$containsi]");
  const featured = searchParams.get("filters[isFeatured][$eq]");
  const active = searchParams.get("filters[isActive][$eq]");
  const slug = searchParams.get("filters[slug][$eq]");
  const page = parseInt(searchParams.get("pagination[page]") || "1", 10);
  const pageSize = parseInt(searchParams.get("pagination[pageSize]") || "100", 10);

  let list = [...db.products];

  if (slug) {
    const clean = decodeURIComponent(slug).trim().toLowerCase();
    const single = list.find((p) => {
      const pSlug = (p.slug || "").toLowerCase();
      const pProdId = (p.productId || "").toLowerCase();
      const pId = String(p.id || "").toLowerCase();
      const pName = (p.name || p.productName || "").toLowerCase();
      const pDoc = (p.documentId || "").toLowerCase();

      return (
        pSlug === clean ||
        pSlug === clean.replace(/\s+/g, "-") ||
        pSlug === clean.replace(/-/g, " ") ||
        pProdId === clean ||
        pId === clean ||
        pName === clean ||
        pDoc === clean
      );
    });

    return NextResponse.json({
      data: single ? [single] : [],
      meta: { pagination: { page: 1, pageSize: 1, pageCount: single ? 1 : 0, total: single ? 1 : 0 } },
    });
  }

  if (category) {
    const targetCat = decodeURIComponent(category).trim().toLowerCase();
    list = list.filter((p) => {
      const catAny = p.category as any;
      const slugMatch = p.category?.slug?.toLowerCase() === targetCat;
      const nameMatch = p.category?.name?.toLowerCase() === targetCat;
      const strMatch =
        typeof catAny === "string" &&
        (catAny.toLowerCase() === targetCat ||
          catAny.toLowerCase().replace(/[^a-z0-9]+/g, "-") === targetCat);
      return slugMatch || nameMatch || strMatch;
    });
  }

  if (search) {
    const term = search.toLowerCase();
    list = list.filter((p) =>
      (p.name || p.productName || "").toLowerCase().includes(term) ||
      (p.description || "").toLowerCase().includes(term) ||
      (p.shortDescription || "").toLowerCase().includes(term)
    );
  }

  if (featured === "true") {
    list = list.filter((p) => p.isFeatured);
  }

  if (active === "true") {
    list = list.filter((p) => p.isActive !== false);
  } else if (active === "false") {
    list = list.filter((p) => p.isActive === false);
  }

  const total = list.length;
  const startIndex = (page - 1) * pageSize;
  const paginated = list.slice(startIndex, startIndex + pageSize);

  return NextResponse.json({
    data: paginated,
    meta: {
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize) || 1,
        total,
      },
    },
  });
}

export async function POST(request: Request) {
  try {
    reloadDbIfChanged();
    const body = await request.json();
    const payload = body.data || body;

    const prodName = payload.name || payload.productName || "";
    if (!prodName) {
      return NextResponse.json({ error: { message: "Product name is required" } }, { status: 400 });
    }

    const price = Number(payload.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: { message: "Price must be greater than 0" } }, { status: 400 });
    }

    const mrp = payload.mrp ? Number(payload.mrp) : price;
    const stock = payload.stock !== undefined ? Math.max(0, parseInt(String(payload.stock), 10) || 0) : 50;

    // Handle category as string or id
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

    const subcat = typeof payload.subcategory === "number"
      ? db.subcategories.find((sc) => sc.id === payload.subcategory)
      : undefined;

    const slug =
      payload.slug ||
      prodName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
      `prod-${Date.now()}`;

    const productId = payload.productId || `PROD${String(db.products.length + 1).padStart(3, "0")}`;
    const image = payload.image || payload.imageUrl || null;

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
      subcategory: subcat,
      price,
      mrp,
      stock,
      image,
      imageUrl: image,
      isFeatured: Boolean(payload.isFeatured),
      isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
      availability: stock <= 0 ? "out-of-season" : payload.availability || "in-stock",
      rank: payload.rank || 1,
      thumbnail: image ? {
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
      } : null,
      images: [],
      seoTitle: payload.seoTitle || prodName,
      seoDescription: payload.seoDescription || payload.shortDescription || null,
      seoKeywords: payload.seoKeywords || null,
      variants: Array.isArray(payload.variants) && payload.variants.length > 0
        ? payload.variants.map((v: any, idx: number) => ({
            id: Date.now() + idx + 1,
            documentId: `var-${Date.now() + idx + 1}`,
            name: v.name || "Standard Pack",
            sku: v.sku || null,
            price: Number(v.price) || price,
            mrp: Number(v.mrp) || mrp,
            stock: v.stock !== undefined ? parseInt(String(v.stock), 10) : stock,
          }))
        : [
            {
              id: Date.now() + 1,
              documentId: `var-${Date.now() + 1}`,
              name: "Standard Pack",
              sku: null,
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

    return NextResponse.json({ success: true, message: "Product created successfully", data: newProd }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 400 });
  }
}
