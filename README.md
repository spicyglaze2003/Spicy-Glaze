# 🌶️ SpicyGlaze — Naturally Crafted Goodness

> Premium naturally crafted packaged food products — authentic Indian flavours, handcrafted with love.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.11-black?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Strapi](https://img.shields.io/badge/Backend-Strapi-4945FF?logo=strapi)](https://strapi.io)

---

## 📖 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Architecture](#-project-architecture)
- [Design System](#-design-system)
- [API Layer](#-api-layer)
- [State Management](#-state-management)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Deployment](#-deployment)
- [Known Limitations & Future Work](#-known-limitations--future-work)

---

## 🌟 Project Overview

**SpicyGlaze** is a production-ready **Next.js 16** storefront for a premium Indian food brand. It is a fully headless e-commerce frontend that connects to a **Strapi CMS** backend to dynamically serve product catalogues, hero slides, testimonials, site settings, and more.

The site is designed for the Indian market (`locale: en_IN`) and is optimised for static export (`output: "export"`), making it hostable on any static CDN or file server.

---

## 🛠 Tech Stack

### Core Framework

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2.11 | React framework — App Router, SSG, static export |
| [React](https://react.dev) | 19.2.4 | UI component library |
| [TypeScript](https://www.typescriptlang.org) | ^5 | Static typing |

### Styling

| Technology | Version | Purpose |
|---|---|---|
| [Tailwind CSS](https://tailwindcss.com) | ^4 | Utility-first CSS framework |
| [Framer Motion](https://www.framer.com/motion/) | ^12.42.2 | Declarative animations & page transitions |
| [GSAP](https://gsap.com) | ^3.15.0 | High-performance animation library |
| Google Fonts | — | **Playfair Display** (display) + **DM Sans** (body) |

### 3D & Visual Effects

| Technology | Version | Purpose |
|---|---|---|
| [Three.js](https://threejs.org) | ^0.185.1 | 3D rendering engine |
| [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) | ^9.6.1 | React renderer for Three.js |
| [@react-three/drei](https://github.com/pmndrs/drei) | ^10.7.7 | Useful Three.js helpers |

### Data Fetching & State

| Technology | Version | Purpose |
|---|---|---|
| [TanStack Query](https://tanstack.com/query) | ^5.101.4 | Server state management & caching |
| [Zustand](https://zustand-demo.pmnd.rs/) | ^5.0.15 | Client-side global state (cart) |
| [Axios](https://axios-http.com) | ^1.18.1 | HTTP client for Strapi API calls |

### UI Components & Utilities

| Technology | Version | Purpose |
|---|---|---|
| [Embla Carousel](https://www.embla-carousel.com/) | ^8.6.0 | Accessible touch-friendly carousels |
| [Lucide React](https://lucide.dev) | ^1.27.0 | Icon library |
| [React Icons](https://react-icons.github.io) | ^5.7.0 | WhatsApp, Instagram, Facebook icons |
| [Sonner](https://sonner.emilkowal.ski/) | ^2.0.8 | Toast notification system |
| [clsx](https://github.com/lukeed/clsx) | ^2.1.1 | Conditional className utility |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | ^3.6.0 | Safely merge Tailwind classes |
| [@studio-freight/lenis](https://lenis.darkroom.engineering/) | ^1.0.42 | Smooth scrolling |

### Backend (CMS)

| Technology | Purpose |
|---|---|
| [Strapi](https://strapi.io) | Headless CMS — manages products, categories, hero, testimonials, site config |

---

## ✨ Features

### 🏠 Home Page
- **Animated Hero Section** — Full-screen hero with CMS-driven slides, floating product image with Framer Motion entry animations, and glassmorphism floating badges
- **Brand Story Section** — Storytelling section with brand values and mission
- **Featured Products** — Grid of featured products pulled from Strapi
- **Category Showcase** — Visual category explorer linking to filtered product listings
- **Contact Section** — Inline contact form on the home page

### 🛍️ Product Catalogue (`/products`)
- **Real-time Search** — Instant client-side name filtering
- **Category Filter Pills** — URL-based (`?category=slug`) filter pills populated from CMS; persists on page refresh
- **Responsive Grid** — 1 → 2 → 3 → 4 column responsive product grid
- **Skeleton Loading** — Shimmer placeholders while data loads
- **Empty State** — Friendly "No products found" message
- **Pagination API** — `page` + `pageSize` params supported in the API layer

### 📦 Product Detail (`/products/[slug]`)
- Dynamic slug-based routes
- Full product image gallery
- Variant selection (size, weight, etc.)
- Add-to-cart with quantity control

### 🛒 Cart & Checkout
- **Persistent Cart** — Zustand store persisted to `localStorage` (key: `shopping-cart`)
- Cart items: variant ID, product ID, name, price, quantity, image
- `totalAmount` and `itemCount` computed getters
- `/checkout` route for order review

### 📞 Contact (`/contact`)
- Contact form that POSTs to Strapi `/contact-submissions`
- Submission status: `new` → `read` → `replied`

### ℹ️ About (`/about`)
- Brand story and company information

### 🌐 Navigation & Layout
- **Floating Glassmorphism Navbar** — Shrinks and gains shadow on scroll
- **Full-Screen Mobile Menu** — Smooth animated full-screen overlay with staggered link transitions
- **WhatsApp CTA** — One-tap WhatsApp order button in navbar, footer, and as a sticky floating button (number driven by CMS)
- **Footer** — Social links, quick nav, contact details — all CMS-driven
- **Toast Notifications** — Sonner `bottom-right` rich toasts

### 🎨 Visual & Animation System
- **Glassmorphism** — Frosted-glass surfaces (`backdrop-filter: blur`)
- **Animated Blobs** — SVG border-radius morphing blob backgrounds
- **Floating Particles** — Three.js / CSS particle system backgrounds
- **Grain Overlay** — Subtle SVG noise texture (3% opacity) layered over entire page
- **Smooth Scroll** — Lenis-powered smooth scrolling
- **Text Gradient** — Orange → Turmeric gradient clipped to text
- **Reduced Motion** — Full `prefers-reduced-motion` support throughout

### 🔍 SEO
- Next.js `Metadata` API — `title`, `description`, `keywords`
- OpenGraph tags — `og:type`, `og:locale`, `og:url`, `og:title`, `og:description`
- Per-product CMS SEO fields — `seoTitle`, `seoDescription`, `seoKeywords`
- Robots — `index: true`, `follow: true`

### ⚙️ CMS-Driven Site Config
All global settings come from Strapi's `/site-config` and are distributed via a React Context (`SiteConfigProvider`):
- Site name & tagline
- WhatsApp number & default message
- Email, phone, address
- Instagram, Facebook, Twitter URLs
- Logo media

---

## 📁 Project Architecture

```
spicy-glaze/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout — fonts, metadata, Providers, Toaster, grain overlay
│   ├── globals.css               # Global styles, CSS tokens, keyframe animations
│   ├── favicon.ico
│   └── (main)/                   # Route group (shares Navbar + Footer layout)
│       ├── layout.tsx            # Injects Navbar, SiteConfigProvider, Footer
│       ├── page.tsx              # Home page (SSG: fetches hero slides at build time)
│       ├── about/page.tsx        # About page
│       ├── contact/page.tsx      # Contact page
│       ├── checkout/page.tsx     # Checkout / cart review page
│       └── products/
│           ├── page.tsx          # Product listing page (client-side search + filter)
│           └── [slug]/page.tsx   # Product detail (dynamic route)
│
├── components/                   # Shared UI components
│   ├── navbar.tsx                # Floating glass navbar + mobile fullscreen menu
│   ├── footer.tsx                # Dark footer — social, nav, contact info
│   ├── hero.tsx                  # Hero section with Framer Motion
│   ├── featured-products.tsx     # Featured products grid
│   ├── categories.tsx            # Category showcase grid
│   ├── brand-story.tsx           # Brand story / about section
│   ├── contact-section.tsx       # Inline contact form
│   ├── product-card.tsx          # Product card (image, name, price, variants)
│   ├── whatsapp-button.tsx       # Sticky floating WhatsApp CTA
│   ├── providers.tsx             # TanStack Query + Lenis smooth scroll providers
│   ├── site-config-provider.tsx  # Strapi site settings React context
│   ├── backgrounds/
│   │   ├── floating-particles.tsx  # Three.js / CSS particle backgrounds
│   │   └── animated-blob.tsx       # SVG morphing blob backgrounds
│   └── skeletons/
│       └── product-card-skeleton.tsx  # Shimmer skeleton for product cards
│
├── lib/                          # Utilities & business logic
│   ├── api.ts                    # All Strapi API fetch functions
│   ├── axios.ts                  # Configured Axios instance
│   ├── config.ts                 # App config (env vars with fallback defaults)
│   ├── store.ts                  # Zustand cart store (persisted to localStorage)
│   ├── types.ts                  # Full TypeScript type definitions for all Strapi models
│   └── utils.ts                  # cn() and getStrapiMedia() helpers
│
├── public/                       # Static assets
│   └── assets/hero.jpg           # Fallback hero image
│
├── .env.local                    # Local environment overrides (not committed)
├── next.config.ts                # Next.js config — static export, image remotePatterns
├── tsconfig.json                 # TypeScript config with path aliases (@/)
├── eslint.config.mjs             # ESLint config
└── postcss.config.mjs            # PostCSS / Tailwind v4 config
```

---

## 🎨 Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `primary` | `#F05A28` | Brand orange — CTAs, highlights, active states |
| `primary-light` | `#FF7A4D` | Hover states |
| `primary-dark` | `#D44A1E` | Pressed / active states |
| `cream` | `#FFF9F2` | Page background |
| `beige` | `#F6F1EA` | Card backgrounds |
| `charcoal` | `#222222` | Primary text |
| `charcoal-light` | `#444444` | Secondary text |
| `turmeric` | `#E8A838` | Gradient accent |
| `paprika` | `#C23B22` | Danger / hot accent |
| `olive` | `#6B7F3B` | Natural / organic accent |
| `peach` | `#FFDAB9` | Soft background blobs |
| `gold` | `#C5A55A` | Premium highlights |
| `muted` | `#999999` | Placeholder / helper text |
| `border` | `#E8E0D8` | Input & card borders |

### Typography

| Font | CSS Variable | Role |
|---|---|---|
| Playfair Display | `--font-playfair` | Display headings (editorial, serif) |
| DM Sans | `--font-dm-sans` | Body & UI text (clean, modern sans) |

### Custom CSS Animation Classes

| Class | Effect | Duration |
|---|---|---|
| `.glass` | Glassmorphism blur surface | — |
| `.text-gradient` | Orange → Turmeric gradient text | — |
| `.grain-overlay` | Full-page SVG noise texture | — |
| `.animate-float` | Gentle floating up/down | 6s loop |
| `.animate-blob` | Organic border-radius morph | 8s loop |
| `.animate-shimmer` | Loading shimmer sweep | 1.5s loop |
| `.animate-gradient` | Animated background shift | 8s loop |
| `.animate-spin-slow` | Full 360° rotation | 20s loop |
| `.animate-pulse-soft` | Soft opacity + scale pulse | 4s loop |

---

## 🌐 API Layer

All API calls live in [`lib/api.ts`](./lib/api.ts) via an Axios instance configured in `lib/axios.ts` pointing at `NEXT_PUBLIC_API_URL`.

### Endpoints

| Function | Method | Endpoint | Description |
|---|---|---|---|
| `getCategories()` | GET | `/categories?populate=*&sort=rank:asc` | All categories |
| `getCategory(slug)` | GET | `/categories?filters[slug][$eq]=...` | Single category |
| `getSubcategories()` | GET | `/subcategories?populate=*&sort=rank:asc` | All subcategories |
| `getProducts(params?)` | GET | `/products?...` | Filtered product listing |
| `getProduct(slug)` | GET | `/products?filters[slug][$eq]=...` | Single product |
| `getFeaturedProducts()` | GET | `/products?filters[isFeatured][$eq]=true&...` | Featured products |
| `getHeroSlides()` | GET | `/hero-slides?populate=*&sort=rank:asc` | Hero slides |
| `getTestimonials()` | GET | `/testimonials?populate=*&sort=rank:asc` | Testimonials |
| `getGallery()` | GET | `/gallery-items?populate=*&sort=rank:asc` | Gallery items |
| `getSiteSettings()` | GET | `/site-config?populate=*` | Global site config |
| `submitContactForm(payload)` | POST | `/contact-submissions` | Submit contact form |

### Strapi Data Models (TypeScript)

| Model | Key Fields |
|---|---|
| `Category` | `name`, `slug`, `image`, `rank`, `subcategories[]` |
| `Subcategory` | `name`, `slug`, `image`, `rank`, `category` |
| `Product` | `name`, `slug`, `price`, `mrp`, `thumbnail`, `images[]`, `variants[]`, `isFeatured`, `availability`, `rank`, SEO fields |
| `ProductVariant` | `name`, `price`, `mrp`, `sku`, `stock` |
| `HeroSlide` | `title`, `subtitle`, `image`, `ctaText`, `ctaLink`, `rank` |
| `Testimonial` | `name`, `designation`, `quote`, `image`, `rank` |
| `GalleryItem` | `title`, `image`, `category`, `rank` |
| `SiteSetting` | `siteName`, `siteTagline`, `whatsappNumber`, `email`, `phone`, `address`, social URLs, `logo` |
| `ContactSubmission` | `name`, `email`, `subject`, `message`, `status` |

Product `availability` values: `"in-stock"` | `"out-of-season"` | `"pre-order"`

---

## 🗃️ State Management

### Server State — TanStack Query
Strapi data is managed by **React Query v5**. Query keys include resource type + active filters (e.g. `["products", selectedCategory]`). The `Providers` component wraps the app with `QueryClientProvider`.

### Client State — Zustand Cart

```ts
interface CartItem {
  variantId: string
  productId: string
  name: string          // variant name
  productName: string
  price: number
  quantity: number
  imageUrl?: string
}

// Store actions
addItem(item: CartItem): void        // merges quantity if variant already exists
removeItem(variantId: string): void
updateQuantity(variantId: string, quantity: number): void
clearCart(): void

// Computed getters
get totalAmount(): number            // sum of price × quantity
get itemCount(): number              // sum of all quantities
```

Persisted to `localStorage` under key `"shopping-cart"`.

---

## 🔧 Environment Variables

Create `.env.local` in the project root:

```env
# Internal API on port 3000 (No Strapi required)
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional — defaults shown below
NEXT_PUBLIC_SITE_NAME=SpicyGlaze
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_GOOGLE_ANALYTICS=
```

> **Note:** All env vars must have the `NEXT_PUBLIC_` prefix to be accessible in the browser bundle.

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm (or yarn / pnpm)
- A running Strapi instance (see `NEXT_PUBLIC_API_URL`)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-org/spicy-glaze.git
cd spicy-glaze

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.local.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL to your Strapi backend

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server with hot reload |
| `npm run build` | Build static export to `out/` |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run ESLint |

---

## 🚢 Deployment

This project is configured for **Next.js Static Export** (`output: "export"`). The `npm run build` command produces an `out/` directory of pure static HTML/CSS/JS — no Node.js runtime needed.

### Build

```bash
npm run build
# → Output: ./out/
```

### Hosting Options

| Platform | Notes |
|---|---|
| **Vercel** | Connect GitHub repo; zero-config |
| **Netlify** | Connect repo or drag-and-drop `out/` |
| **AWS S3 + CloudFront** | Upload `out/` to S3, serve via CloudFront |
| **Any static server** | Serve `out/` over HTTPS |

> **Image optimization:** Static export requires `images.unoptimized: true`. Product images are served directly from Strapi's S3-hosted URLs (`*.s3.amazonaws.com`).

---

## 🗺️ Known Limitations & Future Work

### Current Limitations

| Area | Status |
|---|---|
| Payment gateway | ❌ Not implemented — WhatsApp is current order channel |
| Order management | ❌ No order storage or tracking |
| User authentication | ❌ No accounts or login |
| Wishlist | ❌ Not implemented |
| Testimonials display | ⚠️ Data model exists in Strapi, UI section not yet added to homepage |
| Gallery section | ⚠️ Data model exists in Strapi, UI section not yet added |
| Google Analytics | ⚠️ Env var wired, GA4 script not yet injected |

### Suggested Future Features

- [ ] **Razorpay / PhonePe / UPI** payment integration
- [ ] **User auth** — email / Google / phone OTP (NextAuth or Clerk)
- [ ] **Order history** page linked to user accounts
- [ ] **Wishlist** persisted to Strapi backend
- [ ] **Product reviews & ratings** (add to Strapi schema)
- [ ] **Testimonials homepage section** (API already implemented)
- [ ] **Photo gallery section** (API already implemented)
- [ ] **Coupon / promo code** system
- [ ] **Google Analytics GA4** integration
- [ ] **PWA** — service worker + offline caching
- [ ] **Sitemap.xml** auto-generation for SEO
- [ ] **ISR / Server Components** — migrate from static export for real-time product updates

---

## 📄 License

Private & proprietary. © 2024 SpicyGlaze. All rights reserved.

---

<p align="center">Crafted with ❤️ in India</p>

# Spicy-Glaze
