import { Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { JSONContent } from "@tiptap/react";
import Image from "next/image";
import { RichTextPreview } from "@/components/shared/rich-text-preview";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date-utils";
import { calculateReadingTime } from "@/features/blog/seo-helpers";
import type { BlogPostDraftData } from "../actions";
import { TableOfContents } from "./table-of-contents";
import { ShareButtons } from "./share-buttons";

interface BlogPostDetailProps {
  post: BlogPostDraftData;
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
          node.content
            .map((n) => (n.type === "text" ? n.text : ""))
            .join("") || "";

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

export function BlogPostDetail({ post }: BlogPostDetailProps) {
  const toc = extractTableOfContents(post.content as JSONContent);
  const readingTime = calculateReadingTime(post.content);

  return (
    <article className="relative">
      {/* Hero Section */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="mb-6 font-heading text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          {/* Summary */}
          {post.summary && (
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
              {post.summary}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
            {/* Author */}
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                  {initials(post.author.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {post.author.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {post.author.designation || "Author"}
                </p>
              </div>
            </div>

            <span className="text-muted-foreground">•</span>

            {/* Published Date */}
            <time
              dateTime={post.publishedAt || ""}
              className="text-sm text-muted-foreground"
            >
              {formatDate(post.publishedAt)}
            </time>

            <span className="text-muted-foreground">•</span>

            {/* Reading Time */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <HugeiconsIcon icon={Clock01Icon} size={16} />
              <span>{readingTime} min read</span>
            </div>

            <div className="ml-auto">
              <ShareButtons title={post.title} summary={post.summary} />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      {post.heroImage && (
        <div className="relative aspect-[21/9] w-full overflow-hidden border-b border-border bg-muted">
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

      {/* Main Content Area */}
      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr] xl:grid-cols-[280px_1fr_240px]">
          {/* Table of Contents */}
          {toc.length > 0 && <TableOfContents items={toc} />}

          {/* Main Content */}
          <div className="min-w-0">
            <div className="prose prose-lg prose-slate max-w-none dark:prose-invert">
              <RichTextPreview content={post.content as JSONContent} />
            </div>

            {/* Author Bio */}
            <div className="mt-16 rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="flex items-start gap-4">
                <Avatar className="size-16 shrink-0 md:size-20">
                  <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
                    {initials(post.author.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Written By
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-foreground">
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

          {/* Right Sidebar - Additional Content (Optional) */}
          <aside className="hidden xl:block">
            <div className="sticky top-8 space-y-6">
              {/* Share Section */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Share This
                </h3>
                <ShareButtons
                  title={post.title}
                  summary={post.summary}
                  vertical
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
