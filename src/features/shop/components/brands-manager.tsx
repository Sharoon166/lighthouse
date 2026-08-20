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
import { buttonVariants } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";
import {
  type BrandListItem,
  type BrandListResult,
  deleteBrand,
  listBrands,
} from "../actions/brand-actions";

const columnHelper = createColumnHelper<BrandListItem>();

function BrandTable({
  brands,
  onDelete,
}: {
  brands: BrandListItem[];
  onDelete?: (brand: BrandListItem) => void;
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <div className="flex items-center gap-2.5 min-w-0">
            {info.row.original.logo ? (
              <img
                src={info.row.original.logo}
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
                /{info.row.original.slug}
              </p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => (
          <p className="max-w-64 truncate text-sm text-muted-foreground">
            {info.getValue() || "—"}
          </p>
        ),
      }),
      columnHelper.accessor("productCount", {
        header: "Products",
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("isActive", {
        header: "Status",
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-flex items-center rounded-full bg-chart-2/10 px-2 py-0.5 text-xs font-medium text-chart-2">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Inactive
            </span>
          ),
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
              href={`/admin/brands/edit/${info.row.original.id}`}
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
    data: brands,
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

export function BrandsManager({ initialData }: { initialData?: BrandListResult }) {
  const { confirm } = useConfirm();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [data, setData] = useState<BrandListResult | null>(initialData ?? null);
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

    listBrands({ page, pageSize, search: debouncedSearch, showAll: true })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled)
          setError("Could not load brands. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch]);

  const handleDelete = async (brand: BrandListItem) => {
    setActionError(null);

    const confirmed = await confirm({
      title: "Delete this brand?",
      description: (
        <>
          "{brand.name}" will be permanently deleted. This action cannot be
          undone.
        </>
      ),
      confirmLabel: "Delete",
      cancelLabel: "Keep brand",
      danger: true,
    });

    if (!confirmed) return;

    setIsDeleting(true);
    const result = await deleteBrand(brand.id);
    setIsDeleting(false);

    if (!result.ok) {
      setActionError(result.message ?? "Could not delete this brand.");
      return;
    }

    const refreshed = await listBrands({
      page,
      pageSize,
      search: debouncedSearch,
      showAll: true,
    });
    setData(refreshed);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-heading text-2xl tracking-tight text-foreground md:text-3xl">
            Brands
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the brands you carry in your shop.
          </p>
        </div>
        <Link href="/admin/brands/new" className={buttonVariants()}>
          <HugeiconsIcon icon={PlusSignIcon} size={16} />
          New brand
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="h-10 w-full rounded-full bg-card md:w-72">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search brands…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10"
          />
        </InputGroup>
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
      ) : data && data.brands.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <p className="text-sm text-muted-foreground">
            No brands found. Try a different search, or add your first brand.
          </p>
          <Link href="/admin/brands/new" className={cn(buttonVariants(), "mt-4")}>
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            New brand
          </Link>
        </div>
      ) : (
        data && (
          <>
            <div className={cn(isLoading && "pointer-events-none opacity-60")}>
              <BrandTable
                brands={data.brands}
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
