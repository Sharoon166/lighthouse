import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPost } from "@/features/blog/actions";
import { BlogPostForm } from "@/features/blog/components/blog-post-form";

export const metadata: Metadata = {
  title: "Edit post · Lighthouse",
};

interface EditBlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditBlogPostPage({
  params,
}: EditBlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) notFound();

  return <BlogPostForm mode="edit" initialData={post} />;
}
