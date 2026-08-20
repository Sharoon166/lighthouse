import type { Metadata } from "next";

import { BlogPostsManager } from "@/features/blog/components/blog-posts-manager";
import { listBlogPosts } from "@/features/blog/actions";

export const metadata: Metadata = {
  title: "Blog · Lighthouse",
};

export default async function BlogPage() {
  const data = await listBlogPosts({ page: 1, pageSize: 8 });

  return <BlogPostsManager initialData={data} />;
}
