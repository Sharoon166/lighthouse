"use client";

import {
  PlusSignIcon,
  Recycle02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useConfirm } from "@/components/shared/confirm-provider";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { buttonVariants } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Pagination } from "@/components/ui/pagination";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import {
  type BlogPostListItem,
  type BlogPostListResult,
  deleteBlogPost,
  listBlogPosts,
} from "../actions";
import { BlogPostCards } from "./blog-post-cards";
import { BlogTable } from "./blog-table";

type PostStatus = "all" | "draft" | "published";
type View = "table" | "cards";

const STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: "table", label: "Table" },
  { value: "cards", label: "Cards" },
];

const SKELETON_KEYS = ["one", "two", "three", "four", "five", "six"];

function SkeletonGrid() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-hidden="true"
    >
      {SKELETON_KEYS.map((key) => (
        <div
          key={key}
          className="h-56 animate-pulse rounded-2xl border border-border bg-card"
        />
      ))}
    </div>
  );
}

export function BlogPostsManager({ initialData }: { initialData?: BlogPostListResult }) {
  const { confirm } = useConfirm();
  const [view, setView] = useLocalStorage<View>(
    "lighthouse:blog-view",
    "table",
  );
  const [status, setStatus] = useState<PostStatus>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [data, setData] = useState<BlogPostListResult | null>(initialData ?? null);
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

    listBlogPosts({ page, pageSize, search: debouncedSearch, status })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled)
          setError("Could not load blog posts. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, status]);

  const handleDelete = async (post: BlogPostListItem) => {
    setActionError(null);

    const confirmed = await confirm({
      title: "Move this post to trash?",
      description: (
        <>
          “{post.title}” will be moved to trash. You can restore it anytime or
          delete it forever from the trash.
        </>
      ),
      confirmLabel: "Move to trash",
      cancelLabel: "Keep post",
      danger: true,
    });

    if (!confirmed) return;

    setIsDeleting(true);
    const result = await deleteBlogPost(post.slug);
    setIsDeleting(false);

    if (!result.ok) {
      setActionError(result.message ?? "Could not move this post to trash.");
      return;
    }

    const refreshed = await listBlogPosts({
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
            Blog posts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit and manage your stories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/blog/trash"
            className={buttonVariants({ variant: "outline" })}
          >
            <HugeiconsIcon icon={Recycle02Icon} size={16} />
            Trash
          </Link>
          <Link href="/admin/blog/new" className={buttonVariants()}>
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            New post
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputGroup className="h-10 w-full rounded-full bg-card md:w-72">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} size={16} />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search posts…"
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
        <SegmentedControl
          label="Switch view"
          options={VIEW_OPTIONS}
          value={view}
          onChange={setView}
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
        <SkeletonGrid />
      ) : data && data.posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <p className="text-sm text-muted-foreground">
            No posts found. Try a different search, or write your first post.
          </p>
          <Link href="/admin/blog/new" className={cn(buttonVariants(), "mt-4")}>
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            New post
          </Link>
        </div>
      ) : (
        data && (
          <>
            <div className={cn(isLoading && "pointer-events-none opacity-60")}>
              {view === "table" ? (
                <BlogTable
                  posts={data.posts}
                  onDelete={isDeleting ? undefined : handleDelete}
                />
              ) : (
                <BlogPostCards
                  posts={data.posts}
                  onDelete={isDeleting ? undefined : handleDelete}
                />
              )}
            </div>
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              totalItems={data.total}
              pageSize={data.pageSize}
              pageSizeOptions={[8, 16, 32]}
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
