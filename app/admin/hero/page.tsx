"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
} from "@/lib/admin-api";
import type { HeroSlide } from "@/lib/types";

export default function HeroSlidesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("Explore Products");
  const [ctaLink, setCtaLink] = useState("/products");
  const [rank, setRank] = useState<number>(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-hero-slides"],
    queryFn: getAdminHeroSlides,
  });

  const slides: HeroSlide[] = data?.data || [];

  const openCreateModal = () => {
    setEditingSlide(null);
    setTitle("");
    setSubtitle("");
    setCtaText("Explore Products");
    setCtaLink("/products");
    setRank(slides.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setTitle(slide.title);
    setSubtitle(slide.subtitle || "");
    setCtaText(slide.ctaText || "Explore Products");
    setCtaLink(slide.ctaLink || "/products");
    setRank(slide.rank || 1);
    setIsModalOpen(true);
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Title is required");

      const payload = {
        title,
        subtitle,
        ctaText,
        ctaLink,
        rank,
      };

      if (editingSlide) {
        return await updateHeroSlide(String(editingSlide.id), payload);
      } else {
        return await createHeroSlide(payload);
      }
    },
    onSuccess: () => {
      toast.success(editingSlide ? "Hero slide updated!" : "Hero slide created!");
      queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] });
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || "Failed to save slide");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteHeroSlide(String(id));
    },
    onSuccess: () => {
      toast.success("Hero slide deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] });
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
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
            Hero Slides Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure the rotating homepage banner headlines, subtext and call-to-action buttons.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm rounded-xl shadow-md hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Hero Slide
        </button>
      </div>

      {/* Grid of Slides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-gray-400">
            Loading hero slides...
          </div>
        ) : slides.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
            No hero slides found. Click "Add Hero Slide" to create the first banner.
          </div>
        ) : (
          slides.map((slide) => (
            <div
              key={slide.id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-orange-50 text-orange-700 font-bold rounded-lg text-xs">
                    Slide #{slide.rank || 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(slide)}
                      className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit slide"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete hero slide "${slide.title}"?`)) {
                          deleteMutation.mutate(slide.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete slide"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-snug">
                    {slide.title}
                  </h3>
                  {slide.subtitle && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                      {slide.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">CTA: <strong className="text-gray-800">{slide.ctaText}</strong></span>
                <span className="font-mono text-gray-400">{slide.ctaLink}</span>
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
              <h3 className="font-bold text-gray-900 text-base">
                {editingSlide ? "Edit Hero Slide" : "Add Hero Slide"}
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
                  Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Authentic Handcrafted Flavours"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Subtitle / Subtext
                </label>
                <textarea
                  rows={3}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Pure ingredients, traditional recipes, zero preservatives..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Explore Range"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    CTA Link URL
                  </label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="/products"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-mono focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Display Order / Rank
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
                  {saveMutation.isPending ? "Saving..." : editingSlide ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
