"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAdminProduct } from "@/lib/admin-api";
import ProductForm from "@/components/admin/product-form";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/types";

export default function EditProductPage() {
  const params = useParams();
  const rawId = params?.id as string;
  const id = rawId ? decodeURIComponent(rawId).trim() : "";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => getAdminProduct(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-sm font-medium text-gray-600">Loading product details...</p>
      </div>
    );
  }

  // Extract product whether wrapped in .data, .data.product, or direct object
  const product: Product | null =
    (data as any)?.data?.product ||
    (data as any)?.data ||
    (data as any)?.product ||
    ((data as any)?.name || (data as any)?.productName ? (data as any) : null);

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Product Not Found</h2>
        <p className="text-sm text-gray-500 mt-2 mb-6 leading-relaxed">
          The requested product ID <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-gray-800">{id || "unknown"}</code> could not be found or has been removed.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Retry
          </button>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ProductForm initialData={product} isEdit={true} />
    </div>
  );
}
