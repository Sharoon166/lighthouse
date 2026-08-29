import type { Metadata } from "next";
import { CTA } from "@/components/hero/cta";
import { PageHero } from "@/components/shared/page-hero";
import {
  getFeaturedPost,
  getPublishedTags,
  listBlogPosts,
} from "@/features/blog/actions";
import { BlogGrid } from "@/features/blog/components/blog-grid";
import { FeaturedBlogCard } from "@/features/blog/components/featured-blog-card";

export const metadata: Metadata = {
  title: "Blog | Lighthouse",
  description:
    "Discover lighting design tips, trends, and inspiration for your home and commercial spaces.",
};

export default async function BlogPage() {
  const [initialData, featuredPost, tags] = await Promise.all([
    listBlogPosts({
      page: 1,
      pageSize: 9,
      search: "",
      status: "published",
    }),
    getFeaturedPost(),
    getPublishedTags(),
  ]);  

  return (
    <>
      <PageHero
        title="Lighting Journals"
        description="Discover lighting ideas, design inspiration, and expert tips to help you create spaces that feel warm, refined, and beautifully illuminated."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blogs" }]}
      />

      <div className="container py-12 md:py-16">
        {featuredPost && (
          <div className="mb-16">
            <FeaturedBlogCard post={featuredPost} />
          </div>
        )}

        <BlogGrid
          initialData={initialData}
          tags={tags}
          featuredPost={featuredPost}
        />
      </div>
      <div className="container">
      <CTA />
      </div>
    </>
  );
}
