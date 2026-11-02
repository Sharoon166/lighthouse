"use client";

import { use } from "react";
import { BlogCard } from "@/components/shared/blog-card";
import { SectionHeader } from "@/components/shared/section-header";
import type { HomepageBlog } from "@/lib/homepage-data";

function BlogGrid({ blogs }: { blogs: HomepageBlog[] }) {
  if (blogs.length === 0) return null;

  return (
    <section className="bg-muted mb-0">
      <div className="container">
        <SectionHeader
          title="Lighting Ideas & Design Inspiration"
          description="Explore expert tips, interior design trends, and practical lighting guides to help you create beautiful, functional spaces with confidence."
          ctaText="View All Blogs"
          ctaHref="/blogs"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              slug={blog.slug}
              title={blog.title}
              category={blog.category}
              description={blog.summary}
              imageUrl={blog.imageUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Streaming wrapper — unwraps the blogs promise with `use()`.
 * Suspense in the parent handles the loading state.
 */
export function BlogsStream({ promise }: { promise: Promise<HomepageBlog[]> }) {
  const blogs = use(promise);
  return <BlogGrid blogs={blogs} />;
}

/**
 * Fallback — renders the same grid with static fallback data.
 */
export function BlogsFallback({ blogs }: { blogs: HomepageBlog[] }) {
  return <BlogGrid blogs={blogs} />;
}
