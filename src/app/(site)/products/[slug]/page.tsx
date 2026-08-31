import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { CTA } from "@/components/hero/cta";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ProductDetailTabs } from "@/components/shop/product-detail-tabs";
import { ProductImageGallery } from "@/components/shop/product-image-gallery";
import { ProductPurchasePanel } from "@/components/shop/product-purchase-panel";
import { fetchProductBySlug, fetchStoreProducts } from "@/lib/shop-data";
import { formatCurrency } from "@/lib/format";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
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
  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumbs Section */}
      <section className="pt-8 pb-4 px-4 sm:px-6 lg:px-8 border-b border-border/40">
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

      {/* Detail Tabs Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ProductDetailTabs product={product} />
        </div>
      </section>

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
              <div
                key={relProduct.id}
                className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Link
                  href={`/products/${relProduct.slug}`}
                  className="block relative aspect-square bg-muted/30 overflow-hidden"
                >
                  <Image
                    src={relProduct.images[0] || "/products/1.png"}
                    alt={relProduct.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                <div className="p-4 space-y-2 bg-card border-t border-border/40">
                  <Link href={`/products/${relProduct.slug}`}>
                    <h4 className="font-heading font-medium text-sm text-foreground group-hover:text-gold transition-colors line-clamp-1">
                      {relProduct.name}
                    </h4>
                  </Link>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">
                      {formatCurrency(relProduct.price)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Add ${relProduct.name} to cart`}
                      className="flex size-7 items-center justify-center rounded-full bg-slate-900 text-white transition-colors hover:bg-gold hover:text-slate-950"
                    >
                      <HugeiconsIcon icon={PlusSignIcon} size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <div className="mt-8">
        <CTA />
      </div>
    </main>
  );
}
