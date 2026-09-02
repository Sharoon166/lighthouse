import type { Metadata } from "next";
import { CTA } from "@/components/hero/cta";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { CategorySearchFilter } from "@/components/shop/category-search-filter";
import { fetchStoreCategories } from "@/lib/shop-data";

export const metadata: Metadata = {
  title: "Our Categories · Light House",
  description:
    "Explore our curated lighting collections, thoughtfully selected to bring warmth, character, and style to every space.",
};

export default async function CategoriesPage() {
  const categories = await fetchStoreCategories();

  return (
    <main className="min-h-screen bg-background">
      {/* Dark Navy Hero Section */}
      <section className="bg-noise py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="mx-auto max-w-7xl space-y-4">
          <Breadcrumb
            items={[{ label: "Home", href: "/" }, { label: "Categories" }]}
          />
          <div className="max-w-2xl space-y-3 pt-2">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white">
              Our Categories
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
              Explore our curated lighting collections, thoughtfully selected to
              bring warmth, character, and style to every space.
            </p>
          </div>
        </div>
      </section>

      {/* Main Categories Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <CategorySearchFilter categories={categories} />
        </div>
      </section>

      {/* CTA Banner Section */}
      <div className="mt-8">
        <CTA />
      </div>
    </main>
  );
}
