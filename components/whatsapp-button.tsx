"use client";

import { MessageCircle } from "lucide-react";
import { useSiteConfig, cleanPhoneNumber } from "@/components/site-config-provider";

export default function WhatsAppButton() {
  const siteConfig = useSiteConfig();
  const waNum = cleanPhoneNumber(siteConfig.whatsappNumber);
  const waMsg = siteConfig.whatsappMessage || "Hi! I'm interested in SpicyGlaze products.";

  return (
    <a
      href={`https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 transition-transform duration-300 group md:hidden"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={24} className="text-white" />
      <span className="absolute right-full mr-3 bg-charcoal text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with us!
      </span>
    </a>
  );
}

