"use client";

import { RestoreBinIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatDate } from "@/lib/date-utils";
import {
  TrashManager,
  type NormalizedTrashResult,
} from "@/components/shared/trash-manager";
import {
  listTrashedProducts,
  permanentlyDeleteProduct,
  restoreProduct,
  type TrashedProductListItem,
  type TrashedProductListResult,
} from "../actions/product-actions";

const fetchProductTrashItems = async (input: {
  page: number;
  pageSize: number;
  search: string;
}) => {
  const result = await listTrashedProducts(input);
  return {
    items: result.products,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
  };
};

export function ProductTrashManager({
  initialData,
}: {
  initialData?: TrashedProductListResult;
}) {
  const normalizedInitialData:
    | NormalizedTrashResult<TrashedProductListItem>
    | undefined = initialData
    ? {
        items: initialData.products,
        total: initialData.total,
        page: initialData.page,
        pageSize: initialData.pageSize,
        totalPages: initialData.totalPages,
      }
    : undefined;

  return (
    <TrashManager
      fetchItems={fetchProductTrashItems}
      restoreItem={(product) => restoreProduct(product.id)}
      deleteItem={(product) => permanentlyDeleteProduct(product.id)}
      renderItemContent={(product) => (
        <>
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
        </>
      )}
      renderItemMeta={(product) => (
        <span className="text-xs text-muted-foreground">
          Trashed {product.deletedAt ? formatDate(product.deletedAt) : ""}
        </span>
      )}
      getItemId={(product) => product.id}
      getItemName={(product) => product.name}
      getDeleteConfirmConfig={(product) => ({
        title: "Delete this product forever?",
        description: (
          <>
            &ldquo;{product.name}&rdquo; will be permanently removed. This
            cannot be undone.
          </>
        ),
      })}
      emptyMessage={(search) =>
        search
          ? "No trashed products match your search."
          : "The trash is empty. Deleted products end up here."
      }
      initialData={normalizedInitialData}
      defaultPageSize={20}
      pageSizeOptions={[10, 20, 50]}
    />
  );
}
