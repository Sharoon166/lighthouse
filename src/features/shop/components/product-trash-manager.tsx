"use client";

import {
  ArrowLeft02Icon,
  Delete02Icon,
  RestoreBinIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useConfirm } from "@/components/shared/confirm-provider";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Pagination } from "@/components/ui/pagination";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  listTrashedProducts,
  permanentlyDeleteProduct,
  restoreProduct,
  type TrashedProductListItem,
  type TrashedProductListResult,
} from "../actions/product-actions";

const SKELETON_KEYS = ["one", "two", "three", "four", "five"];

export function ProductTrashManager({
  initialData,
}: {
  initialData?: TrashedProductListResult;
}) {
  const { confirm } = useConfirm();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [data, setData] = useState<TrashedProductListResult | null>(
    initialData ?? null,
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const skipInitialFetch = useRef(Boolean(initialData));

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

    listTrashedProducts({ page, pageSize, search: debouncedSearch })
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
    const result = await listTrashedProducts({
      page,
      pageSize,
      search: debouncedSearch,
    });
    setData(result);
  };

  const handleRestore = async (product: TrashedProductListItem) => {
    setActionError(null);
    setIsBusy(true);
    const result = await restoreProduct(product.id);
    setIsBusy(false);

    if (!result.ok) {
      setActionError(result.message ?? "Could not restore this product.");
      return;
    }
    await refresh();
  };

  const handleDeleteForever = async (product: TrashedProductListItem) => {
    setActionError(null);

    const confirmed = await confirm({
      title: "Delete this product forever?",
      description: (
        <>
          &ldquo;{product.name}&rdquo; will be permanently removed. This cannot
          be undone.
        </>
      ),
      confirmLabel: "Delete forever",
      cancelLabel: "Cancel",
      danger: true,
    });

    if (!confirmed) return;

    setIsBusy(true);
    const result = await permanentlyDeleteProduct(product.id);
    setIsBusy(false);

    if (!result.ok) {
      setActionError(result.message ?? "Could not delete this product.");
      return;
    }
    await refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/products"
              aria-label="Back to products"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} size={18} />
            </Link>
            <div>
              <h1 className="font-heading text-2xl tracking-tight text-foreground md:text-3xl">
                Product Trash
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Restore a product or delete it forever.
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/admin/products"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          All products
        </Link>
      </div>

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
      ) : data && data.products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <p className="text-sm text-muted-foreground">
            {debouncedSearch
              ? "No trashed products match your search."
              : "The trash is empty. Deleted products end up here."}
          </p>
        </div>
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
                {data.products.map((product) => (
                  <li
                    key={product.id}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt=""
                          className="size-12 shrink-0 rounded-lg border border-border object-cover"
                        />
                      ) : (
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                          <HugeiconsIcon icon={RestoreBinIcon} size={18} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {product.categoryName} &middot; {product.brandName}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                      <span className="text-xs text-muted-foreground">
                        Trashed{" "}
                        {product.deletedAt ? formatDate(product.deletedAt) : ""}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={`Restore ${product.name}`}
                          title="Restore"
                          disabled={isBusy}
                          onClick={() => void handleRestore(product)}
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                        >
                          <HugeiconsIcon icon={RestoreBinIcon} size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${product.name} forever`}
                          title="Delete forever"
                          disabled={isBusy}
                          onClick={() => void handleDeleteForever(product)}
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
              pageSizeOptions={[10, 20, 50]}
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
