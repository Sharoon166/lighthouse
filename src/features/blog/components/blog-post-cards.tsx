"use client";

import {
  Delete02Icon,
  Edit02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { BlogPostListItem } from "../actions";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function BlogPostCards({
  posts,
  onDelete,
  onToggleFeatured,
  canFeatureMore,
}: {
  posts: BlogPostListItem[];
  onDelete?: (post: BlogPostListItem) => void;
  onToggleFeatured?: (post: BlogPostListItem) => void;
  canFeatureMore?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <article
          key={post.id}
          className="group/card flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-colors hover:border-ring"
        >
          {/* Image with overlay actions */}
          <div className="relative aspect-[3/2] w-full overflow-hidden bg-muted">
            {post.heroImage?.url ? (
              <img
                src={post.heroImage.url}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
              />
            ) : null}

            {/* Actions overlay */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-lg bg-background/80 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover/card:opacity-100">
              {onToggleFeatured && (
                <button
                  type="button"
                  aria-label={
                    post.featured
                      ? `Unfeature ${post.title}`
                      : `Feature ${post.title}`
                  }
                  title={
                    post.featured
                      ? "Remove from featured"
                      : canFeatureMore
                        ? "Add to featured"
                        : "Featured limit reached"
                  }
                  disabled={!post.featured && !canFeatureMore}
                  onClick={() => onToggleFeatured(post)}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md transition-colors",
                    post.featured
                      ? "text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    !post.featured &&
                      !canFeatureMore &&
                      "cursor-not-allowed opacity-40",
                  )}
                >
                  <HugeiconsIcon icon={StarIcon} size={14} />
                </button>
              )}
              <Link
                href={`/admin/blog/edit/${post.slug}`}
                aria-label={`Edit ${post.title}`}
                title="Edit"
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <HugeiconsIcon icon={Edit02Icon} size={14} />
              </Link>
              {onDelete && (
                <button
                  type="button"
                  aria-label={`Delete ${post.title}`}
                  title="Delete"
                  onClick={() => onDelete(post)}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </button>
              )}
            </div>

            {/* Featured indicator */}
            {post.featured && (
              <div className="absolute top-2.5 left-2.5">
                <div className="flex size-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
                  <HugeiconsIcon icon={StarIcon} size={12} />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex flex-wrap gap-1.5">
              {post.category && (
                <Badge variant="secondary" className="text-[11px]">
                  {post.category}
                </Badge>
              )}
              {post.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[11px]">
                  {tag}
                </Badge>
              ))}
            </div>

            <Link href={`/admin/blog/edit/${post.slug}`} className="group/title">
              <h3 className="text-base font-semibold leading-snug text-foreground transition-colors group-hover/title:text-primary">
                {post.title}
              </h3>
            </Link>

            {post.summary && (
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {post.summary}
              </p>
            )}

            <div className="mt-auto flex items-center gap-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <div className="flex min-w-0 items-center gap-2">
                <Avatar className="size-5">
                  <AvatarFallback className="text-[9px]">
                    {initials(post.authorName) || "LH"}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{post.authorName || "Anonymous"}</span>
              </div>
              <time className="ml-auto shrink-0 text-[11px]">
                {formatDate(post.updatedAt)}
              </time>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
