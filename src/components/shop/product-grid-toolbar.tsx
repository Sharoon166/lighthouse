"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { ShopProductItem } from "@/lib/shop-data";
import { ProductCard } from "./product-card";

interface ProductGridToolbarProps {
  products: ShopProductItem[];
  total: number;
}

export function ProductGridToolbar({
  products,
  total,
}: ProductGridToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchVal, setSearchVal] = useState(searchParams.get("search") || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal.trim()) {
      params.set("search", searchVal.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Top bar: Search input + Stats counter + Sort dropdown */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-border pb-4">
        {/* Search bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md"
        >
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-md border border-border bg-background px-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="absolute left-3 top-2.5 text-muted-foreground pointer-events-none"
          />
        </form>

        {/* Counter and Sort */}
        <div className="flex items-center justify-between md:justify-end gap-4 text-xs text-muted-foreground">
          <span>
            {total} products | Page 1 of {Math.max(1, Math.ceil(total / 12))}
          </span>
          <select
            onChange={handleSortChange}
            defaultValue={searchParams.get("sort") || "featured"}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-gold focus:outline-none"
          >
            <option value="featured">Sort by: Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* 3-Column Product Grid matching Image 1 */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: formatCurrency(product.price),
                image: product.images[0] || "/products/1.png",
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground">
          No products matched your criteria. Try clearing filters.
        </div>
      )}

      {/* Pagination controls matching Image 1 */}
      <div className="flex items-center justify-center gap-2 border-t border-border/60 pt-8">
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-semibold rounded border border-border bg-background text-muted-foreground hover:bg-muted"
        >
          &lt;
        </button>
        <button
          type="button"
          className="px-3.5 py-1.5 text-xs font-semibold rounded bg-slate-900 text-white"
        >
          1
        </button>
        <button
          type="button"
          className="px-3.5 py-1.5 text-xs font-semibold rounded border border-border bg-background text-foreground hover:bg-muted"
        >
          2
        </button>
        <button
          type="button"
          className="px-3.5 py-1.5 text-xs font-semibold rounded border border-border bg-background text-foreground hover:bg-muted"
        >
          3
        </button>
        <button
          type="button"
          className="px-3.5 py-1.5 text-xs font-semibold rounded border border-border bg-background text-foreground hover:bg-muted"
        >
          4
        </button>
        <button
          type="button"
          className="px-3.5 py-1.5 text-xs font-semibold rounded border border-border bg-background text-foreground hover:bg-muted"
        >
          5
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-semibold rounded border border-border bg-background text-muted-foreground hover:bg-muted"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
