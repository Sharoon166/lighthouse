import { useMemo } from "react";

export type PaginationItem =
  | { kind: "page"; page: number }
  | { kind: "ellipsis"; id: "start" | "end" };

export interface UsePaginationOptions {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
}

export function usePagination({
  currentPage,
  totalPages,
  siblingCount = 1,
}: UsePaginationOptions) {
  return useMemo(() => {
    const items: PaginationItem[] = [];

    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page += 1) {
        items.push({ kind: "page", page });
      }
      return items;
    }

    const start = Math.max(2, currentPage - siblingCount);
    const end = Math.min(totalPages - 1, currentPage + siblingCount);

    items.push({ kind: "page", page: 1 });

    if (start > 2) {
      items.push({ kind: "ellipsis", id: "start" });
    }

    for (let page = start; page <= end; page += 1) {
      items.push({ kind: "page", page });
    }

    if (end < totalPages - 1) {
      items.push({ kind: "ellipsis", id: "end" });
    }

    items.push({ kind: "page", page: totalPages });

    return items;
  }, [currentPage, totalPages, siblingCount]);
}
