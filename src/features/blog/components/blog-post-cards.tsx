"use client";

import { Delete02Icon, Edit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";
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
}: {
  posts: BlogPostListItem[];
  onDelete?: (post: BlogPostListItem) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <article
          key={post.id}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-ring"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link
                href={`/admin/blog/edit/${post.slug}`}
                aria-label={`Edit ${post.title}`}
                title="Edit"
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <HugeiconsIcon icon={Edit02Icon} size={16} />
              </Link>
              {onDelete && (
                <button
                  type="button"
                  aria-label={`Delete ${post.title}`}
                  title="Delete"
                  onClick={() => onDelete(post)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
                    "hover:bg-destructive/10 hover:text-destructive",
                  )}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={16} />
                </button>
              )}
              <StatusBadge status={post.status} />
            </div>
          </div>

          <Link href={`/admin/blog/edit/${post.slug}`} className="group">
            <h3 className="font-heading text-lg leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
              {post.title}
            </h3>
          </Link>

          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.summary || "No summary yet."}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar className="size-7">
                <AvatarFallback className="text-[10px]">
                  {initials(post.authorName) || "LH"}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-xs font-medium text-foreground">
                {post.authorName || "Anonymous"}
              </span>
            </div>
            <time className="shrink-0 text-xs text-muted-foreground">
              {formatDate(post.updatedAt)}
            </time>
          </div>
        </article>
      ))}
    </div>
  );
}
