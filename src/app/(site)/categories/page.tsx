import type { Metadata } from "next";
import { CTA } from "@/components/hero/cta";
import { PageHero } from "@/components/shared/page-hero";
import { CategorySearchFilter } from "@/components/shop/category-search-filter";
import { fetchStoreCategories } from "@/lib/shop-data";

export const metadata: Metadata = {
  title: "Our Categories | Lighthouse",
  description:
    "Browse lighting by category — pendant lights, chandeliers, wall lights, floor lamps, and more. Find the perfect fixture for every room.",
  openGraph: {
    title: "Our Categories | Lighthouse",
    description:
      "Browse lighting by category — pendant lights, chandeliers, wall lights, floor lamps, and more. Find the perfect fixture for every room.",
    type: "website",
  },
  alternates: {
    canonical: "/categories",
    languages: {
      "en-pk": "/categories",
      "x-default": "/categories",
    },
  },
};

export default async function CategoriesPage() {
  const categories = await fetchStoreCategories();

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        title="Our Categories"
        description="Explore our curated lighting collections, thoughtfully selected to bring warmth, character, and style to every space."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Categories" }]}
      />

      {/* Main Categories Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <CategorySearchFilter categories={categories} />
        </div>
      </section>

      {/* CTA Banner Section */}
      <div className="container">
        <CTA />
      </div>
    </main>
  );
}
