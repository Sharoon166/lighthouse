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
import { useEffect, useMemo, useRef, useState } from "react";
import { useConfirm } from "@/components/shared/confirm-provider";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Pagination } from "@/components/ui/pagination";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  type AttributeDefinition,
  type AttributeDefinitionListItem,
  type AttributeDefinitionListResult,
  deactivateAttributeDefinition,
  deleteAttributeDefinition,
  getAttributeDefinitionById,
  listAttributeDefinitions,
} from "../actions/attribute-definition-actions";
import { AttributeDefinitionForm } from "./attribute-definition-form";

const columnHelper = createColumnHelper<AttributeDefinitionListItem>();

const TYPE_BADGE: Record<string, string> = {
  text: "bg-blue-500/10 text-blue-600",
  number: "bg-violet-500/10 text-violet-600",
  select: "bg-amber-500/10 text-amber-600",
  boolean: "bg-emerald-500/10 text-emerald-600",
  color: "bg-pink-500/10 text-pink-600",
};

function AttributeTable({
  attributes,
  onToggleActive,
  onDelete,
  onEdit,
}: {
  attributes: AttributeDefinitionListItem[];
  onToggleActive?: (attribute: AttributeDefinitionListItem) => void;
  onDelete?: (attribute: AttributeDefinitionListItem) => void;
  onEdit?: (attribute: AttributeDefinitionListItem) => void;
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {info.getValue()}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {info.row.original.key}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              TYPE_BADGE[info.getValue()] ?? "bg-muted text-muted-foreground",
            )}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("options", {
        header: "Options",
        cell: (info) => {
          const opts = info.getValue();
          if (!opts.length)
            return <span className="text-muted-foreground">—</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {opts.slice(0, 3).map((o, i) => (
                <span
                  key={`${o}-${i}`}
                  className="inline-block rounded bg-muted px-1.5 py-0.5 text-xs"
                >
                  {o}
                </span>
              ))}
              {opts.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{opts.length - 3}
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("usageCount", {
        header: "Categories",
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
            {onToggleActive && (
              <button
                type="button"
                aria-label={
                  info.row.original.isActive
                    ? `Deactivate ${info.row.original.name}`
                    : `Activate ${info.row.original.name}`
                }
                title={info.row.original.isActive ? "Deactivate" : "Activate"}
                onClick={() => onToggleActive(info.row.original)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
                  info.row.original.isActive
                    ? "hover:bg-amber-500/10 hover:text-amber-600"
                    : "hover:bg-emerald-500/10 hover:text-emerald-600",
                )}
              >
                <span className="text-xs font-medium">
                  {info.row.original.isActive ? "Off" : "On"}
                </span>
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                aria-label={`Edit ${info.row.original.name}`}
                title="Edit"
                onClick={() => onEdit(info.row.original)}
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <HugeiconsIcon icon={Edit02Icon} size={16} />
              </button>
            )}
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
    [onToggleActive, onDelete, onEdit],
  );

  const table = useReactTable({
    data: attributes,
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

export function AttributesManager({
  initialData,
}: {
  initialData?: AttributeDefinitionListResult;
}) {
  const { confirm } = useConfirm();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [data, setData] = useState<AttributeDefinitionListResult | null>(
    initialData ?? null,
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const skipInitialFetch = useRef(Boolean(initialData));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingAttribute, setEditingAttribute] =
    useState<AttributeDefinition | null>(null);

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

    listAttributeDefinitions({
      page,
      pageSize,
      search: debouncedSearch,
      showAll: true,
    })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled)
          setError("Could not load attributes. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch]);

  const refresh = async () => {
    const refreshed = await listAttributeDefinitions({
      page,
      pageSize,
      search: debouncedSearch,
      showAll: true,
    });
    setData(refreshed);
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    setEditingAttribute(null);
    setDialogOpen(true);
  };

  const openEditDialog = async (attribute: AttributeDefinitionListItem) => {
    const raw = await getAttributeDefinitionById(attribute.id);
    if (!raw) return;
    const serialized = JSON.parse(
      JSON.stringify(raw),
    ) as AttributeDefinition & { _id: string };
    setDialogMode("edit");
    setEditingAttribute({ ...serialized, id: serialized._id });
    setDialogOpen(true);
  };

  const handleToggleActive = async (attribute: AttributeDefinitionListItem) => {
    setActionError(null);
    setIsMutating(true);
    const result = await deactivateAttributeDefinition(attribute.id);
    setIsMutating(false);

    if (!result.ok) {
      setActionError(result.message ?? "Could not update attribute.");
      return;
    }

    await refresh();
  };

  const handleDelete = async (attribute: AttributeDefinitionListItem) => {
    setActionError(null);

    const confirmed = await confirm({
      title: "Delete this attribute?",
      description: (
        <>
          &ldquo;{attribute.name}&rdquo; will be permanently deleted. This
          action cannot be undone.
        </>
      ),
      confirmLabel: "Delete",
      cancelLabel: "Keep attribute",
      danger: true,
    });

    if (!confirmed) return;

    setIsMutating(true);
    const result = await deleteAttributeDefinition(attribute.id);
    setIsMutating(false);

    if (!result.ok) {
      setActionError(result.message ?? "Could not delete this attribute.");
      return;
    }

    await refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-heading text-2xl tracking-tight text-foreground md:text-3xl">
            Attributes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define product attributes that categories can assign as specs or
            variant dimensions.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <HugeiconsIcon icon={PlusSignIcon} size={16} />
          New attribute
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="h-10 w-full rounded-full bg-card md:w-72">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search attributes"
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
      ) : data && data.attributes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <p className="text-sm text-muted-foreground">
            No attributes found. Try a different search, or add your first
            attribute.
          </p>
          <Button onClick={openCreateDialog} className="mt-4">
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            New attribute
          </Button>
        </div>
      ) : (
        data && (
          <>
            <div className={cn(isLoading && "pointer-events-none opacity-60")}>
              <AttributeTable
                attributes={data.attributes}
                onToggleActive={isMutating ? undefined : handleToggleActive}
                onDelete={isMutating ? undefined : handleDelete}
                onEdit={isMutating ? undefined : openEditDialog}
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

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "create" ? "New attribute" : "Edit attribute"}
        maxWidth="max-w-2xl"
      >
        <AttributeDefinitionForm
          mode={dialogMode}
          id={dialogMode === "edit" ? editingAttribute?.id : undefined}
          initialData={editingAttribute}
          compact
          onSave={async () => {
            setDialogOpen(false);
            setEditingAttribute(null);
            await refresh();
          }}
        />
      </Dialog>
    </div>
  );
}
