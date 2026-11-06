"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminGallery,
  createGalleryItem,
  deleteGalleryItem,
} from "@/lib/admin-api";
import type { GalleryItem } from "@/lib/types";

export default function GalleryPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Artisanal Craft");
  const [rank, setRank] = useState<number>(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: getAdminGallery,
  });

  const galleryItems: GalleryItem[] = data?.data || [];

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Title is required");
      return await createGalleryItem({
        title,
        category,
        rank,
      });
    },
    onSuccess: () => {
      toast.success("Gallery item added!");
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      setIsModalOpen(false);
      setTitle("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || "Failed to add item");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteGalleryItem(String(id));
    },
    onSuccess: () => {
      toast.success("Gallery item deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
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
            <ImageIcon className="text-orange-500" />
            Photo Gallery
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage product photos, culinary snapshots and brand visuals for the website gallery.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle("");
            setRank(galleryItems.length + 1);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm rounded-xl shadow-md hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Photo
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-gray-400">
            Loading gallery...
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
            No gallery items yet. Click "Add Photo" to upload your first image.
          </div>
        ) : (
          galleryItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden group hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="h-44 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative">
                <ImageIcon size={32} className="text-orange-300" />
                <button
                  onClick={() => {
                    if (confirm(`Delete "${item.title}"?`)) {
                      deleteMutation.mutate(item.id);
                    }
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-white/80 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Delete image"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1 text-orange-600">
                    <Tag size={12} /> {item.category || "General"}
                  </span>
                  <span>Rank #{item.rank || 1}</span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm truncate">{item.title}</h4>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Add Photo to Gallery</h3>
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
                createMutation.mutate();
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Photo Caption / Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Traditional sun-drying of red chillies"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Tag / Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Farm, Craft, Ingredients, Behind-the-scenes"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Display Rank
                </label>
                <input
                  type="number"
                  min="1"
                  value={rank}
                  onChange={(e) => setRank(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
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
                  disabled={createMutation.isPending}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm rounded-xl shadow-md hover:from-orange-600 hover:to-amber-600 disabled:opacity-50"
                >
                  {createMutation.isPending ? "Adding..." : "Add to Gallery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
