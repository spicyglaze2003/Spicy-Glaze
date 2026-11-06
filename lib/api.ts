import { api } from "./axios";
import type {
  StrapiResponse,
  StrapiSingleResponse,
  Category,
  Subcategory,
  Product,
  HeroSlide,
  Testimonial,
  GalleryItem,
  SiteSetting,
  ContactSubmission,
} from "./types";
import {
  demoCategories,
  demoSubcategories,
  demoProducts,
  demoHeroSlides,
  demoTestimonials,
  demoGallery,
  demoSiteSetting,
} from "./demo-data";

export async function getCategories(): Promise<StrapiResponse<Category[]>> {
  if (typeof window === "undefined") {
    try {
      const { db } = await import("./store-data");
      const categories = db.categories.map((c) => ({
        ...c,
        subcategories: db.subcategories.filter((sc) => sc.category?.id === c.id),
      }));
      return { data: categories, meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: categories.length } } };
    } catch {}
  }
  try {
    const { data } = await api.get("/categories?populate=*&sort=rank:asc");
    return data;
  } catch {
    return { data: demoCategories, meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: demoCategories.length } } };
  }
}

export async function getCategory(
  slug: string
): Promise<StrapiSingleResponse<Category>> {
  if (typeof window === "undefined") {
    try {
      const { db } = await import("./store-data");
      const found = db.categories.find(
        (c) => c.slug === slug || c.slug === slug.toLowerCase() || c.name.toLowerCase() === slug.toLowerCase()
      );
      if (found) return { data: found };
    } catch {}
  }
  try {
    const { data } = await api.get(
      `/categories?filters[slug][$eq]=${slug}&populate=*`
    );
    const first = data.data[0] as Category | undefined;
    return { data: first ?? (null as unknown as Category) };
  } catch {
    const found = demoCategories.find((c) => c.slug === slug);
    return { data: found ?? demoCategories[0] };
  }
}

export async function getSubcategories(): Promise<
  StrapiResponse<Subcategory[]>
> {
  if (typeof window === "undefined") {
    try {
      const { db } = await import("./store-data");
      return { data: db.subcategories, meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: db.subcategories.length } } };
    } catch {}
  }
  try {
    const { data } = await api.get("/subcategories?populate=*&sort=rank:asc");
    return data;
  } catch {
    return { data: demoSubcategories, meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: demoSubcategories.length } } };
  }
}

export async function getProducts(params?: {
  category?: string;
  subcategory?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<StrapiResponse<Product[]>> {
  // Server-side direct DB lookup to prevent SSR port mismatch & network deadlocks
  if (typeof window === "undefined") {
    try {
      const { db, reloadDbIfChanged } = await import("./store-data");
      reloadDbIfChanged();
      let list = [...db.products];

      if (params?.category) {
        const targetCat = params.category.toLowerCase();
        list = list.filter((p) => {
          const catAny = p.category as any;
          return (
            p.category?.slug?.toLowerCase() === targetCat ||
            p.category?.name?.toLowerCase() === targetCat ||
            (typeof catAny === "string" && (
              catAny.toLowerCase() === targetCat ||
              catAny.toLowerCase().replace(/[^a-z0-9]+/g, "-") === targetCat
            ))
          );
        });
      }
      if (params?.subcategory) {
        const targetSub = params.subcategory.toLowerCase();
        list = list.filter((p) => {
          const subAny = p.subcategory as any;
          return (
            p.subcategory?.slug?.toLowerCase() === targetSub ||
            p.subcategory?.name?.toLowerCase() === targetSub ||
            (typeof subAny === "string" && (
              subAny.toLowerCase() === targetSub ||
              subAny.toLowerCase().replace(/[^a-z0-9]+/g, "-") === targetSub
            ))
          );
        });
      }
      if (params?.featured) {
        list = list.filter((p) => p.isFeatured);
      }

      list = list.filter((p) => p.isActive !== false);

      const total = list.length;
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 100;
      const startIndex = (page - 1) * pageSize;
      const paginated = list.slice(startIndex, startIndex + pageSize);

      return {
        data: paginated,
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize) || 1,
            total,
          },
        },
      };
    } catch (err) {
      console.warn("Direct store-data lookup in getProducts failed:", err);
    }
  }

  try {
    const searchParams = new URLSearchParams();
    searchParams.append("populate[0]", "category");
    searchParams.append("populate[1]", "subcategory");
    searchParams.append("populate[2]", "thumbnail");
    searchParams.append("populate[3]", "images");
    searchParams.append("populate[4]", "variants");
    searchParams.set("sort", "rank:asc");
    searchParams.set("filters[isActive][$eq]", "true");

    if (params?.category) {
      searchParams.set("filters[category][slug][$eq]", params.category);
    }
    if (params?.subcategory) {
      searchParams.set("filters[subcategory][slug][$eq]", params.subcategory);
    }
    if (params?.featured) {
      searchParams.set("filters[isFeatured][$eq]", "true");
    }
    if (params?.page) {
      searchParams.set("pagination[page]", String(params.page));
    }
    if (params?.pageSize) {
      searchParams.set("pagination[pageSize]", String(params.pageSize));
    }

    const { data } = await api.get(`/products?${searchParams.toString()}`);
    return data;
  } catch {
    return {
      data: [],
      meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } },
    };
  }
}

