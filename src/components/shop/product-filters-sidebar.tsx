"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { FilterHorizontalIcon, CancelCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import type { ShopProductItem } from "@/lib/shop-data";

interface FilterSidebarProps {
  categories: { name: string; slug: string; count: number }[];
  brands: { name: string; slug: string; logo: string; count: number }[];
  priceRange: { min: number; max: number };
  products: ShopProductItem[];
}

const PRICE_BANDS = [
  { label: "Under Rs. 10,000", value: "under-10k" },
  { label: "Rs. 10,000 – 25,000", value: "10k-25k" },
  { label: "Rs. 25,000 – 50,000", value: "25k-50k" },
  { label: "Rs. 50,000 – 100,000", value: "50k-100k" },
  { label: "Rs. 100,000+", value: "100k-plus" },
];

export function ProductFiltersSidebar({
  categories,
  brands,
  products,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initialCategory = searchParams.get("category") || "all";
  const initialBrands = useMemo(
    () => new Set(searchParams.getAll("brand")),
    [searchParams],
  );
  const initialPrice = useMemo(
    () => new Set(searchParams.getAll("price")),
    [searchParams],
  );

  const [category, setCategory] = useState(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(initialBrands);
  const [selectedPrice, setSelectedPrice] = useState<Set<string>>(initialPrice);

  const toggleSet = (
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    value: string,
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (category && category !== "all") params.set("category", category);
    selectedBrands.forEach((v) => params.append("brand", v));
    selectedPrice.forEach((v) => params.append("price", v));
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    setMobileOpen(false);
  }, [category, selectedBrands, selectedPrice, pathname, router]);

  const handleClearAll = useCallback(() => {
    setCategory("all");
    setSelectedBrands(new Set());
    setSelectedPrice(new Set());
    router.push(pathname);
    setMobileOpen(false);
  }, [pathname, router]);

  const hasChanges =
    category !== initialCategory ||
    selectedBrands.size !== initialBrands.size ||
    selectedPrice.size !== initialPrice.size ||
    [...selectedBrands].some((v) => !initialBrands.has(v)) ||
    [...selectedPrice].some((v) => !initialPrice.has(v));

  const activeFilterCount =
    (category !== "all" ? 1 : 0) +
    selectedBrands.size +
    selectedPrice.size;

  const filterContent = (
    <div className="space-y-8">
      {/* Category — only show if categories are provided */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            CATEGORY
          </h3>
          <div className="space-y-1.5 text-sm">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`flex w-full items-center justify-between py-1 text-left transition-colors ${
                category === "all"
                  ? "font-semibold text-gold"
                  : "text-foreground/80 hover:text-foreground"
              }`}
            >
              <span>All Products</span>
              <span className="text-xs text-muted-foreground">
                ({products.length})
              </span>
            </button>
            {categories.map((cat) => {
              const isSelected = category === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setCategory(cat.slug)}
                  className={`flex w-full items-center justify-between py-1 text-left transition-colors ${
                    isSelected
                      ? "font-semibold text-gold"
                      : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({cat.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand */}
      {brands.length > 0 && (
        <div className="border-t border-border/60 pt-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            BRAND
          </h3>
          <div className="space-y-2">
            {brands.map((b) => {
              const checked = selectedBrands.has(b.slug);
              return (
                <label
                  key={b.slug}
                  className="flex items-center gap-2.5 text-sm text-foreground/80 cursor-pointer hover:text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSet(setSelectedBrands, b.slug)}
                    className="size-4 rounded border-border text-gold focus:ring-gold"
                  />
                  <span>{b.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    ({b.count})
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="border-t border-border/60 pt-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          PRICE RANGE
        </h3>
        <div className="space-y-2">
          {PRICE_BANDS.map((p) => {
            const checked = selectedPrice.has(p.value);
            return (
              <label
                key={p.value}
                className="flex items-center gap-2.5 text-sm text-foreground/80 cursor-pointer hover:text-foreground"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSet(setSelectedPrice, p.value)}
                  className="size-4 rounded border-border text-gold focus:ring-gold"
                />
                <span>{p.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-border/60 pt-6 space-y-3">
        <Button
          type="button"
          onClick={applyFilters}
          disabled={!hasChanges}
          className="w-full bg-gold text-white hover:bg-gold/90"
        >
          Apply Filters
        </Button>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="w-full rounded-md border border-border bg-background py-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-muted transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile: filter button ── */}
      <div className="lg:hidden mb-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-full"
        >
          <HugeiconsIcon icon={FilterHorizontalIcon} size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 rounded-full bg-gold text-white text-xs w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden bg-background rounded-t-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <h2 className="font-serif text-lg font-semibold">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-md hover:bg-muted"
              >
                <HugeiconsIcon icon={CancelCircleIcon} size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              {filterContent}
            </div>
            <div className="border-t border-border/40 px-5 py-3">
              <Button
                type="button"
                onClick={applyFilters}
                className="w-full bg-gold text-white hover:bg-gold/90"
              >
                Show {products.length} results
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ── Desktop: sidebar ── */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-border/40 pr-6">
        {filterContent}
      </aside>
    </>
  );
}
