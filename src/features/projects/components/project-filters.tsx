"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import { ScrollBlurContainer } from "@/components/shared/scroll-blur-container";
import { Button } from "@/components/ui/button";

const allCategories = [
  { label: "All Projects", value: "all" },
  ...PROJECT_CATEGORIES,
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
    <div className="container flex flex-col-reverse gap-4 py-8 md:flex-row md:items-center md:justify-between">
      <div className="w-full min-w-0 lg:flex-1">
        <ScrollBlurContainer>
          <nav
            aria-label="Blog categories"
            className="grow flex flex-wrap items-center gap-2"
          >
            {allCategories.map((cat) => (
              <Button
                key={cat.value}
                variant={activeCategory === cat.value ? "secondary" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => onCategoryChange(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </nav>
        </ScrollBlurContainer>
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
