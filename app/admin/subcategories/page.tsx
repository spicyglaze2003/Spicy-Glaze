"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  FolderTree,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminSubcategories,
  getAdminCategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "@/lib/admin-api";
import type { Subcategory, Category } from "@/lib/types";

export default function SubcategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [rank, setRank] = useState<number>(1);

  const { data: subcategoriesData, isLoading } = useQuery({
    queryKey: ["admin-subcategories"],
    queryFn: getAdminSubcategories,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAdminCategories,
  });

  const subcategories: Subcategory[] = subcategoriesData?.data || [];
  const categories: Category[] = categoriesData?.data || [];

  const filtered = subcategories.filter((sc) => {
    const matchesSearch =
      sc.name.toLowerCase().includes(search.toLowerCase()) ||
      sc.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "all" ||
      String((sc as any).category?.id) === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openCreateModal = () => {
    setEditingSubcategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setCategoryId(categories[0]?.id);
    setRank(subcategories.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (sc: Subcategory) => {
    setEditingSubcategory(sc);
    setName(sc.name);
    setSlug(sc.slug);
    setDescription((sc as any).description || "");
    setCategoryId((sc as any).category?.id);
    setRank(sc.rank || 1);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingSubcategory) {
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
      if (!name.trim()) throw new Error("Subcategory name is required");
      if (!slug.trim()) throw new Error("Slug is required");
      if (!categoryId) throw new Error("Parent category is required");

      if (editingSubcategory) {
        return await updateSubcategory(String(editingSubcategory.id), {
          name,
          slug,
          description,
          category: categoryId,
          rank,
        });
      } else {
        return await createSubcategory({
          name,
          slug,
          description,
          category: categoryId,
          rank,
        });
      }
    },
    onSuccess: () => {
      toast.success(editingSubcategory ? "Subcategory updated!" : "Subcategory created!");
      queryClient.invalidateQueries({ queryKey: ["admin-subcategories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || "Failed to save");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteSubcategory(String(id));
    },
    onSuccess: () => {
      toast.success("Subcategory deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-subcategories"] });
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
            <Layers className="text-orange-500" />
            Subcategories Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create refined product groupings nested under primary categories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm rounded-xl shadow-md hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Subcategory
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subcategories..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium text-gray-700 outline-none focus:border-orange-500"
          >
            <option value="all">All Parent Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Total: <strong>{filtered.length}</strong>
          </span>
        </div>
      </div>

      {/* Subcategories Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="py-3.5 px-6">Rank</th>
                <th className="py-3.5 px-6">Subcategory</th>
                <th className="py-3.5 px-6">Slug</th>
                <th className="py-3.5 px-6">Parent Category</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Loading subcategories...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No subcategories found.
                  </td>
                </tr>
              ) : (
                filtered.map((sc) => (
                  <tr key={sc.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-700">
                      #{sc.rank || 1}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{sc.name}</div>
                      {(sc as any).description && (
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {(sc as any).description}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
                        {sc.slug}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold">
                        <FolderTree size={12} />
                        {(sc as any).category?.name || "Unassigned"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(sc)}
                        className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit subcategory"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete subcategory "${sc.name}"?`)) {
                            deleteMutation.mutate(sc.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete subcategory"
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">
                {editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}
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
                  Parent Category *
                </label>
                <select
                  required
                  value={categoryId || ""}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Select a Parent Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Kashmiri Saffron"
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
                  placeholder="kashmiri-saffron"
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
                  placeholder="Brief notes about this subcategory..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Sort Rank
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
                  {saveMutation.isPending ? "Saving..." : editingSubcategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
