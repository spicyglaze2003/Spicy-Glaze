# 🌶️ SpicyGlaze — Technical Specification (TZ) & Complete System Architecture

> **Naturally Crafted Goodness — Full-Stack E-Commerce Storefront & Admin Control Center**  
> Documentation, Technical Assignment (TZ), Architecture Analysis, and Admin System Reference.

---

## 📑 Table of Contents

1. [Executive Summary & Core Objective](#1-executive-summary--core-objective)
2. [Full Tech Stack & Dependencies](#2-full-tech-stack--dependencies)
3. [Project Directory & Architecture Breakdown](#3-project-directory--architecture-breakdown)
4. [Data Models & Schema Specifications](#4-data-models--schema-specifications)
5. [The Admin Control Center — Complete Feature Tour](#5-the-admin-control-center--complete-feature-tour)
   - 5.1 [Authentication & Session Flow](#51-authentication--session-flow)
   - 5.2 [Executive Dashboard (`/admin`)](#52-executive-dashboard-admin)
   - 5.3 [Product Catalogue Management (`/admin/products`)](#53-product-catalogue-management-adminproducts)
   - 5.4 [Product Creation & Editor (`/admin/products/new` & `[id]/edit`)](#54-product-creation--editor-adminproductsnew--idedit)
   - 5.5 [Categories & Subcategories Hierarchy](#55-categories--subcategories-hierarchy)
   - 5.6 [Live Inventory & Stock Control (`/admin/inventory`)](#56-live-inventory--stock-control-admininventory)
   - 5.7 [Order Processing & Fulfilment (`/admin/orders`)](#57-order-processing--fulfilment-adminorders)
   - 5.8 [Customer Directory & LTV Analytics (`/admin/customers`)](#58-customer-directory--ltv-analytics-admincustomers)
   - 5.9 [Promotions & Coupon Engine (`/admin/coupons`)](#59-promotions--coupon-engine-admincoupons)
   - 5.10 [Storefront Content Management (Hero, Testimonials, Gallery)](#510-storefront-content-management-hero-testimonials-gallery)
   - 5.11 [Customer Inquiries & Messages (`/admin/contact-messages`)](#511-customer-inquiries--messages-admincontact-messages)
   - 5.12 [Sales Performance & Revenue Analytics (`/admin/analytics`)](#512-sales-performance--revenue-analytics-adminanalytics)
   - 5.13 [Gemini-Powered AI Store Assistant (`/admin/ai-assistant`)](#513-gemini-powered-ai-store-assistant-adminai-assistant)
   - 5.14 [Store Settings & WhatsApp Commerce (`/admin/settings`)](#514-store-settings--whatsapp-commerce-adminsettings)
   - 5.15 [Role-Based Access Control (`/admin/users`)](#515-role-based-access-control-adminusers)
   - 5.16 [System Activity Logs & Audit Trail (`/admin/activity-logs`)](#516-system-activity-logs--audit-trail-adminactivity-logs)
6. [Real-Time Customer Storefront Synchronization](#6-real-time-customer-storefront-synchronization)
7. [Environment Variables & Setup Guide](#7-environment-variables--setup-guide)
8. [Available Scripts & Production Deployment](#8-available-scripts--production-deployment)

---

## 1. Executive Summary & Core Objective

**SpicyGlaze** is an artisan Indian food e-commerce platform offering premium hand-crafted natural packaged goods (authentic whole spices, organic raw forest honey, pickles, cold-pressed oils, and seasonings).

### The Primary Engineering Milestone
Transform the platform so that **the Admin panel is the real-time operational control center for the entire website**:
- When an admin adjusts pricing, creates a pack size/variant, updates stock, or modifies active visibility in `/admin`, the public customer storefront (`/products`, `/products/[slug]`, and `/`) **immediately reflects those changes**.
- Unified state synchronization via **TanStack React Query v5** invalidation layers ensures zero stale data between backoffice operations and customer checkout.

---

## 2. Full Tech Stack & Dependencies

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | [Next.js](https://nextjs.org) | 16.2.11 (Turbopack) | App Router, Server Components & Dynamic Route Handlers |
| **Runtime** | [React](https://react.dev) | 19.2.4 | Modern Component Library & Concurrent features |
| **Language** | [TypeScript](https://www.typescriptlang.org) | 5.x | Strict end-to-end type safety |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | 4.x | Utility-first CSS & design tokens |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | 12.42.2 | Micro-interactions, slide reveals, stagger transitions |
| **Server State** | [TanStack React Query](https://tanstack.com) | 5.101.4 | Automatic caching, background refetching & cache invalidation |
| **Client State** | [Zustand](https://zustand-demo.pmnd.rs) | 5.0.15 | Persisted Cart state (`localStorage`) & Admin Auth Session |
| **API Backend** | [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) | Built-in | 100% Self-Contained internal API on port 3000 (`/api/...`) — No external Strapi required |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski) | 2.0.8 | Premium toast notification stack |
| **Icons** | [Lucide React](https://lucide.dev) | 1.27.0 | Consistent icon set |

---

## 3. Project Directory & Architecture Breakdown

```text
spicy-glaze/
├── app/
│   ├── (main)/                     # Customer-facing storefront
│   │   ├── layout.tsx              # Navbar, SiteConfigProvider, Footer
│   │   ├── page.tsx                # Homepage (Hero, Brand Story, Featured Products)
│   │   ├── about/page.tsx          # Brand philosophy & origin story
│   │   ├── contact/page.tsx        # Customer contact & inquiry submission
│   │   ├── checkout/page.tsx       # Cart review & WhatsApp order generation
│   │   └── products/
│   │       ├── page.tsx            # Live product grid, real-time search & filter pills
│   │       └── [slug]/page.tsx     # Dynamic product detail & variant selector
│   ├── admin/                      # Admin Control Center (Protected Routes)
│   │   ├── layout.tsx              # Admin shell (Sidebar + Header + Auth gatekeeper)
│   │   ├── page.tsx                # Executive Dashboard with charts & KPI metrics
│   │   ├── login/page.tsx          # Split-screen responsive authentication
│   │   ├── products/
│   │   │   ├── page.tsx            # Products table, status pills, delete/feature toggles
│   │   │   ├── new/page.tsx        # Create product with variants, pricing & SEO
│   │   │   └── [id]/edit/page.tsx  # Edit product with preloaded data
│   │   ├── categories/page.tsx     # Categories CRUD & display rank
│   │   ├── subcategories/page.tsx  # Nested subcategories management
│   │   ├── inventory/
│   │   │   ├── page.tsx            # Live stock adjusters (+ / - / direct input)
│   │   │   └── low-stock/page.tsx  # Filtered view for critical replenishment
│   │   ├── orders/page.tsx         # Order fulfilment, tracking & details modal
│   │   ├── customers/page.tsx      # Customer CRM, order counts & lifetime spend
│   │   ├── coupons/page.tsx        # Discount rules (% or fixed ₹) and expiry dates
│   │   ├── hero/page.tsx           # Rotating homepage banners & CTA links
│   │   ├── testimonials/page.tsx   # Verified customer quotes & star ratings
│   │   ├── gallery/page.tsx        # Visual photo grid & culinary tags
│   │   ├── contact-messages/page.tsx # Customer enquiry inbox & email reply
│   │   ├── analytics/page.tsx      # Weekly revenue inflow chart & category shares
│   │   ├── ai-assistant/page.tsx   # Gemini AI copy generator & pricing advisor
│   │   ├── settings/page.tsx       # Store identity, WhatsApp number & social URLs
│   │   ├── users/page.tsx          # Staff invitations & role management
│   │   └── activity-logs/page.tsx  # Audit trail for price and inventory changes
│   ├── layout.tsx                  # Root layout (Fonts, QueryProvider, Toaster)
│   └── globals.css                 # Color tokens, glassmorphism utilities
├── components/
│   ├── admin/                      # Admin components
│   │   ├── admin-header.tsx        # Top bar with search, site preview link & profile
│   │   ├── admin-sidebar.tsx       # Expandable multi-level dark navigation
│   │   └── product-form.tsx        # Shared create/edit form with variant manager
│   ├── navbar.tsx                  # Floating glassmorphic header
│   ├── footer.tsx                  # Store footer with CMS-driven contact info
│   └── product-card.tsx            # Customer product card with live price & variants
├── lib/
│   ├── admin-api.ts                # Complete Admin API functions (CRUD for all models)
│   ├── admin-auth.ts               # Zustand store for admin session & RBAC
│   ├── admin-types.ts              # Extended TypeScript types for admin system
│   ├── api.ts                      # Customer storefront API queries
│   ├── axios.ts                    # Axios HTTP instance targeting NEXT_PUBLIC_API_URL
│   ├── config.ts                   # Environment configuration defaults
│   ├── store.ts                    # Customer shopping cart store
│   └── types.ts                    # Core Strapi CMS schemas
```

---

## 4. Data Models & Schema Specifications

### `Product`
- `name`: string (e.g., "Royal Kashmiri Saffron Honey")
- `slug`: string (e.g., "royal-kashmiri-saffron-honey")
- `shortDescription`: string | null
- `description`: string | null
- `price`: number (Base selling price in ₹)
- `mrp`: number | null (Strikethrough reference price in ₹)
- `category`: Category relation
- `subcategory`: Subcategory relation
- `isFeatured`: boolean (Highlight on homepage)
- `isActive`: boolean (Customer visibility)
- `availability`: `"in-stock"` | `"out-of-season"` | `"pre-order"`
- `rank`: number (Display sort order)
- `variants`: Array of `ProductVariant`
- `seoTitle`, `seoDescription`, `seoKeywords`: string

### `ProductVariant`
- `name`: string (e.g., "250g Jar", "500g Jar", "1kg Economy Pack")
- `sku`: string | null (e.g., "SG-HONEY-500")
- `price`: number (Variant specific price in ₹)
- `mrp`: number | null
- `stock`: number (Units in warehouse)

### `Order`
- `orderNumber`: string (e.g., "SG-2026-1082")
- `customer`: Customer profile reference
- `items`: Array of ordered items, variants, quantity and prices
- `subtotal`: number
- `shippingFee`: number
- `discount`: number
- `total`: number
- `status`: `"new"` | `"confirmed"` | `"processing"` | `"packed"` | `"shipped"` | `"out-for-delivery"` | `"delivered"` | `"cancelled"` | `"refunded"`
- `paymentStatus`: `"pending"` | `"paid"` | `"failed"` | `"refunded"`
- `paymentMethod`: `"razorpay"` | `"upi"` | `"cod"` | `"bank-transfer"`
- `shippingAddress`: Line 1, City, State, Pincode, Country

---

## 5. The Admin Control Center — Complete Feature Tour

### 5.1 Authentication & Session Flow
- **Protected Routing**: The admin layout validates active login status before rendering admin views; unauthorized sessions are redirected to `/admin/login`.
- **RBAC (Role-Based Access Control)**: Supports 7 permission levels (`super-admin`, `manager`, `product-manager`, `inventory-manager`, `order-manager`, `content-manager`, `support-agent`).
- **Persistent Session**: Session credentials and tokens persist securely via Zustand middleware.

### 5.2 Executive Dashboard (`/admin`)
- **Key Metric Indicators**:
  * Total Products & Active Listings count
  * Out of Stock & Low Stock alert counters
  * Today's Sales and Monthly Sales revenue figures
  * Pending vs Completed vs Cancelled Order statuses
  * Customer registration count and contact form inquiries
- **Visual Inflow Chart**: Weekly revenue inflow bars with interactive hover data.
- **Urgent Inventory Warnings**: Instant alerts for any product with stock below 10 units.
- **Recent Orders Table**: Quick overview of recent transactions with direct detail inspection.

### 5.3 Product Catalogue Management (`/admin/products`)
- Full data table with image, name, category, selling price, MRP, total stock, and active pill.
- **Search & Filtering**: Search by name or slug; filter by category and active/featured status.
- **Quick Action Menu**:
  * 👁️ View on customer store (`/products/[slug]`)
  * ✏️ Edit full product and variants (`/admin/products/[id]/edit`)
  * ⭐ Toggle "Featured" badge with instant cache invalidation
  * 🔄 Toggle "Active" visibility
  * 🗑️ Safe deletion with confirmation modal

### 5.4 Product Creation & Editor (`/admin/products/new` & `[id]/edit`)
- Reusable `ProductForm` component handles both creation and editing.
- **Auto-generating URL Slug**: Automatically slugs product name while allowing manual overrides.
- **Cascading Category Selectors**: Selecting a parent category automatically filters subcategories.
- **Pack Sizes & Variant Manager**:
  * Add multiple packaging options (e.g., 100g, 250g, 500g, 1kg).
  * Assign unique SKUs, selling prices, MRPs, and stock quantities per pack.
- **SEO & Social Metadata**: Dedicated fields for meta title, description, and keywords.

### 5.5 Categories & Subcategories Hierarchy
- `/admin/categories`: Create, edit, and rank primary departments. Displays subcategory count per category.
- `/admin/subcategories`: Refine groupings nested under primary categories (e.g., "Kashmiri Saffron" under "Spices").

### 5.6 Live Inventory & Stock Control (`/admin/inventory`)
- Single-pane view of all product variants across the warehouse.
- **Quick Stock Adjuster**: Increase (+), decrease (-), or type custom stock levels directly in the table.
- **Save Trigger**: Modified rows highlight with a one-click "Save" button that instantly updates the backend and invalidates frontend caches.
- **Filter Tabs**: Toggle between "All SKUs", "Low Stock (≤ 10)", and "Out of Stock (0)".

### 5.7 Order Processing & Fulfilment (`/admin/orders`)
- Orders ledger featuring order ID, date, customer name, phone, item summary, total, payment status, and fulfilment stage.
- **Order Details Drawer**: View customer notes, delivery address, items breakdown, subtotal, and shipping fee.
- **Status Updater**: Advance order status (`new` → `confirmed` → `processing` → `packed` → `shipped` → `delivered`).

### 5.8 Customer Directory & LTV Analytics (`/admin/customers`)
- Track customer profiles, email, phone, total orders placed, and lifetime spend (₹).
- Metric summaries for Average Order Value (AOV) and customer retention.

### 5.9 Promotions & Coupon Engine (`/admin/coupons`)
- Create promotional coupon codes with percentage (%) or fixed (₹) discounts.
- Enforce minimum order spend thresholds, usage redemption caps, and expiry dates.

### 5.10 Storefront Content Management (Hero, Testimonials, Gallery)
- **Hero Slides (`/admin/hero`)**: Configure homepage banners, promotional taglines, CTA button text, and destination links.
- **Testimonials (`/admin/testimonials`)**: Manage verified client reviews, star ratings (1-5), customer designations, and quotes.
- **Gallery (`/admin/gallery`)**: Upload and categorize brand visual photos and culinary process shots.

### 5.11 Customer Inquiries & Messages (`/admin/contact-messages`)
- Inbound inquiries from the storefront contact form.
- Status workflow (`new` → `read` → `replied`).
- One-click "Reply via Email" directly launches pre-addressed mail drafts.

### 5.12 Sales Performance & Revenue Analytics (`/admin/analytics`)
- Commercial dashboard with Revenue, Order Volume, AOV, and Repeat Customer Rate.
- Revenue distribution breakdown across primary categories.

### 5.13 Gemini-Powered AI Store Assistant (`/admin/ai-assistant`)
- Generates high-converting artisan storytelling descriptions.
- Provides seasonal pricing strategy recommendations and festive combo suggestions.
- Formats WhatsApp marketing broadcast copy.

### 5.14 Store Settings & WhatsApp Commerce (`/admin/settings`)
- Global configuration for Brand Name, Tagline, Support Phone, and Official Email.
- **WhatsApp Order Channel**: Sets the WhatsApp phone number that powers 1-click orders across the site.
- Social media URLs (Instagram, Facebook, X).

### 5.15 Role-Based Access Control (`/admin/users`)
- Manage administrative staff accounts and invitations.
- Define roles: Super Admin, General Manager, Product Manager, Inventory Manager, Content Editor, Order Manager, Support Agent.

### 5.16 System Activity Logs & Audit Trail (`/admin/activity-logs`)
- Comprehensive chronological record of all administrative actions (price updates, stock edits, category creation, order status updates) with staff attribution and timestamps.

---

## 6. Real-Time Customer Storefront Synchronization

The customer-facing `/products` and `/products/[slug]` pages utilize React Query:

```tsx
// app/(main)/products/page.tsx
const { data, isLoading } = useQuery({
  queryKey: ["products", selectedCategory],
  queryFn: () => getProducts({ category: selectedCategory || undefined, pageSize: 100 }),
});
```

Whenever an admin performs a mutation in the Admin panel:
```tsx
// Invalidation cascade
queryClient.invalidateQueries({ queryKey: ["admin-products"] });
queryClient.invalidateQueries({ queryKey: ["products"] });
queryClient.invalidateQueries({ queryKey: ["featured-products"] });
queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
```
This guarantees that **customers browsing the catalogue see updated prices, new pack sizes, and accurate live stock availability without manual server redeployments**.

---

## 7. Environment Variables & Setup Guide

Create `.env.local` in the project root:

```env
# Internal API Endpoint on port 3000 (No Strapi required)
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional — Site Defaults
NEXT_PUBLIC_SITE_NAME=SpicyGlaze
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_GOOGLE_ANALYTICS=
```

### Installation

```bash
# Install dependencies
npm install

# Verify TypeScript compilation
npx tsc --noEmit

# Start development server
npm run dev
```

The application is accessible at:
- **Customer Storefront**: `http://localhost:3000`
- **Admin Control Center**: `http://localhost:3000/admin`

---

## 8. Available Scripts & Production Deployment

| Command | Action |
|---|---|
| `npm run dev` | Starts local Next.js Turbopack development server |
| `npm run build` | Builds optimized production bundle |
| `npm run start` | Runs the production Next.js server locally |
| `npm run lint` | Runs ESLint analysis |

---

<p align="center">
  <strong>SpicyGlaze</strong> — Naturally Crafted Goodness<br>
  <em>Production-Ready Full-Stack E-Commerce & Admin Control Center</em>
</p>
