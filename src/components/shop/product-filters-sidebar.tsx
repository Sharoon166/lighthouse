"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface CategoryOption {
  name: string;
  slug: string;
  count: number;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { name: "All Products", slug: "all", count: 1234 },
  { name: "Pendant Lights", slug: "pendant-lights", count: 42 },
  { name: "Chandeliers", slug: "chandeliers", count: 15 },
  { name: "Wall Lights", slug: "wall-lights", count: 28 },
  { name: "Floor Lamp", slug: "floor-lamp", count: 41 },
  { name: "Desk Lamp", slug: "desk-lamp", count: 18 },
  { name: "Ceiling Lights", slug: "ceiling-lights", count: 32 },
];

const DESIGN_OPTIONS = ["Art Deco", "Modern", "Nordic", "Industrial", "Rustic"];

const PRICE_OPTIONS = [
  { label: "Under Rs. 10,000", value: "under-10k" },
  { label: "Rs. 10,000 - 25,000", value: "10k-25k" },
  { label: "Rs. 25,000 - 50,000", value: "25k-50k" },
  { label: "Rs. 50,000 - 100,000", value: "50k-100k" },
  { label: "Rs. 100,000+", value: "100k-plus" },
];

const MATERIAL_OPTIONS = ["Brass", "Ceramic", "Hand-blown Glass", "Steel", "Wood"];

export function ProductFiltersSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") || "all";
  const activeDesign = searchParams.getAll("design");
  const activePrice = searchParams.getAll("price");
  const activeMaterial = searchParams.getAll("material");

  const createQueryString = useCallback(
    (name: string, value: string, isArray = false) => {
      const params = new URLSearchParams(searchParams.toString());

      if (!isArray) {
        if (value && value !== "all") {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      } else {
        const currentVals = params.getAll(name);
        if (currentVals.includes(value)) {
          const updated = currentVals.filter((v) => v !== value);
          params.delete(name);
          updated.forEach((v) => params.append(name, v));
        } else {
          params.append(name, value);
        }
      }

      params.set("page", "1");
      return params.toString();
    },
    [searchParams],
  );

  const handleCategorySelect = (slug: string) => {
    const query = createQueryString("category", slug);
    router.push(`${pathname}?${query}`);
  };

  const handleCheckboxToggle = (paramKey: string, val: string) => {
    const query = createQueryString(paramKey, val, true);
    router.push(`${pathname}?${query}`);
  };

  const handleClearAll = () => {
    router.push(pathname);
  };

  return (
    <aside className="w-full lg:w-64 space-y-8 shrink-0 border-r border-border/40 pr-0 lg:pr-6">
      {/* Category List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          CATEGORY
        </h3>
        <div className="space-y-1.5 text-sm">
          {CATEGORY_OPTIONS.map((cat) => {
            const isSelected = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                className={`flex w-full items-center justify-between py-1 text-left transition-colors ${
                  isSelected
                    ? "font-semibold text-gold"
                    : "text-foreground/80 hover:text-foreground"
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-xs text-muted-foreground">({cat.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border/60 pt-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          DESIGN
        </h3>
        <div className="space-y-2">
          {DESIGN_OPTIONS.map((design) => {
            const checked = activeDesign.includes(design);
            return (
              <label
                key={design}
                className="flex items-center gap-2.5 text-sm text-foreground/80 cursor-pointer hover:text-foreground"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCheckboxToggle("design", design)}
                  className="size-4 rounded border-border text-gold focus:ring-gold"
                />
                <span>{design}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border/60 pt-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          PRICE RANGE
        </h3>
        <div className="space-y-2">
          {PRICE_OPTIONS.map((price) => {
            const checked = activePrice.includes(price.value);
            return (
              <label
                key={price.value}
                className="flex items-center gap-2.5 text-sm text-foreground/80 cursor-pointer hover:text-foreground"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCheckboxToggle("price", price.value)}
                  className="size-4 rounded border-border text-gold focus:ring-gold"
                />
                <span>{price.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border/60 pt-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          MATERIAL
        </h3>
        <div className="space-y-2">
          {MATERIAL_OPTIONS.map((mat) => {
            const checked = activeMaterial.includes(mat);
            return (
              <label
                key={mat}
                className="flex items-center gap-2.5 text-sm text-foreground/80 cursor-pointer hover:text-foreground"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCheckboxToggle("material", mat)}
                  className="size-4 rounded border-border text-gold focus:ring-gold"
                />
                <span>{mat}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border/60 pt-6">
        <button
          type="button"
          onClick={handleClearAll}
          className="w-full rounded-md border border-border bg-background py-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-muted transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </aside>
  );
}
