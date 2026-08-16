"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  siblingCount?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  pageSizeOptions = [8, 16, 32],
  onPageSizeChange,
  siblingCount,
  className,
}: PaginationProps) {
  const pages = usePagination({ currentPage, totalPages, siblingCount });

  const firstItem =
    totalItems != null && totalItems > 0
      ? (currentPage - 1) * (pageSize ?? 1) + 1
      : 0;
  const lastItem =
    totalItems != null
      ? Math.min(currentPage * (pageSize ?? 1), totalItems)
      : 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {totalItems != null && (
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">{firstItem}</span>–
            <span className="font-medium text-foreground">{lastItem}</span> of{" "}
            <span className="font-medium text-foreground">{totalItems}</span>
          </p>
        )}
        {onPageSizeChange && pageSize != null && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="sr-only">Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav
        aria-label="Pagination"
        className="flex flex-wrap items-center gap-1.5"
      >
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        </Button>

        {pages.map((item) =>
          item.kind === "ellipsis" ? (
            <span
              key={item.id}
              className="flex size-8 items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={item.page}
              type="button"
              variant={item.page === currentPage ? "default" : "outline"}
              size="icon-sm"
              aria-label={`Page ${item.page}`}
              aria-current={item.page === currentPage ? "page" : undefined}
              onClick={() => onPageChange(item.page)}
            >
              {item.page}
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
        </Button>
      </nav>
    </div>
  );
}
