import { api } from "./axios";
import type {
  StrapiResponse,
  StrapiSingleResponse,
  Product,
  Category,
  Subcategory,
  HeroSlide,
  Testimonial,
  GalleryItem,
  SiteSetting,
  ContactSubmission,
} from "./types";
import type {
  ProductFormData,
  Order,
  OrderStatus,
  Customer,
  Coupon,
  DashboardStats,
  AdminUser,
  ActivityLog,
  StockAdjustment,
} from "./admin-types";
import {
  demoProducts,
  demoCategories,
  demoSubcategories,
  demoHeroSlides,
  demoTestimonials,
  demoGallery,
  demoSiteSetting,
} from "./demo-data";

let localCategories: Category[] = [...demoCategories];
let localSubcategories: Subcategory[] = [...demoSubcategories];
let localHeroSlides: HeroSlide[] = [...demoHeroSlides];
let localTestimonials: Testimonial[] = [...demoTestimonials];
let localGallery: GalleryItem[] = [...demoGallery];
let localSiteSetting: SiteSetting = { ...demoSiteSetting };

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const res = await api.get("/admin/dashboard");
    const d = res.data?.data;
    if (d) {
      return {
        totalRevenue: d.totalRevenue || 0,
        totalOrders: d.totalOrders || 0,
        totalProducts: d.totalProducts || 0,
        activeProducts: d.activeProducts || 0,
        outOfStockProducts: d.outOfStockProducts || 0,
        lowStockProducts: d.lowStockProducts || 0,
        todaySales: d.todaySales || 0,
        monthlySales: d.totalRevenue || 0,
        pendingOrders: d.pendingOrders || 0,
        completedOrders: d.completedOrders || 0,
        cancelledOrders: 0,
        totalCustomers: d.totalOrders || 0,
        newCustomersToday: 0,
        contactEnquiries: 0,
        recentOrders: d.recentOrders || [],
        topProducts: d.topProducts || [],
        revenueByDay: [],
        inventoryAlerts: [],
        recentActivity: [],
      };
    }
  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }

  return {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    lowStockProducts: 0,
    todaySales: 0,
    monthlySales: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalCustomers: 0,
    newCustomersToday: 0,
    contactEnquiries: 0,
    recentOrders: [],
    topProducts: [],
    revenueByDay: [],
    inventoryAlerts: [],
    recentActivity: [],
  };
}


// ─── Products (Admin) ───────────────────────────────────────────────────

export async function getAdminProducts(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  status?: string;
  sort?: string;
}): Promise<StrapiResponse<Product[]>> {
  try {
    const sp = new URLSearchParams();
    sp.append("populate[0]", "category");
    sp.append("populate[1]", "subcategory");
    sp.append("populate[2]", "thumbnail");
    sp.append("populate[3]", "images");
    sp.append("populate[4]", "variants");
    sp.set("sort", params?.sort || "createdAt:desc");

    if (params?.search) {
      sp.set("filters[name][$containsi]", params.search);
    }
    if (params?.category) {
      sp.set("filters[category][slug][$eq]", params.category);
    }
    if (params?.status === "active") {
      sp.set("filters[isActive][$eq]", "true");
    } else if (params?.status === "inactive") {
      sp.set("filters[isActive][$eq]", "false");
    } else if (params?.status === "featured") {
      sp.set("filters[isFeatured][$eq]", "true");
    }
    sp.set("pagination[page]", String(params?.page || 1));
    sp.set("pagination[pageSize]", String(params?.pageSize || 25));

    const { data } = await api.get(`/products?${sp.toString()}`);
    return data;
  } catch {
    return {
      data: [],
      meta: { pagination: { page: 1, pageSize: params?.pageSize || 25, pageCount: 0, total: 0 } },
    };
  }
}

export async function getAdminProduct(id: string): Promise<StrapiSingleResponse<Product>> {
  const { data } = await api.get(
    `/products/${id}?populate[0]=category&populate[1]=subcategory&populate[2]=thumbnail&populate[3]=images&populate[4]=variants`
  );
  return data;
}

