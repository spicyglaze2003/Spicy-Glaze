"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ShoppingCart } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import { HiMenuAlt3 } from "react-icons/hi";
import { cn } from "@/lib/utils";
import { useSiteConfig, cleanPhoneNumber } from "@/components/site-config-provider";
import { useCartStore } from "@/lib/store";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "/products/", label: "Products" },
  { href: "/contact/", label: "Contact" },
];

export default function Navbar() {
  const siteConfig = useSiteConfig();
  const waNum = cleanPhoneNumber(siteConfig.whatsappNumber);
  const waMsg = siteConfig.whatsappMessage || "Hi! I'm interested in SpicyGlaze products.";

  const { items, openCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCount = mounted
    ? items.reduce((count, item) => count + (Number(item.quantity) || 1), 0)
    : 0;

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Floating Navbar */}
      <nav
        className={cn(
          "fixed z-50 transition-all duration-300 ease-out top-4 left-3 right-3 sm:left-4 sm:right-4",
          scrolled
            ? "md:top-4 md:left-1/2 md:-translate-x-1/2 md:max-w-3xl glass rounded-full py-2.5 sm:py-3 px-4 shadow-lg shadow-charcoal/5"
            : "md:top-6 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl glass rounded-full py-2.5 sm:py-3 px-4"
        )}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 pl-2">
            <span className="font-[var(--font-playfair)] text-xl md:text-2xl font-bold text-charcoal tracking-tight">
              {siteConfig.siteName ? (
                <>
                  {siteConfig.siteName.slice(0, Math.ceil(siteConfig.siteName.length / 2))}
                  <span className="text-primary">{siteConfig.siteName.slice(Math.ceil(siteConfig.siteName.length / 2))}</span>
                </>
              ) : (
                <>Spicy<span className="text-primary">Glaze</span></>
              )}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-charcoal-light hover:text-primary transition-colors px-4 py-2 rounded-full hover:bg-primary/5 group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-6 rounded-full" />
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Cart Button with Count Badge */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-1.5 py-2 px-2.5 sm:px-3 rounded-full bg-cream hover:bg-orange-100/70 border border-orange-200/60 text-charcoal hover:text-primary transition-all duration-300 shadow-sm hover:shadow cursor-pointer group"
              aria-label={`Shopping cart with ${totalCount} items`}
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart size={18} className="text-charcoal group-hover:text-primary transition-colors" />
                {totalCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shadow-md animate-scale-in">
                    {totalCount > 99 ? "99+" : totalCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-charcoal group-hover:text-primary transition-colors">
                Cart
              </span>
            </button>

            <a
              href={`https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-dark transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
            >
              <BsWhatsapp size={15} />
              <span className="hidden lg:inline">WhatsApp</span>
            </a>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <HiMenuAlt3 size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Full-Screen Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-[60] md:hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          mobileOpen
            ? "opacity-100 pointer-events-auto visible"
            : "opacity-0 pointer-events-none invisible"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-cream transition-opacity duration-700",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
        />

        {/* Content */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
            mobileOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          )}
        >
          {/* Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-charcoal/5 text-charcoal hover:bg-charcoal/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>

          {/* Logo */}
          <div
            className={cn(
              "mb-12 transition-all duration-500 delay-100",
              mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <span className="font-[var(--font-playfair)] text-4xl font-bold text-charcoal">
              {siteConfig.siteName ? (
                <>
                  {siteConfig.siteName.slice(0, Math.ceil(siteConfig.siteName.length / 2))}
                  <span className="text-primary">{siteConfig.siteName.slice(Math.ceil(siteConfig.siteName.length / 2))}</span>
                </>
              ) : (
                <>Spicy<span className="text-primary">Glaze</span></>
              )}
            </span>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col items-center gap-2">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "font-[var(--font-playfair)] text-4xl sm:text-5xl font-semibold text-charcoal hover:text-primary transition-all duration-500 py-2 sm:py-3",
                  mobileOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                )}
                style={{ transitionDelay: mobileOpen ? `${150 + i * 80}ms` : "0ms" }}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Cart Option */}
            <button
              onClick={() => {
                setMobileOpen(false);
                openCart();
              }}
              className={cn(
                "font-[var(--font-playfair)] text-3xl sm:text-4xl font-bold text-primary flex items-center gap-3 transition-all duration-500 py-3 mt-2 cursor-pointer",
                mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
              style={{ transitionDelay: mobileOpen ? `${150 + navLinks.length * 80}ms` : "0ms" }}
            >
              <div className="relative">
                <ShoppingCart size={28} />
                {totalCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-charcoal text-white text-[10px] font-black flex items-center justify-center shadow-md">
                    {totalCount}
                  </span>
                )}
              </div>
              <span>Cart ({totalCount})</span>
            </button>
          </div>

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full text-lg font-medium mt-12 hover:bg-primary-dark transition-all duration-500 shadow-xl shadow-primary/25 hover:scale-105",
              mobileOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            )}
            style={{ transitionDelay: mobileOpen ? "600ms" : "0ms" }}
          >
            <BsWhatsapp size={20} />
            Chat on WhatsApp
          </a>

          {/* Decorative Blobs */}
          <div
            className={cn(
              "absolute -bottom-32 -right-32 w-72 h-72 bg-primary/8 rounded-full blur-3xl transition-all duration-1000",
              mobileOpen ? "opacity-100 scale-100" : "opacity-0 scale-50"
            )}
          />
          <div
            className={cn(
              "absolute -top-32 -left-32 w-56 h-56 bg-turmeric/8 rounded-full blur-3xl transition-all duration-1000 delay-200",
              mobileOpen ? "opacity-100 scale-100" : "opacity-0 scale-50"
            )}
          />
        </div>
      </div>
    </>
  );
}
