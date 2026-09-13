import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTA } from "@/components/hero/cta";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ProductFiltersSidebar } from "@/components/shop/product-filters-sidebar";
import { ProductGridToolbar } from "@/components/shop/product-grid-toolbar";
import {
  getCategoryBySlug,
  getSubcategories,
} from "@/features/shop/actions/category-actions";
import { generateSeoMetadata } from "@/lib/seo-helpers";
import {
  fetchFilterMetadata,
  fetchStoreProducts,
  type ShopProductItem,
} from "@/lib/shop-data";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    brand?: string | string[];
    search?: string;
    price?: string | string[];
    sort?: "featured" | "price_asc" | "price_desc" | "newest";
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found | Lighthouse" };
  }

  return generateSeoMetadata({
    title: category.seo?.metaTitle || `${category.name} | Lighthouse`,
    description:
      category.seo?.metaDescription ||
      category.description ||
      `Explore our ${category.name} collection at Lighthouse.`,
    path: `/categories/${category.slug}`,
    image: category.image,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const categoryId = String((category as any)._id);
  const subcategories = await getSubcategories(categoryId);

  const brandSlug = Array.isArray(sp.brand)
    ? sp.brand
    : sp.brand
      ? [sp.brand]
      : undefined;
  const priceRange = Array.isArray(sp.price)
    ? sp.price
    : sp.price
      ? [sp.price]
      : undefined;

  const [{ products: rawProducts, total }, filterMeta] = await Promise.all([
    fetchStoreProducts({
      categorySlug: slug,
      search: sp.search,
      brandSlug: brandSlug?.[0],
      priceRange,
      sortBy: sp.sort,
    }),
    fetchFilterMetadata(),
  ]);

  const products: ShopProductItem[] = JSON.parse(JSON.stringify(rawProducts));

  const filteredBrands = filterMeta.brands.filter((b) => {
    return products.some(
      (p) =>
        p.categorySlug === slug ||
        p.specifications?.some(
          (s) =>
            s.key === "Brand" && s.value.toLowerCase() === b.name.toLowerCase(),
        ),
    );
  });

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-noise grid overflow-hidden pb-0 lg:grid-cols-5 lg:pt-0 place-items-center min-h-96">
        <div className="container space-y-6 lg:col-start-1 lg:col-span-2 lg:row-start-1 z-10 max-lg:pt-10 lg:ml-28">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Categories", href: "/categories" },
              { label: category.name },
            ]}
          />
          <h1 className="lg:text-5xl">{category.name}</h1>
          {category.description && (
            <p className="max-w-2xl">{category.description}</p>
          )}
        </div>

        {category.featuredImage && (
          <Image
            src={category.featuredImage}
            width={1024}
            height={1024}
            priority
            alt={category.name}
            className="max-h-96 w-full object-contain brightness-125 transition-all duration-500 lg:col-start-3 lg:col-span-5 lg:row-start-1"
          />
        )}
      </section>

      {subcategories.length > 0 && (
        <section className="p-0">
          <div className="container py-6">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categories/${sub.slug}`}
                  className="group flex shrink-0 items-center gap-3 rounded-full border border-border bg-background px-4 py-2.5 transition-all hover:border-gold hover:bg-gold/5"
                >
                  <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted">
                    {sub.image && (
                      <Image
                        src={sub.image}
                        alt={sub.name}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    )}
                  </div>
                  <span className="whitespace-nowrap text-sm font-medium transition-colors group-hover:text-gold">
                    {sub.name}
                  </span>
                  {sub.productCount > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      ({sub.productCount})
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container">
        <div className="flex flex-col gap-8 lg:flex-row">
          <ProductFiltersSidebar
            categories={[]}
            brands={filteredBrands}
            priceRange={filterMeta.priceRange}
            products={products}
          />

          <div className="min-w-0 flex-1 mt-6 lg:mt-0">
            <ProductGridToolbar products={products} total={total} />
          </div>
        </div>
      </section>

      <div className="container mt-8">
        <CTA />
      </div>
    </main>
  );
}
