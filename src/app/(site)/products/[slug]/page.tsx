import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTA } from "@/components/hero/cta";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { ProductCard } from "@/components/shop/product-card";
import { ProductDetailTabs } from "@/components/shop/product-detail-tabs";
import { generateProductJsonLd, generateSeoMetadata } from "@/lib/seo-helpers";
import { fetchProductBySlug, fetchRelatedProducts } from "@/lib/shop-data";
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

  const relatedProducts = await fetchRelatedProducts(
    product.slug,
    product.categorySlug,
  );

  const jsonLd = generateProductJsonLd({
    name: product.name,
    description: product.shortDescription || product.description,
    slug: product.slug,
    image: product.images[0] || "",
    currency: "PKR",
    brand:
      product.specifications.find((s) => s.key === "Brand")?.value ||
      "Lighthouse",
    category: product.categoryName,
    variants: product.variants.map((v) => ({
      sku: v.sku || product.slug,
      name: `${product.name} — ${Object.values(v.attributes).join(", ")}`,
      price: v.price,
      salePrice: v.salePrice,
      images: v.images,
      availability: v.availability,
      attributes: v.attributes,
    })),
  });

  return (
    <>
      <ScrollToTop />
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
            <ProductDetailTabs
              product={product}
              descriptionContent={
                <div className="lg:col-span-7 space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                    DESIGN &amp; CRAFTSMANSHIP
                  </span>
                  <h3 className="font-serif leading-none font-normal text-foreground">
                    Crafted for the spaces that matter most
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Each piece is meticulously inspected for quality, ensuring
                    smooth movement across all joints and flawless luster across
                    the lacquered metal surfaces.
                  </p>
                </div>
              }
              specificationsContent={
                <div className="lg:col-span-7 space-y-6">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                    TECHNICAL SPECIFICATIONS
                  </span>
                  <h3 className="font-serif leading-none font-normal text-foreground">
                    Built to last. Specified to perform.
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Every dimension and material choice in the {product.name} is
                    deliberate. Solid brass construction, linen diffusion, and a
                    weighted marble base are the result of a two-year development
                    process focused entirely on longevity and light quality.
                  </p>
                  <dl className="grid grid-cols-2 gap-x-8 gap-y-6 pt-4">
                    {product.specifications.map((spec) => (
                      <div key={spec.key} className="space-y-1">
                        <dt className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                          {spec.key}
                        </dt>
                        <dd className="text-xl font-medium text-black font-heading">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              }
            />
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

              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relProduct) => (
                  <li key={relProduct.id}>
                    <ProductCard
                      product={relProduct}
                      showQuickView
                    />
                  </li>
                ))}
              </ul>
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
