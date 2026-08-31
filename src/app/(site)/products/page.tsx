import type { Metadata } from "next";
import { CTA } from "@/components/hero/cta";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ProductFiltersSidebar } from "@/components/shop/product-filters-sidebar";
import { ProductGridToolbar } from "@/components/shop/product-grid-toolbar";
import { fetchStoreProducts } from "@/lib/shop-data";

export const metadata: Metadata = {
  title: "Our Collection · Light House",
  description:
    "Explore our curated lighting collections, thoughtfully selected to bring warmth, character, and style to every space.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    design?: string | string[];
    material?: string | string[];
    price?: string | string[];
    sort?: "featured" | "price_asc" | "price_desc" | "newest";
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const categorySlug = params.category;
  const search = params.search;
  const designStyle = Array.isArray(params.design)
    ? params.design
    : params.design
      ? [params.design]
      : undefined;
  const material = Array.isArray(params.material)
    ? params.material
    : params.material
      ? [params.material]
      : undefined;
  const priceRange = Array.isArray(params.price)
    ? params.price
    : params.price
      ? [params.price]
      : undefined;
  const sortBy = params.sort;

  const { products, total } = await fetchStoreProducts({
    categorySlug,
    search,
    designStyle,
    material,
    priceRange,
    sortBy,
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Dark Navy Hero Header */}
      <section className="bg-noise py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="mx-auto max-w-7xl space-y-4">
          <Breadcrumb
            items={[{ label: "Home", href: "/" }, { label: "Products" }]}
          />
          <div className="max-w-2xl space-y-3 pt-2">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white">
              Our Collection
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
              Explore our curated lighting collections, thoughtfully selected to bring
              warmth, character, and style to every space.
            </p>
          </div>
        </div>
      </section>

      {/* Main Collection Container */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <ProductFiltersSidebar />

          {/* Right Product Grid */}
          <ProductGridToolbar products={products} total={total} />
        </div>
      </section>

      {/* CTA Banner */}
      <div className="mt-8">
        <CTA />
      </div>
    </main>
  );
}
