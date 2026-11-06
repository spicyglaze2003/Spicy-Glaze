import { getProduct, getProducts } from "@/lib/api";
import { notFound } from "next/navigation";
import ProductDetailClient from "./product-detail-client";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const productRes = await getProduct(slug);
  const product = productRes.data;

  if (!product) {
    return {
      title: "Product Not Found | SpicyGlaze",
    };
  }

  return {
    title: `${product.name} | SpicyGlaze`,
    description: product.shortDescription || product.description || "Authentic handcrafted Indian spices & artisanal foods.",
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const productRes = await getProduct(slug);
  const product = productRes.data;

  if (!product) {
    notFound();
  }

  // Fetch related products for recommendations
  let relatedProducts: any[] = [];
  try {
    const relatedRes = await getProducts({
      category: product.category?.slug,
      pageSize: 5,
    });
    relatedProducts = (relatedRes.data || []).filter(
      (p) => String(p.id) !== String(product.id) && p.slug !== product.slug
    );

    // If not enough from same category, fetch general featured products
    if (relatedProducts.length === 0) {
      const allRes = await getProducts({ pageSize: 5 });
      relatedProducts = (allRes.data || []).filter(
        (p) => String(p.id) !== String(product.id) && p.slug !== product.slug
      );
    }
  } catch {
    relatedProducts = [];
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-cream/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ProductDetailClient product={product} relatedProducts={relatedProducts} />
      </div>
    </div>
  );
}
