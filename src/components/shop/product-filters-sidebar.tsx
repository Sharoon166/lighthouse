"use client";

import {
  CancelCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FilterHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { CategoryTreeNode } from "@/features/shop/actions/category-actions";
import type { ShopProductItem } from "@/lib/shop-data";

interface FilterSidebarProps {
  categoryTree: CategoryTreeNode[];
  brands: { name: string; slug: string; logo: string; count: number }[];
  priceRange: { min: number; max: number };
  products: ShopProductItem[];
  showCategoryCounts?: boolean;
}

const PRICE_BANDS = [
  { label: "Under Rs. 10,000", value: "under-10k" },
  { label: "Rs. 10,000 – 25,000", value: "10k-25k" },
  { label: "Rs. 25,000 – 50,000", value: "25k-50k" },
  { label: "Rs. 50,000 – 100,000", value: "50k-100k" },
  { label: "Rs. 100,000+", value: "100k-plus" },
];

function collectAncestorSlugs(nodes: CategoryTreeNode[]): Set<string> {
  const slugs = new Set<string>();
  for (const node of nodes) {
    for (const s of node.ancestorSlugs) slugs.add(s);
  }
  return slugs;
}

function CategoryTreeItem({
  node,
  selectedSlug,
  expandedSlugs,
  onToggle,
  onSelect,
  depth,
  showCount,
}: {
  node: CategoryTreeNode;
  selectedSlug: string;
  expandedSlugs: Set<string>;
  onToggle: (slug: string) => void;
  onSelect: (slug: string) => void;
  depth: number;
  showCount: boolean;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedSlugs.has(node.slug);
  const isSelected = selectedSlug === node.slug;

  return (
    <li>
      <button
        type="button"
        onClick={() => {
          onSelect(node.slug);
          if (hasChildren) onToggle(node.slug);
        }}
        className={`flex w-full items-center justify-between py-1.5 text-left text-sm transition-colors ${
          isSelected
            ? "font-semibold text-gold"
            : "text-foreground/80 hover:text-foreground"
        }`}
        style={{ paddingLeft: `${depth * 1}rem` }}
      >
        <span className="flex items-center gap-1.5">
          {hasChildren && (
            <HugeiconsIcon
              icon={isExpanded ? ChevronDownIcon : ChevronRightIcon}
              size={14}
              className="shrink-0 transition-transform duration-200"
            />
          )}
          {node.name}
        </span>
        {showCount && node.productCount > 0 && (
          <span className="text-xs text-muted-foreground">
            ({node.productCount})
          </span>
        )}
      </button>
      {hasChildren && (
        <div
          className="overflow-hidden transition-[grid-template-rows] duration-200 ease-in-out"
          style={{
            display: "grid",
            gridTemplateRows: isExpanded ? "1fr" : "0fr",
          }}
        >
          <ul className="min-h-0">
            {node.children.map((child) => (
              <CategoryTreeItem
                key={child.slug}
                node={child}
                selectedSlug={selectedSlug}
                expandedSlugs={expandedSlugs}
                onToggle={onToggle}
                onSelect={onSelect}
                depth={depth + 1}
                showCount={showCount}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export function ProductFiltersSidebar({
  categoryTree,
  brands,
  products,
  showCategoryCounts = true,
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
  const [selectedBrands, setSelectedBrands] =
    useState<Set<string>>(initialBrands);
  const [selectedPrice, setSelectedPrice] = useState<Set<string>>(initialPrice);

  // Auto-expand ancestors of the current category
  const initialExpanded = useMemo(() => {
    if (!initialCategory || initialCategory === "all") return new Set<string>();
    const slugs = new Set<string>();
    function findAndExpand(nodes: CategoryTreeNode[]): boolean {
      for (const node of nodes) {
        if (node.slug === initialCategory) {
          for (const a of node.ancestorSlugs) slugs.add(a);
          return true;
        }
        if (node.children.length > 0 && findAndExpand(node.children)) {
          slugs.add(node.slug);
          return true;
        }
      }
      return false;
    }
    findAndExpand(categoryTree);
    return slugs;
  }, [categoryTree, initialCategory]);

  const [expandedSlugs, setExpandedSlugs] =
    useState<Set<string>>(initialExpanded);

  const toggleExpand = useCallback((slug: string) => {
    setExpandedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

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
    (category !== "all" ? 1 : 0) + selectedBrands.size + selectedPrice.size;

  const filterContent = (
    <div className="space-y-8">
      {/* Category tree */}
      {categoryTree.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            CATEGORY
          </h3>
          <ul className="space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={`flex w-full items-center justify-between py-1 text-left text-sm transition-colors ${
                  category === "all"
                    ? "font-semibold text-gold"
                    : "text-foreground/80 hover:text-foreground"
                }`}
              >
                <span>All Products</span>
              </button>
            </li>
            {categoryTree.map((node) => (
              <CategoryTreeItem
                key={node.slug}
                node={node}
                selectedSlug={category}
                expandedSlugs={expandedSlugs}
                onToggle={toggleExpand}
                onSelect={setCategory}
                depth={0}
                showCount={showCategoryCounts}
              />
            ))}
          </ul>
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
      <div className="lg:hidden">
        <Button
          type="button"
          variant="secondary"
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
