import Image from "next/image";
import Link from "next/link";
import type { BlogPostListItem } from "../actions";

export function BlogCard({ post }: { post: BlogPostListItem }) {
  const wordCount = post.summary ? post.summary.split(/\s+/).length : 100;
  const readingTime = Math.max(1, Math.ceil(wordCount / 50));

  return (
    <Link href={`/blogs/${post.slug}`} className="group bg-card">
      <div className="overflow-hidden">
        {post.heroImage ? (
          <Image
            src={post.heroImage.url}
            alt={post.title}
            width={600}
            height={400}
            className="aspect-3/2 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-3/2 items-center justify-center bg-muted">
            <span className="text-4xl text-muted-foreground">📰</span>
          </div>
        )}
      </div>
      <div className="border border-t-0 border-border pt-5 pb-2 p-4">
        {post.tags.length > 0 && (
          <span className="uppercase text-sm font-semibold tracking-[0.2em] text-gold">
            {post.tags[0]}
          </span>
        )}
        <h3
          className="mt-3 font-heading text-lg leading-snug line-clamp-2"
          title={post.title}
        >
          {post.title}
        </h3>
        {post.summary && (
          <p className="mt-3 leading-relaxed text-muted-foreground line-clamp-2">
            {post.summary}
          </p>
        )}
        <span className="mt-4 block text-xs text-muted-foreground">
          {readingTime} min read
        </span>
      </div>
    </Link>
  );
}
