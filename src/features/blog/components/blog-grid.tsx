"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Pagination } from "@/components/ui/pagination";
import { BLOG_CATEGORIES } from "@/lib/constants";
import {
  type BlogPostListItem,
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

const allCategories = [
  { label: "All Blogs", value: "all" },
  ...BLOG_CATEGORIES,
] as const;

interface BlogGridProps {
  initialData: BlogPostListResult;
  featuredPost: BlogPostListItem | null;
}

export function BlogGrid({ initialData, featuredPost }: BlogGridProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);
  const [data, setData] = useState<BlogPostListResult>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
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
      category: activeCategory === "all" ? "" : activeCategory,
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
  }, [page, pageSize, debouncedSearch, activeCategory]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  const gridPosts = featuredPost
    ? data.posts.filter((p) => p.id !== featuredPost.id)
    : data.posts;

  return (
    <>
      {/* Search + Category Filters */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <nav
          aria-label="Blog categories"
          className="flex flex-wrap items-center gap-2"
        >
          {allCategories.map((cat) => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => handleCategoryChange(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <InputGroup className="h-10 w-full max-w-xs rounded-full bg-card sm:w-64">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} size={18} />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search articles…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10"
            />
          </InputGroup>
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {data.total} Blogs
          </span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading / Grid / Empty */}
      {isLoading ? (
        <SkeletonGrid />
      ) : gridPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <p className="text-muted-foreground">
            {debouncedSearch || activeCategory !== "all"
              ? "No articles found. Try a different search or filter."
              : "No articles published yet. Check back soon!"}
          </p>
        </div>
      ) : (
        <>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {gridPosts.map((post) => (
              <li key={post.id}>
                <BlogCard post={post} />
              </li>
            ))}
          </ul>

          {data.totalPages > 1 && (
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
          )}
        </>
      )}
    </>
  );
}
