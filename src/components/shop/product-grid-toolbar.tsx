"use client";

import { ListViewIcon, Search01Icon, Grid3X3Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Pagination } from "@/components/shared/pagination";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { ShopProductItem } from "@/lib/shop-data";
import { ProductCard } from "./product-card";
import { ProductListItem } from "./product-list-item";
import { cn } from "@/lib/utils";

interface ProductGridToolbarProps {
  products: ShopProductItem[];
  total: number;
}

const PAGE_SIZE = 12;

type ViewMode = "grid" | "list";

export function ProductGridToolbar({
  products,
  total,
}: ProductGridToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page") || "1");
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const [searchVal, setSearchVal] = useState(searchParams.get("search") || "");
  const [view, setView] = useLocalStorage<ViewMode>("lighthouse:products-view", "grid");
  const isSmallScreen = !useMediaQuery("(min-width: 640px)");
  const effectiveView = isSmallScreen ? "grid" : view;

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

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Top bar: Search input + View toggle + Stats counter + Sort dropdown */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
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

        {/* View Toggle, Counter and Sort */}
        <div className="flex items-center justify-between md:justify-end gap-4 text-sm text-muted-foreground">

          <span>
            {total} products
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
          {/* View Toggle */}
          <div className={cn("flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1", isSmallScreen && "hidden")}>
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={cn(
                "flex size-7 items-center justify-center rounded-sm transition-colors",
                view === "grid"
                  ? "bg-secondary text-secondary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <HugeiconsIcon icon={Grid3X3Icon} size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              className={cn(
                "flex size-7 items-center justify-center rounded-md transition-colors",
                view === "list"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <HugeiconsIcon icon={ListViewIcon} size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid or List */}
      {products.length > 0 ? (
        effectiveView === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {products.map((product) => (
              <ProductListItem key={product.id} product={product} />
            ))}
          </div>
        )
      ) : (
        <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground">
          No products matched your criteria. Try clearing filters.
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
