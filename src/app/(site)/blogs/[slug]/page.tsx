import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPost, listBlogPosts } from "@/features/blog/actions";
import { BlogPostDetail } from "@/features/blog/components/blog-post-detail";
import {
  generateBlogPostJsonLd,
  generateBlogPostMetadata,
} from "@/features/blog/seo-helpers";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post || post.status !== "published") {
    return {
      title: "Post Not Found",
    };
  }

  return generateBlogPostMetadata(post, process.env.NEXT_PUBLIC_SITE_URL);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post || post.status !== "published") {
    notFound();
  }

  const jsonLd = generateBlogPostJsonLd(post, process.env.NEXT_PUBLIC_SITE_URL);

  // Fetch recent posts for sidebar (latest published, excluding current)
  const recentResult = await listBlogPosts({
    page: 1,
    pageSize: 5,
    search: "",
    status: "published",
  });
  const recentPosts = recentResult.posts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 4);

  // Fetch related posts by first tag, excluding current post
  const firstTag = post.tags[0] || "";
  const relatedResult = firstTag
    ? await listBlogPosts({
        page: 1,
        pageSize: 4,
        search: "",
        status: "published",
        tag: firstTag,
      })
    : null;

  const relatedPosts = relatedResult
    ? relatedResult.posts.filter((p) => p.slug !== post.slug).slice(0, 3)
    : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostDetail
        post={post}
        recentPosts={recentPosts}
        relatedPosts={relatedPosts}
      />
    </>
  );
}