export async function createProduct(payload: ProductFormData): Promise<{ data: Product }> {
  const { data } = await api.post("/products", { data: payload });
  return data;
}

export async function importProductsFromExcel(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/admin/products/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function importProductsJson(products: any[]): Promise<any> {
  const { data } = await api.post("/admin/products/import", { products });
  return data;
}

export async function updateProduct(id: string, payload: Partial<ProductFormData>): Promise<{ data: Product }> {
  const { data } = await api.put(`/products/${id}`, { data: payload });
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function toggleProductFeatured(id: string, isFeatured: boolean): Promise<{ data: Product }> {
  return updateProduct(id, { isFeatured });
}

export async function toggleProductActive(id: string, isActive: boolean): Promise<{ data: Product }> {
  return updateProduct(id, { isActive });
}

// ─── Stock ──────────────────────────────────────────────────────────────

export async function updateStock(variantId: string, newStock: number): Promise<{ data: unknown }> {
  try {
    const { data } = await api.patch(`/admin/products/${variantId}/stock`, {
      stock: newStock,
    });
    return data;
  } catch {
    const { data } = await api.put(`/product-variants/${variantId}`, {
      data: { stock: newStock },
    });
    return data;
  }
}

// ─── Categories (Admin) ─────────────────────────────────────────────────

export async function getAdminCategories(): Promise<StrapiResponse<Category[]>> {
  try {
    const { data } = await api.get("/categories?populate=*&sort=rank:asc&pagination[pageSize]=100");
    return data;
  } catch {
    return { data: localCategories, meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: localCategories.length } } };
  }
}

export async function createCategory(payload: {
  name: string;
  slug: string;
  description?: string | null;
  rank?: number;
}): Promise<{ data: Category }> {
  try {
    const { data } = await api.post("/categories", { data: payload });
    return data;
  } catch {
    const newCat: Category = {
      id: Date.now(),
      documentId: `cat-${Date.now()}`,
      name: payload.name,
      slug: payload.slug,
      description: payload.description || null,
      image: null,
      rank: payload.rank || localCategories.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };
    localCategories.push(newCat);
    return { data: newCat };
  }
}

export async function updateCategory(id: string, payload: Record<string, unknown>): Promise<{ data: Category }> {
  try {
    const { data } = await api.put(`/categories/${id}`, { data: payload });
    return data;
  } catch {
    const idx = localCategories.findIndex((c) => String(c.id) === id);
    if (idx !== -1) {
      localCategories[idx] = { ...localCategories[idx], ...payload } as Category;
      return { data: localCategories[idx] };
    }
    return { data: localCategories[0] };
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await api.delete(`/categories/${id}`);
  } catch {
    localCategories = localCategories.filter((c) => String(c.id) !== id);
  }
}

// ─── Subcategories (Admin) ──────────────────────────────────────────────

export async function getAdminSubcategories(): Promise<StrapiResponse<Subcategory[]>> {
  try {
    const { data } = await api.get("/subcategories?populate=*&sort=rank:asc&pagination[pageSize]=100");
    return data;
  } catch {
    return { data: localSubcategories, meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: localSubcategories.length } } };
  }
}

export async function createSubcategory(payload: {
  name: string;
  slug: string;
  description?: string | null;
  category: number;
  rank?: number;
}): Promise<{ data: Subcategory }> {
  try {
    const { data } = await api.post("/subcategories", { data: payload });
    return data;
  } catch {
    const parentCat = localCategories.find((c) => c.id === payload.category);
    const newSub: Subcategory = {
      id: Date.now(),
      documentId: `sub-${Date.now()}`,
      name: payload.name,
      slug: payload.slug,
      description: payload.description || null,
      image: null,
      rank: payload.rank || localSubcategories.length + 1,
      category: parentCat,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };
    localSubcategories.push(newSub);
    return { data: newSub };
  }
}

