"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Pagination } from "@/components/ui/pagination";
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

interface BlogGridProps {
  initialData: BlogPostListResult;
  tags: string[];
  featuredPost: BlogPostListItem | null;
}

export function BlogGrid({ initialData, tags, featuredPost }: BlogGridProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
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
    if (page === 1 && !debouncedSearch && !activeTag) {
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
      tag: activeTag,
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
  }, [page, pageSize, debouncedSearch, activeTag]);

  const handleTagChange = (tag: string) => {
    setActiveTag(tag);
    setPage(1);
  };

  const gridPosts = featuredPost
    ? data.posts.filter((p) => p.id !== featuredPost.id)
    : data.posts;

  return (
    <>
      {/* Search + Tag Filters */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <nav
          aria-label="Blog categories"
          className="flex flex-wrap items-center gap-2"
        >
          <Button
            variant={activeTag === "" ? "secondary" : "default"}
            size="sm"
            className="rounded-full"
            onClick={() => handleTagChange("")}
          >
            All Blogs
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={activeTag === tag ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => handleTagChange(tag)}
            >
              {tag}
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
            {debouncedSearch || activeTag
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
