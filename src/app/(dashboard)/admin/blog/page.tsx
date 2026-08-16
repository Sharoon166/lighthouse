import type { Metadata } from "next";

import { BlogPostsManager } from "@/features/blog/components/blog-posts-manager";

export const metadata: Metadata = {
  title: "Blog · Lighthouse",
};

export default function BlogPage() {
  return <BlogPostsManager />;
}
