"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Plus,
  FolderTree,
  Layers,
  Package,
  AlertTriangle,
  ShoppingCart,
  Users,
  Ticket,
  Image as ImageIcon,
  MessageSquare,
  Star,
  BarChart3,
  Bot,
  Settings,
  Shield,
  ClipboardList,
  ChevronDown,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/lib/admin-auth";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: NavItem[];
  badge?: string | number;
}

const navigation: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/products",
    label: "Products",
    icon: ShoppingBag,
    children: [
      { href: "/admin/products", label: "All Products", icon: ShoppingBag },
      { href: "/admin/products/new", label: "Add Product", icon: Plus },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/subcategories", label: "Subcategories", icon: Layers },
    ],
  },
  {
    href: "/admin/inventory",
    label: "Inventory",
    icon: Package,
    children: [
      { href: "/admin/inventory", label: "Stock", icon: Package },
      { href: "/admin/inventory/low-stock", label: "Low Stock", icon: AlertTriangle },
    ],
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingCart,
  },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  {
    href: "/admin/content",
    label: "Website",
    icon: ImageIcon,
    children: [
      { href: "/admin/hero", label: "Hero", icon: ImageIcon },
      { href: "/admin/testimonials", label: "Testimonials", icon: Star },
      { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
    ],
  },
  { href: "/admin/contact-messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/ai-assistant", label: "AI Assistant", icon: Bot },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/users", label: "Admin Users", icon: Shield },
  { href: "/admin/activity-logs", label: "Activity Logs", icon: ClipboardList },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { session, logout } = useAdminAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin" || pathname === "/admin/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[280px] bg-[#1a1a2e] text-white flex flex-col transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-2xl">🌶️</span>
            <div>
              <span className="font-bold text-lg tracking-tight">
                Spicy<span className="text-orange-400">Glaze</span>
              </span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-white/40">
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedSections.includes(item.label) || (hasChildren && item.children!.some((c) => isActive(c.href)));

            if (hasChildren) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleSection(item.label)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-orange-500/15 text-orange-400"
                        : "text-white/60 hover:bg-white/5 hover:text-white/90"
                    )}
                  >
                    <Icon size={18} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      size={14}
                      className={cn(
                        "transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = isActive(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                              childActive
                                ? "bg-orange-500/15 text-orange-400 font-medium"
                                : "text-white/50 hover:bg-white/5 hover:text-white/80"
                            )}
                          >
                            <ChildIcon size={14} />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-orange-500/15 text-orange-400"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-orange-500 text-white rounded-full px-2 py-0.5">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-sm font-bold">
              {session?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.name || "Admin"}</p>
              <p className="text-xs text-white/40 capitalize">
                {session?.role?.replace("-", " ") || "Super Admin"}
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = "/adminkavinspicyglaze/login/";
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