export async function updateSubcategory(id: string, payload: Record<string, unknown>): Promise<{ data: Subcategory }> {
  try {
    const { data } = await api.put(`/subcategories/${id}`, { data: payload });
    return data;
  } catch {
    const idx = localSubcategories.findIndex((sc) => String(sc.id) === id);
    if (idx !== -1) {
      localSubcategories[idx] = { ...localSubcategories[idx], ...payload } as Subcategory;
      return { data: localSubcategories[idx] };
    }
    return { data: localSubcategories[0] };
  }
}

export async function deleteSubcategory(id: string): Promise<void> {
  try {
    await api.delete(`/subcategories/${id}`);
  } catch {
    localSubcategories = localSubcategories.filter((sc) => String(sc.id) !== id);
  }
}

// ─── Orders (Admin) ─────────────────────────────────────────────────────

export async function getAdminOrders(params?: {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  search?: string;
}): Promise<StrapiResponse<Order[]>> {
  try {
    const sp = new URLSearchParams();
    if (params?.status && (params.status as string) !== "all") {
      sp.set("orderStatus", params.status);
    }
    if (params?.search) {
      sp.set("search", params.search);
    }
    sp.set("page", String(params?.page || 1));
    sp.set("limit", String(params?.pageSize || 50));

    const { data } = await api.get(`/admin/orders?${sp.toString()}`);
    const orders = data.data?.orders || data.data || [];
    const pagination = data.data?.pagination || { page: 1, limit: 50, total: orders.length, totalPages: 1 };
    return {
      data: orders,
      meta: {
        pagination: {
          page: pagination.page,
          pageSize: pagination.limit,
          pageCount: pagination.totalPages,
          total: pagination.total,
        },
      },
    };
  } catch {
    return { data: [], meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 0 } } };
  }
}

export async function updateOrderPaymentAndStatus(
  id: string,
  payload: {
    orderStatus?: OrderStatus | string;
    paymentStatus?: "PAID" | "PENDING" | "FAILED" | "REFUNDED" | string;
    paymentMethod?: string;
  }
): Promise<{ data: Order }> {
  try {
    const { data } = await api.patch(`/admin/orders/${id}/status`, payload);
    return data;
  } catch {
    const { data } = await api.put(`/orders/${id}`, { data: payload });
    return data;
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<{ data: Order }> {
  return updateOrderPaymentAndStatus(id, { orderStatus: status });
}

// ─── Customers & CRM ──────────────────────────────────────────────────
// (See Customer CRM section at bottom for complete methods)


// ─── Coupons ────────────────────────────────────────────────────────────

export async function getAdminCoupons(): Promise<StrapiResponse<Coupon[]>> {
  try {
    const { data } = await api.get("/coupons?populate=*&sort=createdAt:desc");
    return data;
  } catch {
    return { data: [], meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 0 } } };
  }
}

export async function createCoupon(payload: Record<string, unknown>): Promise<{ data: Coupon }> {
  try {
    const { data } = await api.post("/coupons", { data: payload });
    return data;
  } catch {
    return { data: payload as unknown as Coupon };
  }
}

export async function updateCoupon(id: string, payload: Record<string, unknown>): Promise<{ data: Coupon }> {
  try {
    const { data } = await api.put(`/coupons/${id}`, { data: payload });
    return data;
  } catch {
    return { data: payload as unknown as Coupon };
  }
}

export async function deleteCoupon(id: string): Promise<void> {
  try {
    await api.delete(`/coupons/${id}`);
  } catch {}
}

// ─── Hero Slides (Admin) ────────────────────────────────────────────────

export async function getAdminHeroSlides(): Promise<StrapiResponse<HeroSlide[]>> {
  try {
    const { data } = await api.get("/hero-slides?populate=*&sort=rank:asc");
    return data;
  } catch {
    return { data: localHeroSlides, meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: localHeroSlides.length } } };
  }
}

