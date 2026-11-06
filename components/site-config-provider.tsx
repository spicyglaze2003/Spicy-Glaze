"use client";

import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSiteSettings } from "@/lib/api";
import type { SiteSetting } from "@/lib/types";

const defaultSettings: SiteSetting = {
  id: 0,
  documentId: "",
  siteName: "spicyglaze",
  siteTagline: "Naturally Crafted Goodness",
  whatsappNumber: "7305256022",
  whatsappMessage: "Hi! I'm interested in spicyglaze products.",
  email: "spicyglazesupport@gmail.com",
  phone: "7305256022",
  address: "Erode - 638004 ,Tamilnadu",
  instagramUrl: "https://instagram.com/spicyglaze.in",
  facebookUrl: "https://facebook.com/spicyglazeEco",
  twitterUrl: null,
  aboutText: "spicyglaze brings you naturally crafted goodness with pure authentic spices and zero preservatives.",
  logo: null,
  createdAt: "",
  updatedAt: "",
  publishedAt: "",
};

const SiteConfigContext = createContext<SiteSetting>(defaultSettings);

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettings,
    staleTime: 60 * 1000,
  });

  const settings = data?.data || defaultSettings;

  return (
    <SiteConfigContext.Provider value={settings}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}

export function cleanPhoneNumber(phone?: string | null): string {
  if (!phone) return "917305256022";
  return phone.replace(/[^0-9]/g, "");
}
