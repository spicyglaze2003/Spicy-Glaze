"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Layers,
  ArrowUpDown,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/admin-api";
import type { Category } from "@/lib/types";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [rank, setRank] = useState<number>(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAdminCategories,
  });

  const categories = data?.data || [];
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setRank(categories.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription((cat as any).description || "");
    setRank(cat.rank || 1);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Category name is required");
      if (!slug.trim()) throw new Error("Slug is required");

      if (editingCategory) {
        return await updateCategory(String(editingCategory.id), {
          name,
          slug,
          description,
          rank,
        });
      } else {
        return await createCategory({
          name,
          slug,
          description,
          rank,
        });
      }
    },
    onSuccess: () => {
      toast.success(editingCategory ? "Category updated!" : "Category created!");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || "Failed to save category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteCategory(String(id));
    },
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || "Failed to delete");
    },
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <FolderTree className="text-orange-500" />
            Categories Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize products into major departments shown in the store navigation and filter pills.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm rounded-xl shadow-md hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Category
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
            placeholder="Search categories by name or slug..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Total: <span className="font-bold text-gray-900">{categories.length}</span> categories
        </div>
      </div>

      {/* Categories Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="py-3.5 px-6">Rank</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Slug</th>
                <th className="py-3.5 px-6">Subcategories</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Loading categories...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No categories found. Click "Add Category" to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-700">
                      #{cat.rank || 1}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{cat.name}</div>
                      {(cat as any).description && (
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {(cat as any).description}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
                        {cat.slug}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium">
                        <Layers size={13} />
                        {cat.subcategories?.length || 0} subcategories
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit category"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                            deleteMutation.mutate(cat.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-400">Loading categories...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No categories found.</div>
          ) : (
            filtered.map((cat) => (
              <div key={`m-${cat.id}`} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-400">#{cat.rank || 1}</span>
                    <span className="font-bold text-gray-900 text-sm truncate">{cat.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-1 font-mono">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px]">{cat.slug}</span>
                    <span>•</span>
                    <span className="text-orange-600 font-sans font-medium">{cat.subcategories?.length || 0} subs</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                        deleteMutation.mutate(cat.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Spices & Seasonings"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="spices-seasonings"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for category badges and meta tags..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Sort Rank / Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={rank}
                  onChange={(e) => setRank(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                />
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
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm rounded-xl shadow-md hover:from-orange-600 hover:to-amber-600 disabled:opacity-50"
                >
                  {saveMutation.isPending ? "Saving..." : editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
