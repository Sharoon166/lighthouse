import type { Metadata } from "next";

import { BlogPostForm } from "@/features/blog/components/blog-post-form";

export const metadata: Metadata = {
  title: "New post · Lighthouse",
};

export default function NewBlogPostPage() {
  return <BlogPostForm mode="create" />;
}
