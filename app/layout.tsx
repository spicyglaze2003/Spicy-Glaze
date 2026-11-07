import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FFF9F2",
};

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SpicyGlaze — Naturally Crafted Goodness",
    template: "%s | SpicyGlaze",
  },
  description:
    "Premium naturally crafted packaged food products. Authentic flavours, handcrafted with love.",
  keywords: [
    "SpicyGlaze",
    "natural food",
    "packaged food",
    "authentic flavours",
    "handcrafted",
    "premium food",
    "spices",
    "Indian food",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://spicyglaze.in",
    siteName: "SpicyGlaze",
    title: "SpicyGlaze — Naturally Crafted Goodness",
    description:
      "Premium naturally crafted packaged food products. Authentic flavours, handcrafted with love.",
  },
  robots: {
    index: true,
    follow: true,
  },
  referrer: "no-referrer-when-downgrade",
};

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} antialiased`}
    >
      <body className="min-h-screen bg-cream text-charcoal">
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
