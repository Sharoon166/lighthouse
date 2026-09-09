"use client";

import Image from "next/image";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/date-utils";
import {
  TrashManager,
  type NormalizedTrashResult,
} from "@/components/shared/trash-manager";
import {
  listTrashedBlogPosts,
  permanentlyDeleteBlogPost,
  restoreBlogPost,
  type BlogPostListItem,
  type BlogPostListResult,
} from "../actions";

const fetchBlogTrashItems = async (input: {
  page: number;
  pageSize: number;
  search: string;
}) => {
  const result = await listTrashedBlogPosts(input);
  return {
    items: result.posts,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
  };
};

export function BlogTrashManager({
  initialData,
}: {
  initialData?: BlogPostListResult;
}) {
  const normalizedInitialData:
    | NormalizedTrashResult<BlogPostListItem>
    | undefined = initialData
    ? {
        items: initialData.posts,
        total: initialData.total,
        page: initialData.page,
        pageSize: initialData.pageSize,
        totalPages: initialData.totalPages,
      }
    : undefined;

  return (
    <TrashManager
      fetchItems={fetchBlogTrashItems}
      restoreItem={(post) => restoreBlogPost(post.slug)}
      deleteItem={(post) => permanentlyDeleteBlogPost(post.slug)}
      renderItemContent={(post) => (
        <>
          {post.heroImage ? (
            <div className="relative aspect-[16/9] w-24 shrink-0 overflow-hidden rounded-lg border border-border">
              <Image
                src={post.heroImage.url}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/9] w-24 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
              No image
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {post.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              /{post.slug}
            </p>
          </div>
        </>
      )}
      renderItemMeta={(post) => (
        <>
          <StatusBadge status={post.status} />
          <span className="text-xs text-muted-foreground">
            Trashed {post.deletedAt ? formatDate(post.deletedAt) : ""}
          </span>
        </>
      )}
      getItemId={(post) => post.id}
      getItemName={(post) => post.title}
      getDeleteConfirmConfig={(post) => ({
        title: "Delete this post forever?",
        description: (
          <>
            &ldquo;{post.title}&rdquo; and its cover image will be permanently
            removed. This cannot be undone. Type the post title to confirm.
          </>
        ),
        matchText: post.title,
        matchLabel: "Type the post title to confirm",
      })}
      emptyMessage={(search) =>
        search
          ? "No trashed posts match your search."
          : "The trash is empty. Deleted posts end up here."
      }
      initialData={normalizedInitialData}
      defaultPageSize={8}
      pageSizeOptions={[8, 16, 32]}
    />
  );
}
