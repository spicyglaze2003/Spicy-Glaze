import fs from "fs";
import path from "path";
import type {
  Product,
  Category,
  Subcategory,
  HeroSlide,
  Testimonial,
  GalleryItem,
  SiteSetting,
  ContactSubmission,
} from "./types";
import type { Order, Customer, Coupon, AdminUser } from "./admin-types";
import {
  demoCategories,
  demoSubcategories,
  demoHeroSlides,
  demoTestimonials,
  demoGallery,
  demoSiteSetting,
} from "./demo-data";

export const defaultAdminUsers: AdminUser[] = [
  {
    id: 1,
    documentId: "usr-1",
    name: "SpicyGlaze Admin",
    email: "spicyglaze2003@gmail.com",
    role: "super-admin",
    isActive: true,
    lastLoginAt: "2026-10-16T21:40:00Z",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
];

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
  heroSlides: HeroSlide[];
  testimonials: Testimonial[];
  gallery: GalleryItem[];
  siteSetting: SiteSetting;
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  contactMessages: ContactSubmission[];
  adminUsers: AdminUser[];
}

const DB_FILE_PATH = path.join(process.cwd(), "data", "database.json");
let lastDbMtime = 0;

function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

export function reloadDbIfChanged() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const stat = fs.statSync(DB_FILE_PATH);
      if (stat.mtimeMs > lastDbMtime) {
        const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        if (globalThis.__localMartDb) {
          if (Array.isArray(parsed.products)) globalThis.__localMartDb.products = parsed.products;
          if (Array.isArray(parsed.categories)) globalThis.__localMartDb.categories = parsed.categories;
          if (Array.isArray(parsed.subcategories)) globalThis.__localMartDb.subcategories = parsed.subcategories;
          if (Array.isArray(parsed.heroSlides)) globalThis.__localMartDb.heroSlides = parsed.heroSlides;
          if (Array.isArray(parsed.testimonials)) globalThis.__localMartDb.testimonials = parsed.testimonials;
          if (Array.isArray(parsed.gallery)) globalThis.__localMartDb.gallery = parsed.gallery;
          if (parsed.siteSetting) globalThis.__localMartDb.siteSetting = parsed.siteSetting;
          if (Array.isArray(parsed.orders)) globalThis.__localMartDb.orders = parsed.orders;
          if (Array.isArray(parsed.customers)) globalThis.__localMartDb.customers = parsed.customers;
          if (Array.isArray(parsed.coupons)) globalThis.__localMartDb.coupons = parsed.coupons;
          if (Array.isArray(parsed.contactMessages)) globalThis.__localMartDb.contactMessages = parsed.contactMessages;
          if (Array.isArray(parsed.adminUsers)) globalThis.__localMartDb.adminUsers = parsed.adminUsers;
        }
        lastDbMtime = stat.mtimeMs;
      }
    }
  } catch (err) {
    console.error("reloadDbIfChanged error:", err);
  }
}

function loadInitialData(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        products: Array.isArray(parsed.products) ? parsed.products : [],
        categories: Array.isArray(parsed.categories) ? parsed.categories : demoCategories,
        subcategories: Array.isArray(parsed.subcategories) ? parsed.subcategories : demoSubcategories,
        heroSlides: Array.isArray(parsed.heroSlides) ? parsed.heroSlides : demoHeroSlides,
        testimonials: Array.isArray(parsed.testimonials) ? parsed.testimonials : demoTestimonials,
        gallery: Array.isArray(parsed.gallery) ? parsed.gallery : demoGallery,
        siteSetting: parsed.siteSetting || demoSiteSetting,
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        customers: Array.isArray(parsed.customers) ? parsed.customers : [],
        coupons: Array.isArray(parsed.coupons) ? parsed.coupons : [],
        contactMessages: Array.isArray(parsed.contactMessages) ? parsed.contactMessages : [],
        adminUsers: Array.isArray(parsed.adminUsers) ? parsed.adminUsers : defaultAdminUsers,
      };
    }
  } catch (err) {
    console.error("Error reading database file, using clean defaults:", err);
  }

  // Clean initialization — no dummy products, no dummy orders
  const initial: DatabaseSchema = {
    products: [],
    categories: JSON.parse(JSON.stringify(demoCategories)),
    subcategories: JSON.parse(JSON.stringify(demoSubcategories)),
    heroSlides: JSON.parse(JSON.stringify(demoHeroSlides)),
    testimonials: JSON.parse(JSON.stringify(demoTestimonials)),
    gallery: JSON.parse(JSON.stringify(demoGallery)),
    siteSetting: JSON.parse(JSON.stringify(demoSiteSetting)),
    orders: [],
    customers: [],
    coupons: [],
    contactMessages: [],
    adminUsers: JSON.parse(JSON.stringify(defaultAdminUsers)),
  };

  try {
    ensureDirectoryExists(DB_FILE_PATH);
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing initial database file:", err);
  }

  return initial;
}

declare global {
  // eslint-disable-next-line no-var
  var __localMartDb: DatabaseSchema | undefined;
}

if (!globalThis.__localMartDb) {
  globalThis.__localMartDb = loadInitialData();
}

export const db = globalThis.__localMartDb!;

export function saveDb(): boolean {
  try {
    ensureDirectoryExists(DB_FILE_PATH);
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
    try {
      lastDbMtime = fs.statSync(DB_FILE_PATH).mtimeMs;
    } catch {}
    return true;
  } catch (err) {
    console.error("Failed to persist database to file:", err);
    return false;
  }
}
