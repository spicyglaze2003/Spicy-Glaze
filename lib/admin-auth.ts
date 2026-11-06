import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminRole } from "./admin-types";

export interface AdminSession {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  token: string;
  avatar?: string | null;
}

interface AdminAuthStore {
  session: AdminSession | null;
  isAuthenticated: boolean;
  login: (session: AdminSession) => void;
  logout: () => void;
  updateSession: (partial: Partial<AdminSession>) => void;
}

export const useAdminAuth = create<AdminAuthStore>()(
  persist(
    (set) => ({
      session: null,
      isAuthenticated: false,
      login: (session) => set({ session, isAuthenticated: true }),
      logout: () => set({ session: null, isAuthenticated: false }),
      updateSession: (partial) =>
        set((state) => ({
          session: state.session ? { ...state.session, ...partial } : null,
        })),
    }),
    { name: "admin-auth" }
  )
);

// Permission matrix
const PERMISSIONS: Record<AdminRole, string[]> = {
  "super-admin": ["*"],
  manager: ["products", "inventory", "orders", "customers", "coupons", "content", "messages", "analytics", "ai"],
  "product-manager": ["products", "inventory:read", "content", "ai"],
  "inventory-manager": ["inventory", "products:read", "ai"],
  "order-manager": ["orders", "customers", "ai"],
  "content-manager": ["content", "messages", "ai"],
  "support-agent": ["orders:read", "customers", "messages", "ai"],
};

export function hasPermission(role: AdminRole, resource: string, action: "read" | "write" = "write"): boolean {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes("*")) return true;
  if (perms.includes(resource)) return true;
  if (action === "read" && perms.includes(`${resource}:read`)) return true;
  return false;
}
