"use client";

import { Search01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { ShopCategoryItem } from "@/lib/shop-data";

interface CategorySearchFilterProps {
  categories: ShopCategoryItem[];
}

export function CategorySearchFilter({
  categories,
}: CategorySearchFilterProps) {
  const [query, setQuery] = useState("");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const filtered = useMemo(() => {
    const result = categories.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase()),
    );

    if (showFeaturedOnly) {
      return result.filter((c) => c.featured);
    }

    // Sort featured first
    return [...result].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [categories, query, showFeaturedOnly]);

  const featuredCount = categories.filter((c) => c.featured).length;

  return (
    <div className="space-y-6 container">
      {/* Header bar: Count, Search bar & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Category..."
            className="w-full rounded-md border border-border/80 bg-background px-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
          />
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="absolute left-3 top-2.5 text-muted-foreground pointer-events-none"
          />
        </div>

        <div className="flex items-center gap-3">
          {featuredCount > 0 && (
            <button
              type="button"
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                showFeaturedOnly
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"
              }`}
            >
              <HugeiconsIcon icon={StarIcon} size={12} />
              Featured
            </button>
          )}
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            {filtered.length}{" "}
            {filtered.length === 1 ? "category" : "categories"}
          </span>
        </div>
      </div>

      {/* Grid of Categories matching Image 0 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative flex flex-col justify-end overflow-hidden bg-noise p-6 aspect-3/2"
          >
            {/* Background Image */}
            <Image
              src={category.image || "/wall-lights.png"}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />

            {/* Featured badge */}
            {category.featured && (
              <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-gold/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-black backdrop-blur-sm">
                <HugeiconsIcon icon={StarIcon} size={10} />
                Featured
              </span>
            )}

            {/* Content overlay */}
            <div className="relative z-10 space-y-1 mb-auto">
              <h3 className="font-heading text-2xl font-semibold tracking-tight text-white group-hover:text-gold transition-colors">
                {category.name}
              </h3>
              <p className="text-xs font-semibold tracking-widest text-gold uppercase">
                {category.designsCount} DESIGNS
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <Empty className="rounded-xl border border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Search01Icon} size={24} />
            </EmptyMedia>
            <EmptyTitle>No categories found</EmptyTitle>
            <EmptyDescription>
              No categories found matching &quot;{query}&quot;.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
