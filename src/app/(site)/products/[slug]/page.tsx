import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTA } from "@/components/hero/cta";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ProductDetailTabs } from "@/components/shop/product-detail-tabs";
import { ProductImageGallery } from "@/components/shop/product-image-gallery";
import { ProductPurchasePanel } from "@/components/shop/product-purchase-panel";
import { ProductCard } from "@/components/shop/product-card";
import { fetchProductBySlug, fetchStoreProducts } from "@/lib/shop-data";

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
    return {
      title: "Product Not Found · Light House",
    };
  }

  return {
    title: `${product.name} · Light House`,
    description: product.shortDescription,
  };
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

  return (
    <main className="min-h-screen bg-background">
    <div className="container">
      {/* Breadcrumbs Section */}
      <section className="pt-8 pb-4 px-4 sm:px-6 lg:px-8">
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

      {/* Main Product Info Section */}
      <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Image Gallery */}
          <ProductImageGallery images={product.images} name={product.name} />

          {/* Right: Purchase & Info Panel */}
          <ProductPurchasePanel product={product} />
        </div>
        </section>
    </div>

      {/* Detail Tabs Section */}
      <section className="bg-muted">
        <div className="container">
          <ProductDetailTabs product={product} />
        </div>
      </section>

      <div className="container">
        {/* "You Might Also Like" Recommendation Section matching Image 5 */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/40">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-foreground">
                You Might Also Like
              </h2>
              <Link
                href="/products"
                className="text-xs font-semibold uppercase tracking-wider text-gold hover:underline"
              >
                View all &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* CTA Banner */}
        <div className="mt-8">
          <CTA />
        </div>
      </div>
    </main>
  );
}
