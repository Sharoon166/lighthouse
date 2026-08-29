"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const categories = [
  "All Projects",
  "Residential",
  "Commercial",
  "Hospitality",
  "Office",
] as const;

interface ProjectFiltersProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  count: number;
}

export function ProjectFilters({
  activeCategory,
  onCategoryChange,
  search,
  onSearchChange,
  count,
}: ProjectFiltersProps) {
  return (
    <div className="container flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">
          {count} Projects
        </span>
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search Project..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-48 rounded-full border border-border bg-background pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
          />
        </div>
      </div>
    </div>
  );
}
