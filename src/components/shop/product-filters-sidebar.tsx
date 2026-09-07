"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

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

const MATERIAL_OPTIONS = [
  "Brass",
  "Ceramic",
  "Hand-blown Glass",
  "Steel",
  "Wood",
];

export function ProductFiltersSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("category") || "all";
  const initialDesign = useMemo(() => new Set(searchParams.getAll("design")), [searchParams]);
  const initialPrice = useMemo(() => new Set(searchParams.getAll("price")), [searchParams]);
  const initialMaterial = useMemo(() => new Set(searchParams.getAll("material")), [searchParams]);

  const [category, setCategory] = useState(initialCategory);
  const [design, setDesign] = useState<Set<string>>(initialDesign);
  const [price, setPrice] = useState<Set<string>>(initialPrice);
  const [material, setMaterial] = useState<Set<string>>(initialMaterial);

  const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (category && category !== "all") params.set("category", category);
    design.forEach((v) => params.append("design", v));
    price.forEach((v) => params.append("price", v));
    material.forEach((v) => params.append("material", v));
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearAll = () => {
    setCategory("all");
    setDesign(new Set());
    setPrice(new Set());
    setMaterial(new Set());
    router.push(pathname);
  };

  const hasChanges =
    category !== initialCategory ||
    design.size !== initialDesign.size ||
    price.size !== initialPrice.size ||
    material.size !== initialMaterial.size ||
    [...design].some((v) => !initialDesign.has(v)) ||
    [...price].some((v) => !initialPrice.has(v)) ||
    [...material].some((v) => !initialMaterial.has(v));

  return (
    <aside className="w-full lg:w-64 space-y-8 shrink-0 border-r border-border/40 pr-0 lg:pr-6">
      {/* Category List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          CATEGORY
        </h3>
        <div className="space-y-1.5 text-sm">
          {CATEGORY_OPTIONS.map((cat) => {
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

      <div className="border-t border-border/60 pt-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          DESIGN
        </h3>
        <div className="space-y-2">
          {DESIGN_OPTIONS.map((d) => {
            const checked = design.has(d);
            return (
              <label
                key={d}
                className="flex items-center gap-2.5 text-sm text-foreground/80 cursor-pointer hover:text-foreground"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSet(setDesign, d)}
                  className="size-4 rounded border-border text-gold focus:ring-gold"
                />
                <span>{d}</span>
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
          {PRICE_OPTIONS.map((p) => {
            const checked = price.has(p.value);
            return (
              <label
                key={p.value}
                className="flex items-center gap-2.5 text-sm text-foreground/80 cursor-pointer hover:text-foreground"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSet(setPrice, p.value)}
                  className="size-4 rounded border-border text-gold focus:ring-gold"
                />
                <span>{p.label}</span>
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
          {MATERIAL_OPTIONS.map((m) => {
            const checked = material.has(m);
            return (
              <label
                key={m}
                className="flex items-center gap-2.5 text-sm text-foreground/80 cursor-pointer hover:text-foreground"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSet(setMaterial, m)}
                  className="size-4 rounded border-border text-gold focus:ring-gold"
                />
                <span>{m}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border/60 pt-6 space-y-3">
        <Button
          type="button"
          onClick={applyFilters}
          disabled={!hasChanges}
          className="w-full bg-gold text-white hover:bg-gold/90"
        >
          Apply Filters
        </Button>
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
