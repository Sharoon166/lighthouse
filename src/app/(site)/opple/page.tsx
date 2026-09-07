import type { Metadata } from "next";
import { CTA } from "@/components/hero/cta";
import { OppelDistributorBanner } from "@/components/hero/oppel-distributor-banner";
import { ProductFiltersSidebar } from "@/components/shop/product-filters-sidebar";
import { ProductGridToolbar } from "@/components/shop/product-grid-toolbar";
import { fetchStoreProducts } from "@/lib/shop-data";

export const metadata: Metadata = {
  title: "OPPLE Collection · Light House",
  description:
    "Explore our curated OPPLE lighting collection, official distributor in Rawalpindi & Islamabad.",
};

interface OpplePageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    design?: string | string[];
    material?: string | string[];
    price?: string | string[];
    sort?: "featured" | "price_asc" | "price_desc" | "newest";
  }>;
}

export default async function OpplePage({ searchParams }: OpplePageProps) {
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

  const { products: rawProducts, total } = await fetchStoreProducts({
    categorySlug,
    brandSlug: "opple",
    search,
    designStyle,
    material,
    priceRange,
    sortBy,
  });

  const products = JSON.parse(JSON.stringify(rawProducts));

  return (
    <main className="min-h-screen bg-background">
      {/* Opple Distributor Banner */}
      <OppelDistributorBanner />

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
      <div className="mt-8 container">
        <CTA />
      </div>
    </main>
  );
}