export async function getProduct(
  slug: string
): Promise<StrapiSingleResponse<Product>> {
  const decoded = decodeURIComponent(slug || "").trim().toLowerCase();
  const slugVariations = [
    decoded,
    decoded.replace(/-/g, " "),
    decoded.replace(/\s+/g, "-"),
  ];

  // Server-side direct DB lookup to prevent SSR port mismatch & network deadlocks
  if (typeof window === "undefined") {
    try {
      const { db, reloadDbIfChanged } = await import("./store-data");
      reloadDbIfChanged();
      const found = db.products.find((p) => {
        const pSlug = (p.slug || "").toLowerCase();
        const pId = String(p.id || "").toLowerCase();
        const pProdId = (p.productId || "").toLowerCase();
        const pName = (p.name || p.productName || "").toLowerCase();
        const pDocId = (p.documentId || "").toLowerCase();

        return (
          slugVariations.includes(pSlug) ||
          slugVariations.includes(pProdId) ||
          slugVariations.includes(pId) ||
          slugVariations.includes(pName) ||
          slugVariations.includes(pDocId) ||
          pSlug === decoded ||
          pId === decoded ||
          pProdId === decoded
        );
      });

      if (found) {
        return { data: found };
      }
    } catch (err) {
      console.warn("Direct store-data lookup failed in getProduct:", err);
    }
  }

  // Client-side API Call (or fallback)
  try {
    const { data } = await api.get(
      `/products?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[0]=category&populate[1]=thumbnail&populate[2]=images&populate[3]=variants`
    );
    const first = data.data?.[0] as Product | undefined;
    if (first) return { data: first };
  } catch {
    // API request failed
  }

  // Fallback to demoProducts
  const demoFound = demoProducts.find((p) => {
    const pSlug = (p.slug || "").toLowerCase();
    const pId = String(p.id || "").toLowerCase();
    const pProdId = (p.productId || "").toLowerCase();
    const pName = (p.name || p.productName || "").toLowerCase();
    return (
      slugVariations.includes(pSlug) ||
      slugVariations.includes(pProdId) ||
      slugVariations.includes(pId) ||
      slugVariations.includes(pName)
    );
  });

  return { data: demoFound ?? (null as unknown as Product) };
}

export async function getFeaturedProducts(): Promise<
  StrapiResponse<Product[]>
> {
  if (typeof window === "undefined") {
    try {
      const { db } = await import("./store-data");
      const list = db.products.filter((p) => p.isFeatured && p.isActive !== false);
      return {
        data: list,
        meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: list.length } },
      };
    } catch {
      // Fallback to API
    }
  }

  try {
    const { data } = await api.get(
      "/products?filters[isFeatured][$eq]=true&filters[isActive][$eq]=true&populate[0]=category&populate[1]=thumbnail&populate[2]=images&populate[3]=variants&sort=rank:asc"
    );
    return data;
  } catch {
    return { data: [], meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } } };
  }
}

export async function getHeroSlides(): Promise<StrapiResponse<HeroSlide[]>> {
  if (typeof window === "undefined") {
    try {
      const { db } = await import("./store-data");
      return { data: db.heroSlides, meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: db.heroSlides.length } } };
    } catch {}
  }
  try {
    const { data } = await api.get("/hero-slides?populate=*&sort=rank:asc");
    return data;
  } catch {
    return { data: demoHeroSlides, meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: demoHeroSlides.length } } };
  }
}

export async function getTestimonials(): Promise<
  StrapiResponse<Testimonial[]>
> {
  if (typeof window === "undefined") {
    try {
      const { db } = await import("./store-data");
      return { data: db.testimonials, meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: db.testimonials.length } } };
    } catch {}
  }
  try {
    const { data } = await api.get("/testimonials?populate=*&sort=rank:asc");
    return data;
  } catch {
    return { data: demoTestimonials, meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: demoTestimonials.length } } };
  }
}

export async function getGallery(): Promise<StrapiResponse<GalleryItem[]>> {
  if (typeof window === "undefined") {
    try {
      const { db } = await import("./store-data");
      return { data: db.gallery, meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: db.gallery.length } } };
    } catch {}
  }
  try {
    const { data } = await api.get("/gallery-items?populate=*&sort=rank:asc");
    return data;
  } catch {
    return { data: demoGallery, meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: demoGallery.length } } };
  }
}

export async function getSiteSettings(): Promise<
  StrapiSingleResponse<SiteSetting>
> {
  if (typeof window === "undefined") {
    try {
      const { db } = await import("./store-data");
      return { data: db.siteSetting };
    } catch {}
  }
  try {
    const { data } = await api.get("/site-config?populate=*");
    return data;
  } catch {
    return { data: demoSiteSetting };
  }
}

export async function submitContactForm(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ data: ContactSubmission }> {
  try {
    const { data } = await api.post("/contact-submissions", {
      data: { ...payload, status: "new" },
    });
    return data;
  } catch {
    return {
      data: {
        id: Date.now(),
        documentId: `sub-${Date.now()}`,
        ...payload,
        status: "new",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }
}
