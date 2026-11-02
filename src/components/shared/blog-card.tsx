import Image from "next/image";
import Link from "next/link";
import { BLOG_CATEGORIES } from "@/lib/constants";

interface BlogCardProps {
  /** Post slug — links to /blogs/[slug]. Empty falls back to the blog index. */
  slug?: string;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
}

function getCategoryLabel(value: string): string {
  return BLOG_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function BlogCard({
  slug,
  category,
  title,
  description,
  imageUrl,
}: BlogCardProps) {
  const wordCount = description ? description.split(/\s+/).length : 100;
  const readingTime = Math.max(1, Math.ceil(wordCount / 50));

  return (
    <Link href={slug ? `/blogs/${slug}` : "/blogs"} className="group bg-white">
      <div className="overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          width={600}
          height={400}
          loading="lazy"
          className="aspect-2/1 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="pt-5 pb-2 p-4">
        {category && (
          <span className="uppercase text-sm font-semibold tracking-[0.2em] text-gold">
            {getCategoryLabel(category)}
          </span>
        )}
        <h3
          className="mt-3 font-heading font-semibold text-lg leading-snug line-clamp-2"
          title={title}
        >
          {title}
        </h3>
        <p className="mt-3 leading-relaxed text-muted-foreground line-clamp-2">
          {description}
        </p>
        <span className="mt-4 block text-xs text-muted-foreground">
          {readingTime} min read
        </span>
      </div>
    </Link>
  );
}
