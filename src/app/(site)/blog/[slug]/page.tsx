import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPost } from "@/features/blog/actions";
import {
  generateBlogPostJsonLd,
  generateBlogPostMetadata,
} from "@/features/blog/seo-helpers";
import { BlogPostDetail } from "@/features/blog/components/blog-post-detail";

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
  console.log({ post });

  if (!post || post.status !== "published") {
    notFound();
  }

  const jsonLd = generateBlogPostJsonLd(post, process.env.NEXT_PUBLIC_SITE_URL);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostDetail post={post} />
    </>
  );
}
