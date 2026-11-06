import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Normalizes any image URL, converting Google Drive share links, Google Photos,
 * Unsplash page links, Dropbox links, and relative paths into directly loadable image URLs.
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Already a proxied drive image URL
  if (trimmed.startsWith("/api/drive-image/")) {
    return trimmed;
  }

  // 1. Google Drive & googleusercontent URLs
  // Handles:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?id=FILE_ID
  // - https://docs.google.com/file/d/FILE_ID
  // - https://lh3.googleusercontent.com/d/FILE_ID
  if (
    trimmed.includes("drive.google.com") ||
    trimmed.includes("docs.google.com") ||
    trimmed.includes("googleusercontent.com/d/") ||
    (trimmed.includes("googleusercontent.com") && trimmed.includes("/d/"))
  ) {
    const fileIdMatch =
      trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
      trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);

    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      // Routes through local proxy to bypass browser referer & CORS restrictions
      return `/api/drive-image/${fileId}`;
    }
  }

  // 2. Google Photos / direct User Content links
  if (trimmed.includes("lh3.googleusercontent.com")) {
    return trimmed;
  }

  // 3. Unsplash Page URLs (e.g. https://unsplash.com/photos/scoop-with-white-powder-S9NchuPb79I)
  if (trimmed.includes("unsplash.com/photos/")) {
    const photoIdMatch = trimmed.match(
      /unsplash\.com\/photos\/(?:.*-)?([a-zA-Z0-9_-]+)(?:[/?#]|$)/
    );
    if (photoIdMatch && photoIdMatch[1]) {
      const photoId = photoIdMatch[1];
      return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1000&q=80`;
    }
  }

  // 4. Dropbox URLs (turn dl=0 to raw=1)
  if (trimmed.includes("dropbox.com")) {
    return trimmed.replace("dl=0", "raw=1");
  }

  // 5. Relative Strapi uploads or local assets
  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("/uploads/") && process.env.NEXT_PUBLIC_API_URL) {
      return `${process.env.NEXT_PUBLIC_API_URL.replace("/api", "")}${trimmed}`;
    }
    return trimmed;
  }

  // 6. Absolute http/https URLs
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return trimmed;
}

export function getStrapiMedia(url: string | null | undefined): string {
  if (!url) return "/placeholder.png";
  const normalized = normalizeImageUrl(url);
  return normalized || "/placeholder.png";
}

export function getProductImageUrl(product: any): string {
  if (!product) return "/placeholder.png";
  const raw =
    product.imageUrl ||
    product.image ||
    (typeof product.thumbnail === "string" ? product.thumbnail : product.thumbnail?.url) ||
    (Array.isArray(product.images) &&
      (typeof product.images[0] === "string" ? product.images[0] : product.images[0]?.url)) ||
    "";
  const normalized = normalizeImageUrl(raw);
  return normalized || "/placeholder.png";
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
