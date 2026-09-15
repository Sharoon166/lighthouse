import type { Metadata } from "next";
import { CTA } from "@/components/hero/cta";
import { PageHero } from "@/components/shared/page-hero";
import { ProductFiltersSidebar } from "@/components/shop/product-filters-sidebar";
import { ProductGridToolbar } from "@/components/shop/product-grid-toolbar";
import { getCategoryTree } from "@/features/shop/actions/category-actions";
import {
  fetchFilterMetadata,
  fetchStoreProducts,
  type ShopProductItem,
} from "@/lib/shop-data";

export const metadata: Metadata = {
  title: "Our Collection | Lighthouse",
  description:
    "Explore our curated lighting collections, thoughtfully selected to bring warmth, character, and style to every space.",
  openGraph: {
    title: "Our Collection | Lighthouse",
    description:
      "Explore our curated lighting collections, thoughtfully selected to bring warmth, character, and style to every space.",
    type: "website",
  },
  alternates: {
    canonical: "/products",
  },
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string | string[];
    search?: string;
    price?: string | string[];
    sort?: "featured" | "price_asc" | "price_desc" | "newest";
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const categorySlug = params.category;
  const search = params.search;
  const brandSlug = Array.isArray(params.brand)
    ? params.brand
    : params.brand
      ? [params.brand]
      : undefined;
  const priceRange = Array.isArray(params.price)
    ? params.price
    : params.price
      ? [params.price]
      : undefined;
  const sortBy = params.sort;

  const [
    { products: rawProducts, total },
    filterMeta,
    newArrivalsResult,
    categoryTree,
  ] = await Promise.all([
    fetchStoreProducts({
      categorySlug,
      search,
      brandSlug: brandSlug?.[0],
      priceRange,
      sortBy,
    }),
    fetchFilterMetadata(),
    fetchStoreProducts({ sortBy: "newest" }),
    getCategoryTree({ activeOnly: true }),
  ]);

  const products = JSON.parse(JSON.stringify(rawProducts));
  const newArrivals: ShopProductItem[] = JSON.parse(
    JSON.stringify(newArrivalsResult.products.slice(0, 20)),
  );

  const showNewArrivals =
    !categorySlug &&
    !search &&
    !brandSlug?.length &&
    !priceRange?.length &&
    !sortBy;

  return (
    <main className="min-h-screen bg-background">
      {/* Dark Navy Hero Header */}
      <PageHero
        title="Our Collection"
        description="Explore our curated lighting collections, thoughtfully selected to bring warmth, character, and style to every space."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Products" }]}
      />

      {/* New Arrivals */}
      {/*{showNewArrivals && newArrivals.length > 0 && (
        <section className="py-10 md:py-14 px-4 sm:px-6 lg:px-8 border-b border-border/40">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl sm:text-3xl text-secondary">
                New Arrivals
              </h2>
              <Link
                href="/products?sort=newest"
                className="text-sm text-gold hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}*/}

      {/* Main Collection Container */}
      <section className="container">
        <div className="flex flex-col lg:flex-row gap-8">
          <ProductFiltersSidebar
            categoryTree={categoryTree}
            brands={filterMeta.brands}
            priceRange={filterMeta.priceRange}
            products={products}
          />

          {/* Product Grid */}
          <div className="flex-1 min-w-0 mt-6 lg:mt-0">
            <ProductGridToolbar products={products} total={total} />
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
