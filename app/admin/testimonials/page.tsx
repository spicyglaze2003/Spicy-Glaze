"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Plus,
  Edit2,
  Trash2,
  X,
  Quote,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/lib/admin-api";
import type { Testimonial } from "@/lib/types";

export default function TestimonialsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [rank, setRank] = useState<number>(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: getAdminTestimonials,
  });

  const testimonials: Testimonial[] = data?.data || [];

  const openCreateModal = () => {
    setEditingItem(null);
    setName("");
    setDesignation("");
    setQuote("");
    setRating(5);
    setRank(testimonials.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Testimonial) => {
    setEditingItem(item);
    setName(item.name);
    setDesignation(item.designation || "");
    setQuote(item.quote);
    setRating((item as any).rating || 5);
    setRank(item.rank || 1);
    setIsModalOpen(true);
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Customer name is required");
      if (!quote.trim()) throw new Error("Quote is required");

      const payload = {
        name,
        designation,
        quote,
        rating,
        rank,
      };

      if (editingItem) {
        return await updateTestimonial(String(editingItem.id), payload);
      } else {
        return await createTestimonial(payload);
      }
    },
    onSuccess: () => {
      toast.success(editingItem ? "Testimonial updated!" : "Testimonial created!");
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || "Failed to save");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteTestimonial(String(id));
    },
    onSuccess: () => {
      toast.success("Testimonial deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
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
            <Star className="text-amber-500 fill-amber-500" />
            Customer Testimonials
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Showcase authentic customer reviews and feedback on your store.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm rounded-xl shadow-md hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {/* Grid of Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-gray-400">
            Loading testimonials...
          </div>
        ) : testimonials.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
            No testimonials found. Click "Add Testimonial" to create the first review.
          </div>
        ) : (
          testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        className={
                          i < ((item as any).rating || 5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                        }
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete testimonial from ${item.name}?`)) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Quote size={20} className="text-orange-200 mb-1" />
                  <p className="text-sm text-gray-700 italic leading-relaxed">
                    "{item.quote}"
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                  {item.designation && (
                    <p className="text-xs text-gray-500">{item.designation}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 font-mono">Rank #{item.rank || 1}</span>
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
                {editingItem ? "Edit Testimonial" : "Add Testimonial"}
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
                  Customer / Reviewer Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Meera Nair"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Designation / Location
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Food Blogger, Bangalore"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Customer Quote *
                </label>
                <textarea
                  rows={3}
                  required
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Share what the customer loved about your flavours..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Star Rating (1 - 5)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} Stars
                      </option>
                    ))}
                  </select>
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
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
                  {saveMutation.isPending ? "Saving..." : editingItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
