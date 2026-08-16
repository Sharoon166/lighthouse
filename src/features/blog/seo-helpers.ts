import type { Metadata } from "next";
import type { BlogPostDraftData } from "./actions";

/**
 * Calculates reading time in minutes based on word count
 * @param content - TipTap JSONContent or null
 * @returns Reading time in minutes (minimum 1)
 */
export function calculateReadingTime(
  content: Record<string, unknown> | null,
): number {
  if (!content) return 1;

  let wordCount = 0;
  const walk = (node: Record<string, unknown>) => {
    if (typeof node.text === "string") {
      wordCount += node.text.trim().split(/\s+/).filter(Boolean).length;
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        if (typeof child === "object" && child !== null) {
          walk(child as Record<string, unknown>);
        }
      }
    }
  };
  walk(content);

  // Average reading speed: 200 words per minute
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Generates SEO-friendly metadata for a blog post
 * Uses custom SEO fields if provided, falls back to post content
 */
export function generateBlogPostMetadata(
  post: BlogPostDraftData,
  siteUrl: string = "https://lighthouse.example.com",
): Metadata {
  const metaTitle = post.seo?.metaTitle?.trim() || post.title;
  const metaDescription =
    post.seo?.metaDescription?.trim() ||
    post.summary ||
    `Read ${post.title} by ${post.author.name}`;

  const ogImage = post.heroImage?.url || `${siteUrl}/og-image.png`;

  return {
    title: metaTitle,
    description: metaDescription,
    robots: post.seo?.noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `${siteUrl}/blog/${post.slug}`,
      siteName: "Lighthouse",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: "article",
      publishedTime: post.publishedAt || undefined,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [ogImage],
      creator: `@${post.author.name.toLowerCase().replace(/\s+/g, "")}`,
    },
    keywords: [
      ...(post.seo?.focusKeyword ? [post.seo.focusKeyword] : []),
      ...post.tags,
    ],
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
  };
}

/**
 * Truncates text to a specified length, adding ellipsis if needed
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + "...";
}

/**
 * Generates a JSON-LD structured data object for a blog post
 * Helps search engines understand the content better
 */
export function generateBlogPostJsonLd(
  post: BlogPostDraftData,
  siteUrl: string = "https://lighthouse.example.com",
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    image: post.heroImage?.url,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.designation,
      description: post.author.bio,
    },
    publisher: {
      "@type": "Organization",
      name: "Lighthouse",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    keywords: [
      ...(post.seo?.focusKeyword ? [post.seo.focusKeyword] : []),
      ...post.tags,
    ].join(", "),
    articleSection: post.tags[0] || "Blog",
    wordCount: calculateReadingTime(post.content) * 200, // Approximate
    url: `${siteUrl}/blog/${post.slug}`,
  };
}
