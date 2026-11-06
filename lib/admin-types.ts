// ─── Admin Extended Types ───────────────────────────────────────────────

import type { Product, ProductVariant, Category, Subcategory, StrapiMedia, ContactSubmission, SiteSetting, HeroSlide, Testimonial, GalleryItem } from "./types";

// Re-export for convenience
export type { Product, ProductVariant, Category, Subcategory, StrapiMedia, ContactSubmission, SiteSetting, HeroSlide, Testimonial, GalleryItem };

// ─── Product Extended ───────────────────────────────────────────────────

export type ProductStatus = "draft" | "published" | "scheduled" | "archived";

export interface ProductFormData {
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  category: number | null;
  subcategory: number | null;
  price: number;
  mrp: number | null;
  purchasePrice?: number | null;
  tax?: number | null;
  isFeatured: boolean;
  isActive: boolean;
  availability: "in-stock" | "out-of-season" | "pre-order";
  rank: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  stockAlertThreshold?: number;
  tags?: string[];
  variants: VariantFormData[];
}

export interface VariantFormData {
  id?: number;
  name: string;
  sku: string | null;
  price: number;
  mrp: number | null;
  purchasePrice?: number | null;
  stock: number;
  lowStockThreshold?: number;
  weight?: string;
  unit?: string;
}

// ─── Orders ─────────────────────────────────────────────────────────────

export type OrderStatus =
  | "new"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out-for-delivery"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type PaymentMethod = "stripe" | "razorpay" | "upi" | "cod" | "bank-transfer" | "card";

export interface OrderProductSnapshot {
  productId: string;
  name: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
  subtotal: number;
  imageUrl?: string;
}

export interface Order {
  id: number;
  documentId: string;
  orderNumber: string;
  orderId?: string;
  userId?: string | number;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customer?: Customer;
  items: OrderItem[];
  products?: OrderProductSnapshot[];
  quantity?: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  total: number;
  totalAmount?: number;
  status: OrderStatus;
  orderStatus?: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentId?: string;
  invoiceUrl?: string;
  shippingAddress: Address;
  notes: string | null;
  coupon?: Coupon | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  variant?: ProductVariant;
  productId?: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  price?: number;
  total: number;
  subtotal?: number;
}

export interface Address {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// ─── Customers ──────────────────────────────────────────────────────────

export type CustomerSegment = "all" | "new" | "repeat" | "vip" | "blocked";

export interface Customer {
  id: number;
  documentId: string;
  name: string;
  email: string;
  phone: string | null;
  address?: Address | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
  segment: CustomerSegment;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Coupons ────────────────────────────────────────────────────────────

export type CouponType =
  | "percentage"
  | "fixed"
  | "free-shipping"
  | "first-order"
  | "category-specific"
  | "product-specific";

export interface Coupon {
  id: number;
  documentId: string;
  code: string;
  type: CouponType;
  discount: number;
  minimumOrder: number;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  applicableCategories?: Category[];
  applicableProducts?: Product[];
  createdAt: string;
  updatedAt: string;
}

// ─── Admin Users ────────────────────────────────────────────────────────

export type AdminRole =
  | "super-admin"
  | "manager"
  | "product-manager"
  | "inventory-manager"
  | "order-manager"
  | "content-manager"
  | "support-agent";

export interface AdminUser {
  id: number;
  documentId: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: StrapiMedia | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Activity Logs ──────────────────────────────────────────────────────

export type ActivityAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "login"
  | "logout"
  | "stock-update"
  | "price-update"
  | "order-status-update";

export interface ActivityLog {
  id: number;
  adminUser: AdminUser;
  action: ActivityAction;
  entity: string;
  entityId: number;
  description: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  createdAt: string;
}

// ─── Inventory ──────────────────────────────────────────────────────────

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface InventoryItem {
  product: Product;
  variant: ProductVariant;
  stockStatus: StockStatus;
  lowStockThreshold: number;
}

export interface StockAdjustment {
  id: number;
  product: Product;
  variant: ProductVariant;
  previousStock: number;
  newStock: number;
  reason: string;
  adjustedBy: AdminUser;
  createdAt: string;
}

// ─── Dashboard Analytics ────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue?: number;
  totalOrders?: number;
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  todaySales: number;
  monthlySales: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  newCustomersToday: number;
  contactEnquiries: number;
  recentOrders: Order[];
  topProducts: Array<{ product: Product; unitsSold: number }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
  inventoryAlerts: InventoryItem[];
  recentActivity: ActivityLog[];
}

// ─── AI Assistant ───────────────────────────────────────────────────────

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  actions?: AIAction[];
}

export interface AIAction {
  label: string;
  href?: string;
  onClick?: string;
}
