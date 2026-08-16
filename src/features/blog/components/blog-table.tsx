"use client";

import { Delete02Icon, Edit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";
import type { BlogPostListItem } from "../actions";

const columnHelper = createColumnHelper<BlogPostListItem>();

export function BlogTable({
  posts,
  onDelete,
}: {
  posts: BlogPostListItem[];
  onDelete?: (post: BlogPostListItem) => void;
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Title",
        cell: (info) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {info.getValue()}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              /{info.row.original.slug}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("summary", {
        header: "Summary",
        cell: (info) => (
          <p className="max-w-64 truncate text-sm text-muted-foreground">
            {info.getValue() || "—"}
          </p>
        ),
      }),
      columnHelper.accessor("tags", {
        header: "Tags",
        cell: (info) => {
          const tags = info.getValue();
          if (tags.length === 0)
            return <span className="text-muted-foreground">—</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge variant="outline">+{tags.length - 2}</Badge>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("authorName", {
        header: "Author",
        cell: (info) => info.getValue() || "—",
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
              href={`/admin/blog/edit/${info.row.original.slug}`}
              aria-label={`Edit ${info.row.original.title}`}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={Edit02Icon} size={16} />
            </Link>
            {onDelete && (
              <button
                type="button"
                aria-label={`Delete ${info.row.original.title}`}
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
    data: posts,
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
