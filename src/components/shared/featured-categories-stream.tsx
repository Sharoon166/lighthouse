"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/lib/utils";
import type { HomepageCategory } from "@/lib/shop-data";

// Static fallback — same IDs map to /public/{id}.png images
const FALLBACK: HomepageCategory[] = [
  { id: "pendant-lights", title: "Pendant Lights", slug: "pendant-lights", href: "/categories/pendant-lights", items: 0 },
  { id: "floor-lamps", title: "Floor Lamps", slug: "floor-lamps", href: "/categories/floor-lamps", items: 0 },
  { id: "wall-lights", title: "Wall lights", slug: "wall-lights", href: "/categories/wall-lights", items: 0 },
  { id: "chandeliers", title: "Chandeliers", slug: "chandeliers", href: "/categories/chandeliers", items: 0 },
];

function CategoryGrid({ categories }: { categories: HomepageCategory[] }) {
  return (
    <section>
      <SectionHeader
        title="Lighting Collections for Every Space"
        description="Explore our curated range of premium lighting solutions for homes, offices and commercial environments. Find the perfect fixture for every style and every space."
        ctaText="View All Categories"
        ctaHref="/categories"
      />

      <div className="grid grid-cols-12 gap-4">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={category.href}
            className={cn(
              "relative overflow-hidden bg-contain p-6 min-h-66 h-full",
              {
                "col-span-12 row-span-1 md:col-span-6 lg:col-span-8":
                  index === 0,
                "col-span-6 row-span-1 min-h-66 md:col-span-6 lg:col-span-4 lg:row-span-2":
                  index === 1,
                "col-span-6 row-span-1 h-66 md:col-span-6 lg:col-span-4":
                  index === 2,
                "col-span-12 row-span-1 min-h-62 md:col-span-6 lg:col-span-4":
                  index === 3,
              },
            )}
          >
            <h3 className="text-xl font-normal tracking-tight text-primary">
              {category.title}
            </h3>
            <p className="uppercase tracking-widest text-gold">
              {category.items} Designs
            </p>

            <Image
              src={`/${category.id}.png`}
              width={1024}
              height={1024}
              alt={`${category.title} lighting collection`}
              className="absolute -z-10 right-0 top-0 h-full w-full object-cover brightness-180"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Streaming wrapper — unwraps the categories promise with `use()`.
 * Suspense in the parent handles the loading state.
 */
export function FeaturedCategoriesStream({
  promise,
}: {
  promise: Promise<HomepageCategory[]>;
}) {
  const categories = use(promise);
  return <CategoryGrid categories={categories} />;
}

/**
 * Fallback — renders the same grid with static fallback data.
 * Used as the Suspense fallback so images start downloading immediately.
 */
export function FeaturedCategoriesFallback() {
  return <CategoryGrid categories={FALLBACK} />;
}
