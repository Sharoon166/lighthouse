import type { Metadata } from "next";

import { BlogTrashManager } from "@/features/blog/components/blog-trash-manager";

export const metadata: Metadata = {
  title: "Trash · Lighthouse",
};

export default function BlogTrashPage() {
  return <BlogTrashManager />;
}