export async function createHeroSlide(payload: Record<string, unknown>): Promise<{ data: HeroSlide }> {
  try {
    const { data } = await api.post("/hero-slides", { data: payload });
    return data;
  } catch {
    const newSlide: HeroSlide = {
      id: Date.now(),
      documentId: `slide-${Date.now()}`,
      title: String(payload.title || ""),
      subtitle: String(payload.subtitle || ""),
      image: null,
      ctaText: String(payload.ctaText || "Explore Products"),
      ctaLink: String(payload.ctaLink || "/products"),
      rank: Number(payload.rank || 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };
    localHeroSlides.push(newSlide);
    return { data: newSlide };
  }
}

export async function updateHeroSlide(id: string, payload: Record<string, unknown>): Promise<{ data: HeroSlide }> {
  try {
    const { data } = await api.put(`/hero-slides/${id}`, { data: payload });
    return data;
  } catch {
    const idx = localHeroSlides.findIndex((s) => String(s.id) === id);
    if (idx !== -1) {
      localHeroSlides[idx] = { ...localHeroSlides[idx], ...payload };
      return { data: localHeroSlides[idx] };
    }
    return { data: localHeroSlides[0] };
  }
}

export async function deleteHeroSlide(id: string): Promise<void> {
  try {
    await api.delete(`/hero-slides/${id}`);
  } catch {
    localHeroSlides = localHeroSlides.filter((s) => String(s.id) !== id);
  }
}

// ─── Testimonials (Admin) ───────────────────────────────────────────────

export async function getAdminTestimonials(): Promise<StrapiResponse<Testimonial[]>> {
  try {
    const { data } = await api.get("/testimonials?populate=*&sort=rank:asc");
    return data;
  } catch {
    return { data: localTestimonials, meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: localTestimonials.length } } };
  }
}

export async function createTestimonial(payload: Record<string, unknown>): Promise<{ data: Testimonial }> {
  try {
    const { data } = await api.post("/testimonials", { data: payload });
    return data;
  } catch {
    const newItem: Testimonial = {
      id: Date.now(),
      documentId: `test-${Date.now()}`,
      name: String(payload.name || ""),
      designation: String(payload.designation || ""),
      quote: String(payload.quote || ""),
      image: null,
      rank: Number(payload.rank || 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };
    localTestimonials.push(newItem);
    return { data: newItem };
  }
}

export async function updateTestimonial(id: string, payload: Record<string, unknown>): Promise<{ data: Testimonial }> {
  try {
    const { data } = await api.put(`/testimonials/${id}`, { data: payload });
    return data;
  } catch {
    const idx = localTestimonials.findIndex((t) => String(t.id) === id);
    if (idx !== -1) {
      localTestimonials[idx] = { ...localTestimonials[idx], ...payload };
      return { data: localTestimonials[idx] };
    }
    return { data: localTestimonials[0] };
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  try {
    await api.delete(`/testimonials/${id}`);
  } catch {
    localTestimonials = localTestimonials.filter((t) => String(t.id) !== id);
  }
}

// ─── Gallery (Admin) ────────────────────────────────────────────────────

export async function getAdminGallery(): Promise<StrapiResponse<GalleryItem[]>> {
  try {
    const { data } = await api.get("/gallery-items?populate=*&sort=rank:asc");
    return data;
  } catch {
    return { data: localGallery, meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: localGallery.length } } };
  }
}

export async function createGalleryItem(payload: Record<string, unknown>): Promise<{ data: GalleryItem }> {
  try {
    const { data } = await api.post("/gallery-items", { data: payload });
    return data;
  } catch {
    const newItem: GalleryItem = {
      id: Date.now(),
      documentId: `gal-${Date.now()}`,
      title: String(payload.title || ""),
      image: null,
      category: String(payload.category || "General"),
      rank: Number(payload.rank || 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };
    localGallery.push(newItem);
    return { data: newItem };
  }
}

export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    await api.delete(`/gallery-items/${id}`);
  } catch {
    localGallery = localGallery.filter((g) => String(g.id) !== id);
  }
}

// ─── Contact Messages (Admin) ───────────────────────────────────────────

