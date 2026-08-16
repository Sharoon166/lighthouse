import type { Metadata } from "next";
import { BlogList } from "@/features/blog/components/blog-list";

export const metadata: Metadata = {
  title: "Blog | Lighthouse",
  description:
    "Discover lighting design tips, trends, and inspiration for your home and commercial spaces.",
};

export default function BlogPage() {
  return <BlogList />;
}
