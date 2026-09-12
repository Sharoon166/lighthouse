"use client";

import { NewsIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
import { ScrollBlurContainer } from "@/components/shared/scroll-blur-container";

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
      <div className="mb-10 flex flex-col-reverse gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full min-w-0 lg:flex-1">
          <ScrollBlurContainer>
            <nav
              aria-label="Blog categories"
              className="grow flex flex-wrap items-center gap-2"
            >
              {allCategories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={
                    activeCategory === cat.value ? "secondary" : "outline"
                  }
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleCategoryChange(cat.value)}
                >
                  {cat.label}
                </Button>
              ))}
            </nav>
          </ScrollBlurContainer>
        </div>
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
        <Empty className="rounded-2xl border border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={NewsIcon} size={24} />
            </EmptyMedia>
            <EmptyTitle>
              {debouncedSearch || activeCategory !== "all"
                ? "No articles found"
                : "No articles yet"}
            </EmptyTitle>
            <EmptyDescription>
              {debouncedSearch || activeCategory !== "all"
                ? "Try a different search or filter."
                : "No articles published yet. Check back soon!"}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 *:border">
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
