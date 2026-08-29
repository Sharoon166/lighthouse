import { ArrowRight01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { JSONContent } from "@tiptap/react";
import Image from "next/image";
import Link from "next/link";
import { CTA } from "@/components/hero/cta";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { RichTextPreview } from "@/components/shared/rich-text-preview";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { calculateReadingTime } from "@/features/blog/seo-helpers";
import { formatDate } from "@/lib/date-utils";
import type { BlogPostDraftData, BlogPostListItem } from "../actions";
import { BlogCard } from "./blog-card";
import { HeroActions } from "./hero-actions";
import { ShareButtons } from "./share-buttons";
import { TableOfContents } from "./table-of-contents";

interface BlogPostDetailProps {
  post: BlogPostDraftData;
  recentPosts: BlogPostListItem[];
  relatedPosts: BlogPostListItem[];
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractTableOfContents(content: JSONContent | null): TocItem[] {
  if (!content || !Array.isArray(content.content)) return [];

  const items: TocItem[] = [];
  let counter = 1;

  const walk = (nodes: JSONContent[]) => {
    for (const node of nodes) {
      if (node.type === "heading" && node.content) {
        const level = (node.attrs?.level as number) || 2;
        const text =
          node.content.map((n) => (n.type === "text" ? n.text : "")).join("") ||
          "";

        if (text && level >= 2 && level <= 4) {
          items.push({
            id: `heading-${counter}`,
            text,
            level,
          });
          counter++;
        }
      }

      if (Array.isArray(node.content)) {
        walk(node.content);
      }
    }
  };

  walk(content.content);
  return items;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function BlogPostDetail({
  post,
  recentPosts,
  relatedPosts,
}: BlogPostDetailProps) {
  const toc = extractTableOfContents(post.content as JSONContent);
  const readingTime = calculateReadingTime(post.content);

  return (
    <article>
      {/* Hero */}
      <section className="relative overflow-hidden py-10">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Blogs", href: "/blogs" },
            { label: post.title },
          ]}
          className="container"
        />
        <div className="container mt-12">
          <div className="space-y-4">
            <h1 className="text-secondary text-balance max-w-6xl">
              {post.title}
            </h1>
            {post.summary && (
              <p className="text-lg text-pretty">{post.summary}</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    {initials(post.author.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {post.author.name}
                  </p>
                  {post.author.designation && (
                    <p className="text-xs text-muted-foreground">
                      {post.author.designation}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {post.publishedAt && (
                  <time dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                )}
                <span>•</span>
                <div className="flex items-center gap-1">
                  <HugeiconsIcon icon={Clock01Icon} size={14} />
                  <span>{readingTime} min read</span>
                </div>
                <HeroActions title={post.title} summary={post.summary} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      {post.heroImage && (
        <div className="container relative aspect-2/1 w-full overflow-hidden bg-muted">
          <Image
            src={post.heroImage.url}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      {/* Mobile TOC - Collapsible */}
      {toc.length > 0 && (
        <details className="container mt-6 xl:hidden">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground select-none">
            Table of Contents
          </summary>
          <nav className="mt-3 space-y-1" aria-label="Table of contents">
            {toc.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-baseline gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span className="font-heading text-base font-bold text-gold shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="line-clamp-1">{item.text}</span>
              </a>
            ))}
          </nav>
        </details>
      )}

      {/* Content - Three Column */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 xl:grid-cols-[200px_1fr_240px]">
          {/* Left Sidebar - TOC + Share */}
          <aside className="hidden xl:block">
            <div className="sticky top-8">
              <TableOfContents items={toc} />

              <div className="border-t border-border mt-6 pt-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Share
                </h3>
                <ShareButtons title={post.title} summary={post.summary} />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="min-w-0">
            <div className="prose prose-lg prose-slate max-w-none dark:prose-invert">
              <RichTextPreview content={post.content as JSONContent} />
            </div>
            <div className="mt-16 p-6 md:p-8 border-t space-y-4">
              <h4 className="text-2xl font-semibold uppercase">Tagged</h4>
              <div className=" flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            {/* Author Bio */}
            <div className="mt-6 p-6 md:p-8 border-t">
              <div className="flex items-start gap-4">
                <Avatar className="size-16 shrink-0 md:size-20">
                  <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
                    {initials(post.author.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold">
                    Written By
                  </p>
                  <h3 className="mt-4 text-xl font-bold text-foreground">
                    {post.author.name}
                  </h3>
                  {post.author.designation && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {post.author.designation}
                    </p>
                  )}
                  {post.author.bio && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {post.author.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Recent Posts */}
          <aside className="hidden xl:block">
            <div className="sticky top-8 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Posts
              </h3>
              {recentPosts.length > 0 ? (
                <div className="space-y-4">
                  {recentPosts.map((rp) => (
                    <Link
                      key={rp.id}
                      href={`/blogs/${rp.slug}`}
                      className="group block"
                    >
                      {rp.heroImage && (
                        <div className="mb-2 overflow-hidden rounded-lg">
                          <Image
                            src={rp.heroImage.url}
                            alt={rp.title}
                            width={240}
                            height={140}
                            className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <h4 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary">
                        {rp.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent posts yet.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Related Articles - Mobile/Tablet */}
      {relatedPosts.length > 0 && (
        <section className="container pb-12">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold">
              Related Articles
            </h2>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              All Articles
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
      <div className="container">
        {/* CTA */}
        <CTA />
      </div>
    </article>
  );
}
