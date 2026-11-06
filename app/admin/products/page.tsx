"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreVertical,
  Star,
  StarOff,
  Eye,
  Pencil,
  Trash2,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Boxes,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { cn, formatPrice, getProductImageUrl } from "@/lib/utils";
import {
  getAdminProducts,
  getAdminCategories,
  deleteProduct,
  toggleProductFeatured,
  toggleProductActive,
  updateStock,
  importProductsJson,
} from "@/lib/admin-api";
import type { Product, Category } from "@/lib/types";

interface ParsedProductRow {
  name: string;
  category: string;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  image: string;
  isValid: boolean;
  errors: string[];
  isDuplicate?: boolean;
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<any>(null);

  // Quick stock edit state
  const [editingStockProduct, setEditingStockProduct] = useState<Product | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);

  // Excel Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAdminCategories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page, search, statusFilter, categoryFilter],
    queryFn: () =>
      getAdminProducts({
        page,
        pageSize: 20,
        search: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      toggleProductFeatured(id, isFeatured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product featured status updated");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleProductActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product status updated");
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) =>
      updateStock(id, stock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditingStockProduct(null);
      toast.success("Stock updated successfully");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update stock");
    },
  });

  const products = data?.data || [];
  const pagination = data?.meta?.pagination;
  const categories = categoriesData?.data || [];

  const getProductStock = (product: Product): number => {
    if (product.stock !== undefined && product.stock !== null) {
      return Number(product.stock);
    }
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return 0;
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return "out-of-stock";
    if (stock <= 10) return "low-stock";
    return "in-stock";
  };

  // Excel template downloader
  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        "Product Name": "Almond",
        Category: "Dry Fruits",
        Description: "Premium California Almonds, rich in vitamin E and antioxidants.",
        Price: 150,
        MRP: 180,
        Stock: 50,
        Image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600",
      },
      {
        "Product Name": "Cashew",
        Category: "Dry Fruits",
        Description: "Crunchy, hand-picked whole cashews for snacking and sweets.",
        Price: 130,
        MRP: 160,
        Stock: 40,
        Image: "https://images.unsplash.com/photo-1536591375315-1b8368903274?w=600",
      },
      {
        "Product Name": "Pistachio",
        Category: "Dry Fruits",
        Description: "Lightly salted roasted pistachios with authentic crunch.",
        Price: 220,
        MRP: 260,
        Stock: 35,
        Image: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=600",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "LocalMart_Product_Template.xlsx");
    toast.success("Sample template downloaded!");
  };

  // Export current catalogue to Excel
  const exportCatalogueToExcel = () => {
    if (products.length === 0) {
      toast.error("No products to export");
      return;
    }
    const exportData = products.map((p: any) => ({
      "Product ID": p.productId || p.id,
      "Product Name": p.name || p.productName,
      Category: p.category?.name || p.category || "General",
      Description: p.description || "",
      Price: p.price,
      MRP: p.mrp || p.price,
      Stock: getProductStock(p),
      Image: p.imageUrl || p.image || "",
      Status: p.isActive !== false ? "Active" : "Inactive",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Catalogue");
    XLSX.writeFile(wb, `LocalMart_Catalogue_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Catalogue exported successfully");
  };

  // Handle Excel file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet);

        if (!rawJson || rawJson.length === 0) {
          toast.error("The selected file is empty");
          return;
        }

        const existingNames = new Set(
          products.map((p: any) => (p.name || p.productName || "").toLowerCase().trim())
        );

        const validated: ParsedProductRow[] = rawJson.map((row) => {
          const name = String(row["Product Name"] || row["name"] || row["ProductName"] || "").trim();
          const category = String(row["Category"] || row["category"] || "General").trim();
          const description = String(row["Description"] || row["description"] || "").trim();
          const price = Number(row["Price"] || row["price"] || 0);
          const mrp = Number(row["MRP"] || row["mrp"] || price);
          const stock = parseInt(String(row["Stock"] || row["stock"] || "0"), 10);
          const image = String(row["Image"] || row["Image URL"] || row["image"] || row["imageUrl"] || "").trim();

          const errors: string[] = [];
          if (!name) errors.push("Product Name is required");
          if (isNaN(price) || price <= 0) errors.push("Price must be > 0");
          if (isNaN(stock) || stock < 0) errors.push("Stock must be >= 0");

          const isDuplicate = name ? existingNames.has(name.toLowerCase()) : false;

          return {
            name,
            category,
            description,
            price,
            mrp: mrp || price,
            stock: isNaN(stock) ? 0 : stock,
            image,
            isValid: errors.length === 0,
            errors,
            isDuplicate,
          };
        });

        setParsedRows(validated);
        setIsImportModalOpen(true);
      } catch (err: any) {
        toast.error("Failed to parse Excel file: " + err.message);
      }
    };

    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const executeImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid products to import");
      return;
    }

    setIsImporting(true);
    try {
      const payload = validRows.map((r) => ({
        name: r.name,
        category: r.category,
        description: r.description,
        price: r.price,
        mrp: r.mrp,
        stock: r.stock,
        image: r.image,
      }));

      const res = await importProductsJson(payload);
      if (res.success) {
        toast.success(`Successfully imported ${res.data?.imported || validRows.length} products!`);
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        setIsImportModalOpen(false);
        setParsedRows([]);
      } else {
        toast.error(res.message || "Failed to import products");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">
            Manage your product catalogue ({pagination?.total || products.length} real products in database)
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls"
            className="hidden"
          />

          <button
            onClick={downloadSampleTemplate}
            title="Download sample Excel template"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download size={14} className="text-emerald-600" />
            Template
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm"
          >
            <FileSpreadsheet size={16} />
            Import Excel
          </button>

          <button
            onClick={exportCatalogueToExcel}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Export
          </button>

          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, category, or ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-600 focus:border-orange-500 outline-none bg-white cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-600 focus:border-orange-500 outline-none bg-white cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat: Category) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto" />
            <p className="text-gray-500 mt-3 text-sm">Loading products from database...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              📦
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No products available</h3>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              Please add products from the Admin Dashboard or import via Excel.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
              >
                <FileSpreadsheet size={16} />
                Import Excel
              </button>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm"
              >
                <Plus size={16} />
                Add Product
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View (lg:block) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                      Product
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                      Category
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                      Price / MRP
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                      Stock
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                      Status
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product: any) => {
                    const currentStock = getProductStock(product);
                    const stockStatus = getStockStatus(currentStock);
                    const imgUrl = getProductImageUrl(product);
                    const prodId = product.productId || product.documentId || String(product.id);

                    return (
                      <tr key={product.id || prodId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative border border-gray-100 flex items-center justify-center">
                              {imgUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={imgUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    if (target.parentElement) {
                                      target.parentElement.innerHTML = '<span class="text-lg">📦</span>';
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                                  📦
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {product.name || product.productName}
                              </p>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">
                                ID: {product.productId || product.id}
                              </p>
                            </div>
                            {product.isFeatured && (
                              <Star size={14} className="text-amber-400 fill-amber-400 ml-1" />
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                            {product.category?.name || product.category || "General"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </p>
                            {product.mrp && product.mrp > product.price && (
                              <p className="text-xs text-gray-400 line-through">
                                {formatPrice(product.mrp)}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "w-2.5 h-2.5 rounded-full flex-shrink-0",
                                stockStatus === "in-stock" && "bg-emerald-500",
                                stockStatus === "low-stock" && "bg-amber-500",
                                stockStatus === "out-of-stock" && "bg-red-500"
                              )}
                            />
                            <span className="text-sm font-semibold text-gray-800">
                              {currentStock} units
                            </span>
                            <button
                              onClick={() => {
                                setEditingStockProduct(product);
                                setNewStockValue(currentStock);
                              }}
                              title="Update stock"
                              className="text-xs text-orange-600 hover:text-orange-700 font-medium underline ml-1"
                            >
                              Edit
                            </button>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                              product.isActive !== false
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-500"
                            )}
                          >
                            {product.isActive !== false ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setOpenMenuId(openMenuId === product.id ? null : product.id)
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <MoreVertical size={16} className="text-gray-500" />
                            </button>

                            {openMenuId === product.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                  <Link
                                    href={`/admin/products/${product.productId || product.documentId || product.id}/edit`}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                    onClick={() => setOpenMenuId(null)}
                                  >
                                    <Pencil size={14} />
                                    Edit Product
                                  </Link>
                                  <button
                                    onClick={() => {
                                      toggleFeaturedMutation.mutate({
                                        id: prodId,
                                        isFeatured: !product.isFeatured,
                                      });
                                      setOpenMenuId(null);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                                  >
                                    {product.isFeatured ? (
                                      <>
                                        <StarOff size={14} />
                                        Remove Featured
                                      </>
                                    ) : (
                                      <>
                                        <Star size={14} />
                                        Set Featured
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      toggleActiveMutation.mutate({
                                        id: prodId,
                                        isActive: product.isActive === false,
                                      });
                                      setOpenMenuId(null);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                                  >
                                    {product.isActive !== false ? "Deactivate" : "Activate"}
                                  </button>
                                  <hr className="my-1 border-gray-100" />
                                  <button
                                    onClick={() => {
                                      if (
                                        confirm(
                                          `Delete "${product.name || product.productName}"? This cannot be undone.`
                                        )
                                      ) {
                                        deleteMutation.mutate(prodId);
                                      }
                                      setOpenMenuId(null);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Product Cards (lg:hidden) */}
            <div className="lg:hidden p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 bg-gray-50/40">
              {products.map((product: any) => {
                const currentStock = getProductStock(product);
                const stockStatus = getStockStatus(currentStock);
                const imgUrl = getProductImageUrl(product);
                const prodId = product.productId || product.documentId || String(product.id);

                return (
                  <div key={product.id || prodId} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative border border-gray-100 flex items-center justify-center">
                          {imgUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={imgUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                if (target.parentElement) {
                                  target.parentElement.innerHTML = '<span class="text-xl">📦</span>';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                              📦
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {product.name || product.productName}
                            </p>
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0",
                                product.isActive !== false
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-gray-100 text-gray-500"
                              )}
                            >
                              {product.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                            ID: {product.productId || product.id}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-sm font-extrabold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                            {product.mrp && product.mrp > product.price && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(product.mrp)}
                              </span>
                            )}
                            <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                              {product.category?.name || product.category || "General"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              stockStatus === "in-stock" && "bg-emerald-500",
                              stockStatus === "low-stock" && "bg-amber-500",
                              stockStatus === "out-of-stock" && "bg-red-500"
                            )}
                          />
                          <span className="font-bold text-gray-800">{currentStock} units</span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingStockProduct(product);
                            setNewStockValue(currentStock);
                          }}
                          className="text-xs text-orange-600 hover:text-orange-700 font-bold underline cursor-pointer"
                        >
                          Edit Stock
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 gap-2">
                      <Link
                        href={`/admin/products/${product.productId || product.documentId || product.id}/edit`}
                        className="flex-1 text-center py-2 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-xl text-xs font-bold text-gray-700 transition-colors"
                      >
                        Edit Details
                      </Link>

                      <button
                        onClick={() => {
                          toggleFeaturedMutation.mutate({
                            id: prodId,
                            isFeatured: !product.isFeatured,
                          });
                        }}
                        className={cn(
                          "p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors",
                          product.isFeatured
                            ? "bg-amber-50 text-amber-600 border-amber-200"
                            : "bg-white text-gray-500 border-gray-200"
                        )}
                        title={product.isFeatured ? "Featured" : "Not featured"}
                      >
                        <Star size={14} className={product.isFeatured ? "fill-amber-400 text-amber-400" : ""} />
                      </button>

                      <button
                        onClick={() => {
                          toggleActiveMutation.mutate({
                            id: prodId,
                            isActive: product.isActive === false,
                          });
                        }}
                        className="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        {product.isActive !== false ? "Hide" : "Show"}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete "${product.name || product.productName}"?`)) {
                            deleteMutation.mutate(prodId);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.pageCount > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * (pagination.pageSize || 20) + 1}–
                  {Math.min(page * (pagination.pageSize || 20), pagination.total)} of{" "}
                  {pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {pagination.pageCount}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.pageCount, p + 1))
                    }
                    disabled={page >= pagination.pageCount}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Stock Edit Modal */}
      {editingStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Boxes size={20} className="text-orange-500" />
                Update Stock
              </h3>
              <button
                onClick={() => setEditingStockProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">
                {editingStockProduct.name || editingStockProduct.productName}
              </p>
              <p className="text-xs text-gray-400">
                Current stock: {getProductStock(editingStockProduct)} units
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                New Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={newStockValue}
                onChange={(e) => setNewStockValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-semibold text-lg outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingStockProduct(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={stockMutation.isPending}
                onClick={() => {
                  const id = editingStockProduct.productId || editingStockProduct.documentId || String(editingStockProduct.id);
                  stockMutation.mutate({ id, stock: newStockValue });
                }}
                className="px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {stockMutation.isPending ? "Saving..." : "Save Stock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Preview Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileSpreadsheet className="text-emerald-600" size={20} />
                  Excel Import Preview
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  File: <span className="font-mono font-medium">{importFileName}</span> &bull; {parsedRows.length} row(s) found
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Validation Summary Bar */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 size={16} />
                {parsedRows.filter((r) => r.isValid).length} Valid Products
              </span>
              {parsedRows.some((r) => !r.isValid) && (
                <span className="flex items-center gap-1.5 text-red-600 font-medium">
                  <XCircle size={16} />
                  {parsedRows.filter((r) => !r.isValid).length} Invalid Rows
                </span>
              )}
              {parsedRows.some((r) => r.isDuplicate) && (
                <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                  <AlertTriangle size={16} />
                  {parsedRows.filter((r) => r.isDuplicate).length} Duplicate names (will update)
                </span>
              )}
            </div>

            {/* Table Preview */}
            <div className="overflow-y-auto flex-1 p-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase font-semibold">
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2">Product Name</th>
                    <th className="pb-3 px-2">Category</th>
                    <th className="pb-3 px-2">Price (₹)</th>
                    <th className="pb-3 px-2">MRP (₹)</th>
                    <th className="pb-3 px-2">Stock</th>
                    <th className="pb-3 px-2">Issues / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className={row.isValid ? "hover:bg-gray-50/50" : "bg-red-50/40"}>
                      <td className="py-2.5 px-2">
                        {row.isValid ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                      </td>
                      <td className="py-2.5 px-2 font-medium text-gray-900">
                        {row.name || <span className="text-red-500 italic">[Empty]</span>}
                      </td>
                      <td className="py-2.5 px-2 text-gray-600">{row.category}</td>
                      <td className="py-2.5 px-2 font-semibold">₹{row.price}</td>
                      <td className="py-2.5 px-2 text-gray-500">₹{row.mrp}</td>
                      <td className="py-2.5 px-2 font-semibold">{row.stock}</td>
                      <td className="py-2.5 px-2">
                        {row.errors.length > 0 ? (
                          <span className="text-red-600 font-medium">
                            {row.errors.join(", ")}
                          </span>
                        ) : row.isDuplicate ? (
                          <span className="text-amber-600">Existing product (updates stock/price)</span>
                        ) : (
                          <span className="text-emerald-600">Ready to save</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Only valid rows will be committed to the real database.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isImporting || parsedRows.filter((r) => r.isValid).length === 0}
                  onClick={executeImport}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  <Upload size={16} />
                  {isImporting
                    ? "Importing..."
                    : `Import ${parsedRows.filter((r) => r.isValid).length} Products`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
