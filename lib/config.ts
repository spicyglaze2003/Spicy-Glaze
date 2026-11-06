export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "spicyglaze",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "7305256022",
  googleAnalytics: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || "",
} as const;
