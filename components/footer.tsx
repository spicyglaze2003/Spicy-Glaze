"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { BsInstagram, BsFacebook, BsWhatsapp } from "react-icons/bs";
import { useSiteConfig, cleanPhoneNumber } from "@/components/site-config-provider";

const footerLinks = {
  products: [
    { href: "/products/", label: "All Products" },
  ],
  company: [
    { href: "/", label: "Home" },
    { href: "/about/", label: "About Us" },
    { href: "/contact/", label: "Contact" },
  ],
};

export default function Footer() {
  const siteConfig = useSiteConfig();
  const waNum = cleanPhoneNumber(siteConfig.whatsappNumber);
  const email = siteConfig.email || "hello@spicyglaze.in";
  const phone = siteConfig.phone || "+91 98765 43210";
  const address = siteConfig.address || "India";
  const tagline = siteConfig.siteTagline || "Naturally crafted goodness, packed with authentic flavours.";

  return (
    <footer className="relative bg-charcoal text-white/80 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 -translate-y-[99%]">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 120L48 108C96 96 192 72 288 66C384 60 480 72 576 78C672 84 768 84 864 78C960 72 1056 60 1152 60C1248 60 1344 72 1392 78L1440 84V120H0Z" fill="#222222"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <span className="font-[var(--font-playfair)] text-3xl font-bold text-white">
              Spicy<span className="text-primary">Glaze</span>
            </span>
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              {tagline}
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href={`https://wa.me/${waNum}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="WhatsApp"
              >
                <BsWhatsapp size={16} />
              </a>
              {siteConfig.instagramUrl && (
                <a href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors" aria-label="Instagram">
                  <BsInstagram size={16} />
                </a>
              )}
              {siteConfig.facebookUrl && (
                <a href={siteConfig.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors" aria-label="Facebook">
                  <BsFacebook size={16} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Products</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <Mail size={16} className="mt-0.5 shrink-0" />
                <span>{email}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <Phone size={16} className="mt-0.5 shrink-0" />
                <span>{phone}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} SpicyGlaze. All rights reserved.</p>
          <p className="text-xs text-white/40">Crafted with <span className="text-primary">&#9829;</span> in India</p>
        </div>
      </div>

      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-turmeric/5 rounded-full blur-3xl animate-pulse-soft" />
    </footer>
  );
}
