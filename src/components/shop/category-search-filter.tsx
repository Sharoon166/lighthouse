"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ShopCategoryItem } from "@/lib/shop-data";

interface CategorySearchFilterProps {
  categories: ShopCategoryItem[];
}

export function CategorySearchFilter({ categories }: CategorySearchFilterProps) {
  const [query, setQuery] = useState("");

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header bar: Count & Search bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          {filtered.length} {filtered.length === 1 ? "category" : "categories"}
        </span>

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
      </div>

      {/* Grid of Categories matching Image 0 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group relative flex flex-col justify-end overflow-hidden rounded-xl bg-slate-900 p-6 min-h-[260px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-white/10"
          >
            {/* Background Image */}
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-center opacity-70 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-80"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

            {/* Content overlay */}
            <div className="relative z-10 space-y-1">
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
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No categories found matching &quot;{query}&quot;.
        </div>
      )}
    </div>
  );
}
