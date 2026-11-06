export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
}

export interface StrapiMedia {
  id: number;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: Record<string, { url: string; width: number; height: number }>;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string | null;
  image: StrapiMedia | null;
  rank: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string | null;
  image: StrapiMedia | null;
  rank: number;
  category?: Category;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Product {
  id: number;
  documentId: string;
  productId?: string;
  productName?: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  mrp: number | null;
  stock?: number;
  image?: string | null;
  imageUrl?: string | null;
  thumbnail: StrapiMedia | null;
  images: StrapiMedia[];
  category?: Category;
  subcategory?: Subcategory;
  isFeatured: boolean;
  isActive: boolean;
  availability: "in-stock" | "out-of-season" | "pre-order";
  rank: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface ProductVariant {
  id: number;
  documentId: string;
  name: string;
  price: number;
  mrp: number | null;
  sku: string | null;
  stock: number;
  product?: Product;
}

export interface HeroSlide {
  id: number;
  documentId: string;
  title: string;
  subtitle: string | null;
  image: StrapiMedia | null;
  ctaText: string | null;
  ctaLink: string | null;
  rank: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Testimonial {
  id: number;
  documentId: string;
  name: string;
  designation: string | null;
  quote: string;
  image: StrapiMedia | null;
  rank: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface GalleryItem {
  id: number;
  documentId: string;
  title: string | null;
  image: StrapiMedia | null;
  category: string | null;
  rank: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface ContactSubmission {
  id: number;
  documentId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: string;
  updatedAt: string;
}

export interface SiteSetting {
  id: number;
  documentId: string;
  siteName: string;
  siteTagline: string | null;
  whatsappNumber: string | null;
  whatsappMessage: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  aboutText: string | null;
  logo: StrapiMedia | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
