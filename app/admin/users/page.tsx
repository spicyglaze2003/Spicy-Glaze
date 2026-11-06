"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  Plus,
  Search,
  Mail,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getAdminUsers, createAdminUser, deleteAdminUser } from "@/lib/admin-api";
import type { AdminUser, AdminRole } from "@/lib/admin-types";



const roleLabels: Record<AdminRole, { label: string; bg: string; text: string }> = {
  "super-admin": { label: "Super Admin", bg: "bg-red-50", text: "text-red-700" },
  manager: { label: "General Manager", bg: "bg-purple-50", text: "text-purple-700" },
  "product-manager": { label: "Product Manager", bg: "bg-blue-50", text: "text-blue-700" },
  "inventory-manager": { label: "Inventory Manager", bg: "bg-amber-50", text: "text-amber-800" },
  "order-manager": { label: "Order Manager", bg: "bg-teal-50", text: "text-teal-700" },
  "content-manager": { label: "Content Editor", bg: "bg-indigo-50", text: "text-indigo-700" },
  "support-agent": { label: "Support Agent", bg: "bg-gray-100", text: "text-gray-700" },
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("manager");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => getAdminUsers(search),
  });

  const users: AdminUser[] = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (payload: Partial<AdminUser>) => createAdminUser(payload),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`Admin user ${res.data?.name || name} created!`);
      setIsModalOpen(false);
      setName("");
      setEmail("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message || "Failed to create admin user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User access revoked");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete admin user");
    },
  });

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    createMutation.mutate({
      name,
      email,
      role,
    });
  };

  const handleDelete = (id: number, userName: string) => {
    if (confirm(`Remove admin access for ${userName}?`)) {
      deleteMutation.mutate(String(id));
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Shield className="text-orange-500" />
            Admin Users & Permissions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage administrative staff access levels and assign role-based permissions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm rounded-xl shadow-md hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Admin User
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/80 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="py-3.5 px-6">User</th>
                <th className="py-3.5 px-6">Assigned Role</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Last Login</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => {
                const roleBadge = roleLabels[u.role] || roleLabels.manager;
                return (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail size={12} className="text-gray-400" />
                        {u.email}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${roleBadge.bg} ${roleBadge.text}`}
                      >
                        <Shield size={12} />
                        {roleBadge.label}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-gray-500">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("en-IN") : "Never"}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {u.role !== "super-admin" && (
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Revoke access"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Invite Admin Staff</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Work Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="suresh@spicyglaze.in"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Role & Access Level
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="manager">General Manager (Products, Orders, Customers)</option>
                  <option value="inventory-manager">Inventory Manager (Stock & Adjustments)</option>
                  <option value="product-manager">Product Manager (Catalogue & Categories)</option>
                  <option value="content-manager">Content Editor (Hero, Testimonials, Gallery)</option>
                  <option value="order-manager">Order Manager (Order Fulfilment)</option>
                  <option value="support-agent">Support Agent (Inquiries & Messages)</option>
                  <option value="super-admin">Super Admin (Full Unrestricted Access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm rounded-xl shadow-md hover:from-orange-600 hover:to-amber-600"
                >
                  Create & Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
