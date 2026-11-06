"use client";

import ProductForm from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div className="p-6 md:p-8">
      <ProductForm isEdit={false} />
    </div>
  );
}
