"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Pagination } from "@/components/ui/pagination";
import {
  type BlogPostListResult,
  listBlogPosts,
} from "../actions";
import { BlogCard } from "./blog-card";

const SKELETON_KEYS = ["one", "two", "three", "four", "five", "six"];

function SkeletonGrid() {
  return (
    <div
      className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden="true"
    >
      {SKELETON_KEYS.map((key) => (
        <div
          key={key}
          className="h-96 animate-pulse rounded-2xl border border-border bg-card"
        />
      ))}
    </div>
  );
}

interface BlogListClientProps {
  initialData: BlogPostListResult;
}

export function BlogListClient({ initialData }: BlogListClientProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);
  const [data, setData] = useState<BlogPostListResult>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    // Skip if it's the initial data
    if (page === 1 && !debouncedSearch && data === initialData) {
      return;
    }

    let cancelled = false;

    setIsLoading(true);
    setError(null);

    listBlogPosts({
      page,
      pageSize,
      search: debouncedSearch,
      status: "published",
    })
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
  }, [page, pageSize, debouncedSearch, initialData, data]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Blog
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Discover lighting design tips, trends, and inspiration for your home
          and commercial spaces.
        </p>
      </div>

      {/* Search */}
      <div className="mb-12 flex justify-center">
        <InputGroup className="h-12 w-full max-w-md rounded-full bg-card">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} size={20} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search articles…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-12"
          />
        </InputGroup>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <SkeletonGrid />
      ) : data.posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <p className="text-muted-foreground">
            {debouncedSearch
              ? "No articles found. Try a different search."
              : "No articles published yet. Check back soon!"}
          </p>
        </div>
      ) : (
        <>
          {/* Blog Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12">
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              totalItems={data.total}
              pageSize={data.pageSize}
              pageSizeOptions={[9, 18, 27]}
              onPageSizeChange={() => {}}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
