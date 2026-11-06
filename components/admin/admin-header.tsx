"use client";

import { useState } from "react";
import { Bell, Menu, Search, ExternalLink, X } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const { session } = useAdminAuth();
  const router = useRouter();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setMobileSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 lg:px-8 shadow-xs">
      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="absolute inset-0 bg-white z-40 flex items-center px-4 gap-2">
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, orders, catalog..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400"
            />
          </form>
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors cursor-pointer text-gray-700"
          title="Open Menu"
        >
          <Menu size={22} />
        </button>

        {/* Brand for mobile */}
        <Link href="/admin" className="lg:hidden flex items-center gap-1.5 font-bold text-gray-900 text-sm">
          <span>🌶️</span>
          <span className="tracking-tight">Spicy<span className="text-orange-500">Glaze</span></span>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 w-[280px] lg:w-[320px] border border-gray-100 focus-within:border-orange-500 focus-within:bg-white transition-all">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, SKU, catalog..."
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400"
          />
        </form>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Mobile Search Button */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 cursor-pointer"
          title="Search"
        >
          <Search size={18} />
        </button>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors px-2.5 sm:px-3 py-1.5 rounded-xl hover:bg-orange-50 border border-transparent hover:border-orange-100"
        >
          <ExternalLink size={14} className="text-orange-500" />
          <span className="hidden sm:inline">Storefront</span>
        </Link>

        <button className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-600 cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-gray-200">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-sm">
            {session?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="hidden md:block">
            <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">{session?.name || "Admin"}</p>
            <p className="text-[10px] text-gray-400 capitalize">
              {session?.role?.replace("-", " ") || "Super Admin"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
