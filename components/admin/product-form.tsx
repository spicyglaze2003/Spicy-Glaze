"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  Check,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  createProduct,
  updateProduct,
  getAdminCategories,
  getAdminSubcategories,
} from "@/lib/admin-api";
import type { Product, Category, Subcategory } from "@/lib/types";
import type { ProductFormData } from "@/lib/admin-types";
import { normalizeImageUrl } from "@/lib/utils";

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

interface LocalVariant {
  id?: number | string;
  name: string;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [imageUrl, setImageUrl] = useState(
    initialData?.imageUrl || initialData?.image || (initialData?.thumbnail as any)?.url || ""
  );
  const [stock, setStock] = useState<number>(
    initialData?.stock !== undefined ? initialData.stock : 50
  );
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    initialData?.category ? (initialData.category as any).id : undefined
  );
  const [subcategoryId, setSubcategoryId] = useState<number | undefined>(
    initialData?.subcategory ? (initialData.subcategory as any).id : undefined
  );
  const [price, setPrice] = useState<number>(initialData?.price || 0);
  const [mrp, setMrp] = useState<number>(initialData?.mrp || 0);
  const [availability, setAvailability] = useState<"in-stock" | "out-of-season" | "pre-order">(
    (initialData?.availability as any) || "in-stock"
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured || false);
  const [isActive, setIsActive] = useState<boolean>(
    initialData?.isActive !== undefined ? initialData.isActive : true
  );
  const [rank, setRank] = useState<number>(initialData?.rank || 1);

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seoKeywords || "");

  // Variants State
  const [variants, setVariants] = useState<LocalVariant[]>(
    initialData?.variants && initialData.variants.length > 0
      ? initialData.variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku || "",
          price: v.price,
          mrp: v.mrp || v.price,
          stock: v.stock,
        }))
      : [
          {
            name: "Standard Pack (250g)",
            sku: "",
            price: initialData?.price || 0,
            mrp: initialData?.mrp || 0,
            stock: 50,
          },
        ]
  );

  // Sync state if initialData arrives after mount or updates
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || initialData.productName || "");
      setSlug(initialData.slug || "");
      setImageUrl(initialData.imageUrl || initialData.image || (initialData.thumbnail as any)?.url || "");
      setStock(initialData.stock !== undefined ? initialData.stock : 50);
      setShortDescription(initialData.shortDescription || "");
      setDescription(initialData.description || "");

      const catId = typeof initialData.category === "object" && initialData.category !== null
        ? (initialData.category as any).id
        : typeof initialData.category === "number"
        ? initialData.category
        : undefined;
      if (catId !== undefined) setCategoryId(catId);

      const subId = typeof initialData.subcategory === "object" && initialData.subcategory !== null
        ? (initialData.subcategory as any).id
        : typeof initialData.subcategory === "number"
        ? initialData.subcategory
        : undefined;
      if (subId !== undefined) setSubcategoryId(subId);

      setPrice(Number(initialData.price) || 0);
      setMrp(Number(initialData.mrp) || Number(initialData.price) || 0);
      setAvailability((initialData.availability as any) || "in-stock");
      setIsFeatured(Boolean(initialData.isFeatured));
      setIsActive(initialData.isActive !== false);
      setRank(initialData.rank || 1);
      setSeoTitle(initialData.seoTitle || initialData.name || "");
      setSeoDescription(initialData.seoDescription || initialData.shortDescription || "");
      setSeoKeywords(initialData.seoKeywords || "");

      if (initialData.variants && initialData.variants.length > 0) {
        setVariants(
          initialData.variants.map((v, i) => ({
            id: v.id || Date.now() + i + 1,
            name: v.name || "Standard Pack",
            sku: v.sku || "",
            price: Number(v.price) || Number(initialData.price) || 0,
            mrp: Number(v.mrp) || Number(initialData.mrp) || Number(initialData.price) || 0,
            stock: v.stock !== undefined ? Number(v.stock) : (initialData.stock ?? 50),
          }))
        );
      }
    }
  }, [initialData]);

  // Auto-generate slug from name if not manually edited
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  // Fetch Categories & Subcategories
  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAdminCategories,
  });

  const { data: subcategoriesData } = useQuery({
    queryKey: ["admin-subcategories"],
    queryFn: getAdminSubcategories,
  });

  const categories: Category[] = categoriesData?.data || [];
  const allSubcategories: Subcategory[] = subcategoriesData?.data || [];

  // Filter subcategories by selected category
  const filteredSubcategories = categoryId
    ? allSubcategories.filter((sc: any) => sc.category?.id === categoryId)
    : allSubcategories;

  // Add / Remove Variant
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: "",
        sku: "",
        price: price || 0,
        mrp: mrp || 0,
        stock: 25,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      toast.error("A product must have at least one variant/pack size.");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariantField = (
    index: number,
    field: keyof LocalVariant,
    value: string | number
  ) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Product name is required");
      if (!slug.trim()) throw new Error("Slug is required");
      if (price <= 0) throw new Error("Price must be greater than 0");

      const payload: any = {
        name,
        productName: name,
        slug,
        imageUrl: normalizeImageUrl(imageUrl) || null,
        image: normalizeImageUrl(imageUrl) || null,
        stock: stock ?? 50,
        shortDescription: shortDescription || null,
        description: description || null,
        category: categoryId ?? null,
        subcategory: subcategoryId ?? null,
        price,
        mrp: mrp || price,
        isFeatured,
        isActive,
        availability,
        rank,
        seoTitle: seoTitle || name,
        seoDescription: seoDescription || shortDescription || null,
        seoKeywords: seoKeywords || null,
        variants: variants.map((v, idx) => ({
          id: v.id || (initialData?.variants?.[idx]?.id) || (Date.now() + idx + 1),
          name: v.name || "Standard Pack",
          sku: v.sku || null,
          price: Number(v.price) || price,
          mrp: Number(v.mrp) || mrp || price,
          stock: v.stock !== undefined ? Number(v.stock) : stock,
        })),
      };

      if (isEdit && (initialData?.productId || initialData?.id || initialData?.slug)) {
        const targetId = String(initialData.productId || initialData.id || initialData.slug);
        return await updateProduct(targetId, payload);
      } else {
        return await createProduct(payload);
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Product updated successfully!" : "Product created successfully!");
      // Invalidate relevant queries for real-time customer and admin sync
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["featured-products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      router.push("/admin/products");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || err.message || "Failed to save product");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16 max-w-5xl">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? `Edit: ${initialData?.name}` : "Create New Product"}
            </h1>
            <p className="text-sm text-gray-500">
              {isEdit
                ? "Update pricing, description, stock and SEO settings."
                : "Fill out details below to publish a new product to your catalogue."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm rounded-xl shadow-md hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all disabled:opacity-50"
          >
            <Save size={16} />
            {saveMutation.isPending ? "Saving..." : isEdit ? "Update Product" : "Publish Product"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) - Basic Info, Variants, SEO */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
              General Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Royal Kashmiri Saffron Honey"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-sm font-medium text-gray-900 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                    URL Slug *
                  </label>
                  <button
                    type="button"
                    onClick={() => setAutoSlug(!autoSlug)}
                    className="text-xs text-orange-600 hover:underline"
                  >
                    {autoSlug ? "Manual Slug" : "Auto Slug"}
                  </button>
                </div>
                <div className="flex items-center rounded-xl border border-gray-300 bg-gray-50 overflow-hidden focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
                  <span className="px-3 text-xs text-gray-400 font-mono">/products/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setSlug(e.target.value);
                    }}
                    placeholder="royal-kashmiri-saffron-honey"
                    className="flex-1 bg-transparent py-2.5 pr-4 text-sm font-mono text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Product Image URL / Asset
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... or https://images.unsplash.com/..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-900 outline-none"
                  />
                  {imageUrl && (
                    <div className="w-12 h-12 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0 relative shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={normalizeImageUrl(imageUrl)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.png";
                        }}
                      />
                    </div>
                  )}
                </div>
                {imageUrl && (imageUrl.includes("drive.google.com") || imageUrl.includes("googleusercontent.com")) && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/60 rounded-lg px-2.5 py-1.5 mt-2">
                    💡 <strong>Google Drive Tip:</strong> In Google Drive, ensure file sharing is set to <strong>&ldquo;Anyone with the link can view&rdquo;</strong> (Viewer access). If set to &ldquo;Restricted&rdquo;, only you can see it while logged in.
                  </p>
                )}
                <p className="text-[11px] text-gray-500 mt-1">
                  Supports Google Drive links, Google Photos, Unsplash, Cloudinary, and direct image URLs.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Short Tagline / Summary
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="e.g. 100% Raw forest honey infused with premium Kashmiri saffron stigmas."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Full Story & Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the artisan craft, taste profile, ingredients, and health benefits..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-900 outline-none resize-y"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
              Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Selling Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm text-gray-500 font-medium">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="499"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-sm font-semibold text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  MRP Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm text-gray-500 font-medium">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={mrp || ""}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    placeholder="650"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-sm font-semibold text-gray-900 outline-none"
                  />
                </div>
                {mrp > price && price > 0 && (
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    {Math.round(((mrp - price) / mrp) * 100)}% off MRP!
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Available Stock (Units) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={stock}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    setStock(val);
                    if (variants.length === 1) {
                      updateVariantField(0, "stock", val);
                    }
                  }}
                  placeholder="50"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-sm font-semibold text-gray-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Pack Variants & Stock Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Pack Sizes & Variant Stock
                </h2>
                <p className="text-xs text-gray-500">
                  Manage individual weights/SKUs with distinct pricing and live inventory counts.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <Plus size={14} /> Add Pack Size
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Package size={14} className="text-orange-500" />
                      Pack #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove variant"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="sm:col-span-2 md:col-span-1">
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">
                        Size / Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={v.name}
                        onChange={(e) => updateVariantField(idx, "name", e.target.value)}
                        placeholder="e.g. 500g Jar"
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-900 bg-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => updateVariantField(idx, "sku", e.target.value)}
                        placeholder="SG-HONEY-500"
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-mono text-gray-900 bg-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={v.price}
                        onChange={(e) => updateVariantField(idx, "price", Number(e.target.value))}
                        placeholder="499"
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-900 bg-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">
                        Stock Qty *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={v.stock}
                        onChange={(e) => updateVariantField(idx, "stock", Number(e.target.value))}
                        placeholder="50"
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-900 bg-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Meta Information Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              SEO & Social Meta
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="SpicyGlaze | Buy Pure Kashmiri Saffron Honey Online"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-orange-500 text-sm text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Shop premium hand-crafted natural Indian food items made with pure ingredients."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-orange-500 text-sm text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="honey, organic, indian spices, handcrafted food, raw honey"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-orange-500 text-sm text-gray-900 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) - Categorization, Status, Availability, Rank */}
        <div className="space-y-6">
          {/* Organization & Category */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Layers size={16} className="text-orange-500" />
              Organization
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Primary Category
                </label>
                <select
                  value={categoryId || ""}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : undefined;
                    setCategoryId(id);
                    setSubcategoryId(undefined); // Reset subcategory when category changes
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-900 outline-none"
                >
                  <option value="">Select a Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Subcategory
                </label>
                <select
                  value={subcategoryId || ""}
                  disabled={!categoryId}
                  onChange={(e) =>
                    setSubcategoryId(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm text-gray-900 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">Select a Subcategory</option>
                  {filteredSubcategories.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Catalogue Rank / Sort Priority
                </label>
                <input
                  type="number"
                  min="1"
                  value={rank}
                  onChange={(e) => setRank(Number(e.target.value))}
                  placeholder="1"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-900 outline-none focus:border-orange-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Lower numbers display first in the catalogue.
                </p>
              </div>
            </div>
          </div>

          {/* Status & Availability */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
              Status & Visibility
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Availability State
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:border-orange-500 text-sm font-medium text-gray-900 outline-none"
                >
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-season">Out of Season</option>
                  <option value="pre-order">Pre-Order</option>
                </select>
              </div>

              <div className="pt-2 space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div>
                    <span className="block text-sm font-semibold text-gray-900">Active Listing</span>
                    <span className="block text-xs text-gray-500">
                      Visible to shoppers on the store
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div>
                    <span className="block text-sm font-semibold text-gray-900">
                      Featured Product
                    </span>
                    <span className="block text-xs text-gray-500">
                      Show in homepage highlights
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
