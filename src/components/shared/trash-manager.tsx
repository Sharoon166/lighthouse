"use client";

import {
  Delete02Icon,
  DeleteThrowIcon,
  RestoreBinIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { useConfirm } from "@/components/shared/confirm-provider";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export interface NormalizedTrashResult<TItem> {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DeleteConfirmConfig {
  title: string;
  description: React.ReactNode;
  matchText?: string;
  matchLabel?: string;
}

export interface TrashManagerProps<TItem> {
  fetchItems: (input: {
    page: number;
    pageSize: number;
    search: string;
  }) => Promise<NormalizedTrashResult<TItem>>;
  restoreItem: (item: TItem) => Promise<{ ok: boolean; message?: string }>;
  deleteItem: (item: TItem) => Promise<{ ok: boolean; message?: string }>;
  renderItemContent: (item: TItem) => React.ReactNode;
  renderItemMeta: (item: TItem) => React.ReactNode;
  getItemId: (item: TItem) => string;
  getItemName: (item: TItem) => string;
  getDeleteConfirmConfig: (item: TItem) => DeleteConfirmConfig;
  emptyMessage: string | ((search: string) => string);
  initialData?: NormalizedTrashResult<TItem>;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
}

const SKELETON_KEYS = ["one", "two", "three", "four", "five"];

export function TrashManager<TItem>({
  fetchItems,
  restoreItem,
  deleteItem,
  renderItemContent,
  renderItemMeta,
  getItemId,
  getItemName,
  getDeleteConfirmConfig,
  emptyMessage,
  initialData,
  defaultPageSize = 20,
  pageSizeOptions = [10, 20, 50],
}: TrashManagerProps<TItem>) {
  const { confirm } = useConfirm();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [data, setData] = useState<NormalizedTrashResult<TItem> | null>(
    initialData ?? null,
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const skipInitialFetch = useRef(Boolean(initialData));
  const fetchItemsRef = useRef(fetchItems);
  fetchItemsRef.current = fetchItems;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }

    let cancelled = false;

    setIsLoading(true);
    setError(null);

    fetchItemsRef
      .current({ page, pageSize, search: debouncedSearch })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load the trash. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch]);

  const refresh = async () => {
    const result = await fetchItemsRef.current({
      page,
      pageSize,
      search: debouncedSearch,
    });
    setData(result);
  };

  const handleRestore = async (item: TItem) => {
    setActionError(null);
    setIsBusy(true);
    const result = await restoreItem(item);
    setIsBusy(false);

    if (!result.ok) {
      setActionError(result.message ?? "Could not restore this item.");
      return;
    }
    await refresh();
  };

  const handleDeleteForever = async (item: TItem) => {
    setActionError(null);

    const config = getDeleteConfirmConfig(item);
    const confirmed = await confirm({
      title: config.title,
      description: config.description,
      confirmLabel: "Delete forever",
      cancelLabel: "Cancel",
      danger: true,
      matchText: config.matchText,
      matchLabel: config.matchLabel,
    });

    if (!confirmed) return;

    setIsBusy(true);
    const result = await deleteItem(item);
    setIsBusy(false);

    if (!result.ok) {
      setActionError(result.message ?? "Could not delete this item.");
      return;
    }
    await refresh();
  };

  const emptyMsg =
    typeof emptyMessage === "function"
      ? emptyMessage(debouncedSearch)
      : emptyMessage;

  const emptySearchMsg =
    typeof emptyMessage === "function"
      ? emptyMessage("search")
      : "No items match your search.";

  return (
    <div className="space-y-6">
      <InputGroup className="h-10 w-full rounded-full bg-card md:w-72">
        <InputGroupAddon>
          <HugeiconsIcon icon={Search01Icon} size={16} />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search trash…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-10"
        />
      </InputGroup>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {actionError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{actionError}</span>
          <button
            type="button"
            className="font-medium underline underline-offset-2 hover:text-foreground"
            onClick={() => setActionError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading && !data ? (
        <div className="space-y-3" aria-hidden="true">
          {SKELETON_KEYS.map((key) => (
            <div
              key={key}
              className="h-20 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      ) : data && data.items.length === 0 ? (
        <Empty className="rounded-2xl border border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={DeleteThrowIcon} size={24} />
            </EmptyMedia>
            <EmptyTitle>
              {debouncedSearch ? "No results" : "Nothing here"}
            </EmptyTitle>
            <EmptyDescription>
              {debouncedSearch ? emptySearchMsg : emptyMsg}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        data && (
          <>
            <div
              className={cn(
                "overflow-hidden rounded-2xl border border-border bg-card",
                isLoading && "pointer-events-none opacity-60",
              )}
            >
              <ul className="divide-y divide-border">
                {data.items.map((item) => (
                  <li
                    key={getItemId(item)}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      {renderItemContent(item)}
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                      <div className="flex items-center gap-3">
                        {renderItemMeta(item)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={`Restore ${getItemName(item)}`}
                          title="Restore"
                          disabled={isBusy}
                          onClick={() => void handleRestore(item)}
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                        >
                          <HugeiconsIcon icon={RestoreBinIcon} size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${getItemName(item)} forever`}
                          title="Delete forever"
                          disabled={isBusy}
                          onClick={() => void handleDeleteForever(item)}
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              totalItems={data.total}
              pageSize={data.pageSize}
              pageSizeOptions={pageSizeOptions}
              onPageSizeChange={(value) => {
                setPageSize(value);
                setPage(1);
              }}
              onPageChange={setPage}
            />
          </>
        )
      )}
    </div>
  );
}