export async function getAdminContactMessages(params?: {
  page?: number;
  pageSize?: number;
  status?: "new" | "read" | "replied";
}): Promise<StrapiResponse<ContactSubmission[]>> {
  try {
    const sp = new URLSearchParams();
    sp.set("sort", "createdAt:desc");
    if (params?.status) {
      sp.set("filters[status][$eq]", params.status);
    }
    sp.set("pagination[page]", String(params?.page || 1));
    sp.set("pagination[pageSize]", String(params?.pageSize || 25));

    const { data } = await api.get(`/contact-submissions?${sp.toString()}`);
    return data;
  } catch {
    return { data: [], meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 0 } } };
  }
}

export async function updateContactMessageStatus(
  id: string,
  status: "new" | "read" | "replied"
): Promise<{ data: ContactSubmission }> {
  try {
    const { data } = await api.put(`/contact-submissions/${id}`, { data: { status } });
    return data;
  } catch {
    return { data: {} as ContactSubmission };
  }
}

// ─── Site Settings (Admin) ──────────────────────────────────────────────

export async function getAdminSiteSettings(): Promise<StrapiSingleResponse<SiteSetting>> {
  try {
    const { data } = await api.get("/site-config?populate=*");
    return data;
  } catch {
    return { data: localSiteSetting };
  }
}

export async function updateSiteSettings(payload: Record<string, unknown>): Promise<{ data: SiteSetting }> {
  try {
    const { data } = await api.put("/site-config", { data: payload });
    return data;
  } catch {
    localSiteSetting = { ...localSiteSetting, ...payload };
    return { data: localSiteSetting };
  }
}

// ─── Image Upload ───────────────────────────────────────────────────────

export async function uploadImage(file: File): Promise<StrapiSingleResponse<unknown>> {
  try {
    const formData = new FormData();
    formData.append("files", file);
    const { data } = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { data: data[0] };
  } catch {
    return { data: { url: URL.createObjectURL(file) } };
  }
}

export async function uploadImages(files: File[]): Promise<unknown[]> {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const { data } = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch {
    return files.map((f) => ({ url: URL.createObjectURL(f) }));
  }
}

// ─── Customer CRM (Admin) ───────────────────────────────────────────────

export async function getAdminCustomers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  segment?: string;
}): Promise<StrapiResponse<Customer[]>> {
  try {
    const sp = new URLSearchParams();
    if (params?.page) sp.set("page", String(params.page));
    if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
    if (params?.search) sp.set("search", params.search);
    if (params?.segment) sp.set("segment", params.segment);
    const { data } = await api.get(`/customers?${sp.toString()}`);
    return data;
  } catch {
    return { data: [], meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } } };
  }
}

export async function getAdminCustomer(id: string): Promise<{ data: Customer & { orders?: Order[] } }> {
  const { data } = await api.get(`/customers/${id}`);
  return data;
}

export async function createAdminCustomer(payload: Partial<Customer>): Promise<{ data: Customer }> {
  const { data } = await api.post("/customers", { data: payload });
  return data;
}

export async function updateAdminCustomer(id: string, payload: Partial<Customer>): Promise<{ data: Customer }> {
  const { data } = await api.put(`/customers/${id}`, { data: payload });
  return data;
}

export async function deleteAdminCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}

// ─── Admin Users ────────────────────────────────────────────────────────

export async function getAdminUsers(search?: string): Promise<{ data: AdminUser[] }> {
  try {
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);
    const { data } = await api.get(`/admin/users?${sp.toString()}`);
    return data;
  } catch {
    return { data: [] };
  }
}

export async function createAdminUser(payload: Partial<AdminUser>): Promise<{ data: AdminUser }> {
  const { data } = await api.post("/admin/users", { data: payload });
  return data;
}

export async function updateAdminUser(id: string, payload: Partial<AdminUser>): Promise<{ data: AdminUser }> {
  const { data } = await api.put(`/admin/users/${id}`, { data: payload });
  return data;
}

export async function deleteAdminUser(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}


