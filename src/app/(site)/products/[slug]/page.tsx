import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTA } from "@/components/hero/cta";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ProductCard } from "@/components/shop/product-card";
import { ProductDetailTabs } from "@/components/shop/product-detail-tabs";
import { generateProductJsonLd, generateSeoMetadata } from "@/lib/seo-helpers";
import { fetchProductBySlug, fetchStoreProducts } from "@/lib/shop-data";
import { ProductDetailClient } from "./product-detail-client";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await fetchProductBySlug(resolvedParams.slug);

  if (!product) {
    return { title: "Product Not Found | Lighthouse" };
  }

  return generateSeoMetadata({
    title: product.seo.metaTitle || `${product.name} | Lighthouse`,
    description:
      product.seo.metaDescription ||
      product.shortDescription ||
      `${product.name} — premium lighting fixture at Lighthouse.`,
    path: `/products/${product.slug}`,
    image: product.images[0],
    type: "product",
    noIndex: product.seo.noIndex,
    keywords: product.seo.focusKeyword
      ? [
          product.seo.focusKeyword,
          ...product.specifications.map((s) => s.value),
        ]
      : product.specifications.map((s) => s.value),
  });
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await fetchProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const { products: allProducts } = await fetchStoreProducts();
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const jsonLd = generateProductJsonLd({
    name: product.name,
    description: product.shortDescription || product.description,
    slug: product.slug,
    image: product.images[0] || "",
    price: product.price,
    currency: "PKR",
    availability: product.inStock ? "in_stock" : "out_of_stock",
    brand:
      product.specifications.find((s) => s.key === "Brand")?.value ||
      "Lighthouse",
    category: product.categoryName,
    sku: product.variants.find((v) => v.sku)?.sku || product.slug,
    ...(product.ratings.count > 0
      ? { rating: product.ratings.average, ratingCount: product.ratings.count }
      : {}),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-background">
        <div className="container">
          <section className="px-4 pb-4 pt-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <Breadcrumb
                items={[
                  { label: "Home", href: "/" },
                  { label: "Products", href: "/products" },
                  { label: product.name },
                ]}
              />
            </div>
          </section>

          <section className="px-4 py-8 md:py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <ProductDetailClient product={product} />
            </div>
          </section>
        </div>

        <section className="bg-muted">
          <div className="container">
            <ProductDetailTabs product={product} />
          </div>
        </section>

        <div className="container">
          <section className="border-t border-border/40 px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-normal text-foreground sm:text-3xl">
                  You Might Also Like
                </h2>
                <Link
                  href="/products"
                  className="text-xs font-semibold uppercase tracking-wider text-gold hover:underline"
                >
                  View all &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relProduct) => (
                  <ProductCard
                    key={relProduct.id}
                    product={relProduct}
                    showQuickView
                  />
                ))}
              </div>
            </div>
          </section>

          <div className="mt-8">
            <CTA />
          </div>
        </div>
      </main>
    </>
  );
}
