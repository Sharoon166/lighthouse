import { Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date-utils";
import type { BlogPostListItem } from "../actions";

export function BlogCard({ post }: { post: BlogPostListItem }) {
  // Approximate reading time from summary length since we don't have full content in list
  const wordCount = post.summary ? post.summary.split(/\s+/).length : 100;
  const readingTime = Math.max(1, Math.ceil(wordCount / 50)); // Rough estimate

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg"
    >
      {/* Image */}
      {post.heroImage ? (
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={post.heroImage.url}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-muted">
          <span className="text-4xl text-muted-foreground">📰</span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {post.featured && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                ★ Featured
              </Badge>
            )}
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="mb-3 line-clamp-2 font-heading text-xl font-bold leading-tight text-foreground group-hover:text-primary">
          {post.title}
        </h2>

        {/* Summary */}
        {post.summary && (
          <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {post.summary}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
          <span>{post.authorName}</span>
          <span>•</span>
          <time dateTime={post.publishedAt || ""}>
            {formatDate(post.publishedAt)}
          </time>
          <span>•</span>
          <div className="flex items-center gap-1">
            <HugeiconsIcon icon={Clock01Icon} size={14} />
            <span>{readingTime} min</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
