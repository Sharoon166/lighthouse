import type { Metadata } from "next";
import { CTA } from "@/components/hero/cta";
import { OppelDistributorBanner } from "@/components/hero/oppel-distributor-banner";
import { ProductFiltersSidebar } from "@/components/shop/product-filters-sidebar";
import { ProductGridToolbar } from "@/components/shop/product-grid-toolbar";
import {
  getCategoryBySlug,
  getCategoryTree,
  getDescendantSlugs,
} from "@/features/shop/actions/category-actions";
import { fetchFilterMetadata, fetchStoreProducts } from "@/lib/shop-data";

export const metadata: Metadata = {
  title: "OPPLE Collection | Lighthouse",
  description:
    "Explore the official OPPLE lighting collection at Lighthouse. Premium LED panels, downlights, and smart lighting solutions in Pakistan.",
  openGraph: {
    title: "OPPLE Collection | Lighthouse",
    description:
      "Explore the official OPPLE lighting collection at Lighthouse. Premium LED panels, downlights, and smart lighting solutions in Pakistan.",
    type: "website",
  },
  alternates: {
    canonical: "/opple",
    languages: {
      "en-pk": "/opple",
      "x-default": "/opple",
    },
  },
};

interface OpplePageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    price?: string | string[];
    sort?: "featured" | "price_asc" | "price_desc" | "newest";
  }>;
}

export default async function OpplePage({ searchParams }: OpplePageProps) {
  const params = await searchParams;

  const categorySlug = params.category;
  const search = params.search;
  const priceRange = Array.isArray(params.price)
    ? params.price
    : params.price
      ? [params.price]
      : undefined;
  const sortBy = params.sort;

  // Expand category to include all subcategory descendants
  let categorySlugs: string[] | undefined;
  if (categorySlug && categorySlug !== "all") {
    const category = await getCategoryBySlug(categorySlug);
    if (category) {
      categorySlugs = await getDescendantSlugs(String((category as any)._id));
    } else {
      categorySlugs = [categorySlug];
    }
  }

  const [{ products: rawProducts, total }, filterMeta, categoryTree] =
    await Promise.all([
      fetchStoreProducts({
        categorySlugs,
        brandSlug: "opple",
        search,
        priceRange,
        sortBy,
      }),
      fetchFilterMetadata(),
      getCategoryTree({ activeOnly: true }),
    ]);

  const products = rawProducts;

  return (
    <main className="min-h-screen bg-background">
      {/* Opple Distributor Banner */}
      <OppelDistributorBanner hideButton />

      {/* Main Collection Container */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            <ProductFiltersSidebar
              categoryTree={categoryTree}
              brands={[]}
              priceRange={filterMeta.priceRange}
              products={products}
              showCategoryCounts={false}
            />

            <div className="flex-1 min-w-0 mt-6 lg:mt-0">
              <ProductGridToolbar products={products} total={total} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <div className="mt-8 container">
        <CTA />
      </div>
    </main>
  );
}
