import type { Metadata } from "next";
import { CTA } from "@/components/hero/cta";
import { PageHero } from "@/components/shared/page-hero";
import { getFeaturedPost, listBlogPosts } from "@/features/blog/actions";
import { BlogGrid } from "@/features/blog/components/blog-grid";
import { FeaturedBlogCard } from "@/features/blog/components/featured-blog-card";

export const metadata: Metadata = {
  title: "Blogs | Lighthouse",
  description:
    "Expert lighting guides, interior design trends, and practical tips to help you choose and style fixtures for beautiful, functional spaces.",
  openGraph: {
    title: "Blogs | Lighthouse",
    description:
      "Expert lighting guides, interior design trends, and practical tips to help you choose and style fixtures for beautiful, functional spaces.",
    type: "website",
  },
  alternates: {
    canonical: "/blogs",
    languages: {
      "en-pk": "/blogs",
      "x-default": "/blogs",
    },
  },
};

export default async function BlogPage() {
  const featuredPost = await getFeaturedPost();

  const initialData = await listBlogPosts({
    page: 1,
    pageSize: 9,
    search: "",
    status: "published",
    excludeId: featuredPost?.id ?? "",
  });

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

        <BlogGrid initialData={initialData} featuredPost={featuredPost} />
      </div>
      <div className="container">
        <CTA />
      </div>
    </>
  );
}
