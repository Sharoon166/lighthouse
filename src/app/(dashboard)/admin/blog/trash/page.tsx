import type { Metadata } from "next";

import { BlogTrashManager } from "@/features/blog/components/blog-trash-manager";
import { listTrashedBlogPosts } from "@/features/blog/actions";

export const metadata: Metadata = {
  title: "Trash · Lighthouse",
};

export default async function BlogTrashPage() {
  const data = await listTrashedBlogPosts({ page: 1, pageSize: 8 });

  return <BlogTrashManager initialData={data} />;
}
