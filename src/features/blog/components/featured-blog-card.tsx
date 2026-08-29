import { ArrowRight02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date-utils";
import type { BlogPostListItem } from "../actions";

export function FeaturedBlogCard({ post }: { post: BlogPostListItem }) {
  const wordCount = post.summary ? post.summary.split(/\s+/).length : 100;
  const readingTime = Math.max(1, Math.ceil(wordCount / 50));

  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group grid overflow-hidden border md:grid-cols-[1.7fr_1.3fr] min-h-96"
    >
      {/* Image */}
      {post.heroImage ? (
        <div className="relative aspect-3/2 overflow-hidden bg-noise md:aspect-auto">
          <Image
            src={post.heroImage.url}
            alt={post.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-muted md:aspect-auto">
          <span className="text-6xl">📰</span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col justify-center bg-noise p-8 md:p-10">
        <Badge className="mb-4 w-fit bg-gold text-primary text-xs uppercase tracking-wider">
          Featured
        </Badge>

        <h2 className="mb-4 text-secondary-foreground font-heading text-2xl font-bold leading-tight text-foreground md:text-3xl">
          {post.title}
        </h2>

        {post.summary && (
          <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.summary}
          </p>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {post.authorName && <span>{post.authorName}</span>}
          {post.authorName && post.publishedAt && <span>•</span>}
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          )}
          {post.publishedAt && <span>•</span>}
          <div className="flex items-center gap-1">
            <HugeiconsIcon icon={Clock01Icon} size={14} />
            <span>{readingTime} min read</span>
          </div>
        </div>

        <Button size="lg" variant="outline" className="w-fit group/btn">
          Read Article
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            size={16}
            className="transition-transform group-hover/btn:translate-x-0.5"
          />
        </Button>
      </div>
    </Link>
  );
}
