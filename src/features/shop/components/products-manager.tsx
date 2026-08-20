"use client";

import {
  Delete02Icon,
  Edit02Icon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConfirm } from "@/components/shared/confirm-provider";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPriceRange } from "@/lib/format";
import { formatDate } from "@/lib/date-utils";
import {
  type ProductListItem,
  type ProductListResult,
  deleteProduct,
  listProducts,
} from "../actions/product-actions";

const columnHelper = createColumnHelper<ProductListItem>();

function ProductTable({
  products,
  onDelete,
}: {
  products: ProductListItem[];
  onDelete?: (product: ProductListItem) => void;
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Product",
        cell: (info) => (
          <div className="flex items-center gap-2.5 min-w-0">
            {info.row.original.images?.[0] ? (
              <img
                src={info.row.original.images[0]}
                alt=""
                className="size-8 shrink-0 rounded-sm object-cover"
              />
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-muted text-xs font-medium text-muted-foreground">
                {info.getValue().charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {info.getValue()}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                SKU: {info.row.original.defaultVariantSku}
              </p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("categoryName", {
        header: "Category",
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() || "—"}
          </span>
        ),
      }),
      columnHelper.accessor("brandName", {
        header: "Brand",
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() || "—"}
          </span>
        ),
      }),
      columnHelper.accessor("priceRange", {
        header: "Price",
        cell: (info) => {
          const range = info.getValue();
          return (
            <span className="text-sm font-medium text-foreground">
              {formatPriceRange(range.min, range.max)}
            </span>
          );
        },
      }),
      columnHelper.accessor("totalStock", {
        header: "Stock",
        cell: (info) => {
          const stock = info.getValue();
          const inStock = info.row.original.inStock;
          return (
            <span
              className={cn(
                "text-sm",
                inStock ? "text-foreground" : "text-destructive",
              )}
            >
              {stock}
            </span>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("updatedAt", {
        header: "Updated",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <div className="flex items-center justify-end gap-1">
            <Link
              href={`/admin/products/edit/${info.row.original.id}`}
              aria-label={`Edit ${info.row.original.name}`}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={Edit02Icon} size={16} />
            </Link>
            {onDelete && (
              <button
                type="button"
                aria-label={`Delete ${info.row.original.name}`}
                title="Delete"
                onClick={() => onDelete(info.row.original)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
                  "hover:bg-destructive/10 hover:text-destructive",
                )}
              >
                <HugeiconsIcon icon={Delete02Icon} size={16} />
              </button>
            )}
          </div>
        ),
      }),
    ],
    [onDelete],
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-3xl text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left font-medium text-muted-foreground"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border last:border-0 hover:bg-muted/50"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type ProductStatus = "all" | "draft" | "active" | "archived";

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const SKELETON_KEYS = ["one", "two", "three", "four", "five"];

function SkeletonTable() {
  return (
    <div className="space-y-2" aria-hidden="true">
      {SKELETON_KEYS.map((key) => (
        <div
          key={key}
          className="h-12 animate-pulse rounded-lg border border-border bg-card"
        />
      ))}
    </div>
  );
}

export function ProductsManager({ initialData }: { initialData?: ProductListResult }) {
  const { confirm } = useConfirm();
  const [status, setStatus] = useState<ProductStatus>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [data, setData] = useState<ProductListResult | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

    listProducts({ page, pageSize, search: debouncedSearch, status })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled)
          setError("Could not load products. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, status]);

  const handleDelete = async (product: ProductListItem) => {
    setActionError(null);

    const confirmed = await confirm({
      title: "Delete this product?",
      description: (
        <>
          "{product.name}" will be permanently deleted. This action cannot be
          undone.
        </>
      ),
      confirmLabel: "Delete",
      cancelLabel: "Keep product",
      danger: true,
    });

    if (!confirmed) return;

    setIsDeleting(true);
    const result = await deleteProduct(product.id);
    setIsDeleting(false);

    if (!result.ok) {
      setActionError(result.message ?? "Could not delete this product.");
      return;
    }

    const refreshed = await listProducts({
      page,
      pageSize,
      search: debouncedSearch,
      status,
    });
    setData(refreshed);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-heading text-2xl tracking-tight text-foreground md:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your product catalog and inventory.
          </p>
        </div>
        <Link href="/admin/products/new" className={buttonVariants()}>
          <HugeiconsIcon icon={PlusSignIcon} size={16} />
          New product
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="h-10 w-full rounded-full bg-card md:w-72">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search products…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10"
          />
        </InputGroup>
        <SegmentedControl
          label="Filter by status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      </div>

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
        <SkeletonTable />
      ) : data && data.products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <p className="text-sm text-muted-foreground">
            No products found. Try a different search, or add your first
            product.
          </p>
          <Link
            href="/admin/products/new"
            className={cn(buttonVariants(), "mt-4")}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            New product
          </Link>
        </div>
      ) : (
        data && (
          <>
            <div className={cn(isLoading && "pointer-events-none opacity-60")}>
              <ProductTable
                products={data.products}
                onDelete={isDeleting ? undefined : handleDelete}
              />
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
