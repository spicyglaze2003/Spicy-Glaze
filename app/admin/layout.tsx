"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";
import { useAdminAuth } from "@/lib/admin-auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoginPage =
    pathname.includes("/login") ||
    pathname === "/admin/login" ||
    pathname === "/admin/login/" ||
    pathname === "/adminkavinspicyglaze/login" ||
    pathname === "/adminkavinspicyglaze/login/";

  useEffect(() => {
    if (mounted && !isAuthenticated && !isLoginPage) {
      router.push("/adminkavinspicyglaze/login/");
    }
  }, [mounted, isAuthenticated, isLoginPage, router]);

  // Login page gets its own layout (no sidebar)
  if (isLoginPage) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    );
  }

  // Don't flash content before auth check
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">
          <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
