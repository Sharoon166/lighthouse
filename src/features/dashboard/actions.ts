"use server";

import { connectToDatabase } from "@/lib/db";
import { BlogPostModel } from "@/models/blog-post";
import { CategoryModel } from "@/models/category";
import { ProductModel } from "@/models/product";
import { ProjectModel } from "@/models/project";

export type DashboardStats = {
  products: {
    total: number;
    drafts: number;
    active: number;
    outOfStock: number;
    byCategory: { name: string; count: number }[];
    byBrand: { name: string; count: number }[];
    stockByCategory: {
      name: string;
      inStock: number;
      outOfStock: number;
    }[];
  };
  projects: {
    total: number;
    drafts: number;
    published: number;
    ongoing: number;
    completed: number;
    featured: number;
  };
  blog: {
    total: number;
    drafts: number;
    published: number;
    featured: number;
  };
  publishingActivity: { month: string; count: number }[];
  featuredContent: {
    blog: { title: string; slug: string; image: string | null } | null;
    projects: {
      title: string;
      slug: string;
      image: string | null;
    }[];
  };
};

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectToDatabase();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    productCounts,
    projectCounts,
    blogCounts,
    productsByCategory,
    productsByBrand,
    stockByCategory,
    publishingActivity,
    featuredBlog,
    featuredProjects,
  ] = await Promise.all([
    ProductModel.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          drafts: [{ $match: { status: "draft" } }, { $count: "count" }],
          active: [{ $match: { status: "active" } }, { $count: "count" }],
          outOfStock: [
            { $match: { inStock: false, status: { $ne: "archived" } } },
            { $count: "count" },
          ],
        },
      },
    ]),
    ProjectModel.aggregate([
      { $match: { deletedAt: null } },
      {
        $facet: {
          total: [{ $count: "count" }],
          drafts: [{ $match: { status: "draft" } }, { $count: "count" }],
          published: [
            { $match: { status: "published" } },
            { $count: "count" },
          ],
          ongoing: [
            { $match: { projectStatus: "ongoing", status: "published" } },
            { $count: "count" },
          ],
          completed: [
            { $match: { projectStatus: "completed" } },
            { $count: "count" },
          ],
          featured: [
            { $match: { featured: true, deletedAt: null } },
            { $count: "count" },
          ],
        },
      },
    ]),
    BlogPostModel.aggregate([
      { $match: { deletedAt: null } },
      {
        $facet: {
          total: [{ $count: "count" }],
          drafts: [{ $match: { status: "draft" } }, { $count: "count" }],
          published: [
            { $match: { status: "published" } },
            { $count: "count" },
          ],
          featured: [
            { $match: { featured: true } },
            { $count: "count" },
          ],
        },
      },
    ]),
    ProductModel.aggregate([
      { $match: { status: { $ne: "archived" } } },
      { $group: { _id: "$category.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    ProductModel.aggregate([
      { $match: { status: { $ne: "archived" } } },
      { $group: { _id: "$brand.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    ProductModel.aggregate([
      { $match: { status: { $ne: "archived" } } },
      {
        $group: {
          _id: "$category.name",
          inStock: {
            $sum: { $cond: ["$inStock", 1, 0] },
          },
          outOfStock: {
            $sum: { $cond: ["$inStock", 0, 1] },
          },
        },
      },
      { $sort: { inStock: -1 } },
      { $limit: 6 },
    ]),
    (async () => {
      const months: string[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        );
      }

      const results = await BlogPostModel.aggregate([
        { $match: { deletedAt: null, createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]);

      const countMap = new Map(
        results.map((r: { _id: string; count: number }) => [r._id, r.count]),
      );

      return months.map((m) => ({
        month: m,
        count: countMap.get(m) ?? 0,
      }));
    })(),
    BlogPostModel.findOne({ featured: true, deletedAt: null })
      .select({ title: 1, slug: 1, "heroImage.url": 1 })
      .lean(),
    ProjectModel.find({ featured: true, deletedAt: null })
      .select({ title: 1, slug: 1, "heroImage.url": 1 })
      .lean(),
  ]);

  const facet = (result: Record<string, { count: number }[]>[], key: string) =>
    result[0]?.[key]?.[0]?.count ?? 0;

  return {
    products: {
      total: facet(productCounts, "total"),
      drafts: facet(productCounts, "drafts"),
      active: facet(productCounts, "active"),
      outOfStock: facet(productCounts, "outOfStock"),
      byCategory: productsByCategory.map(
        (r: { _id: string; count: number }) => ({
          name: r._id || "Uncategorized",
          count: r.count,
        }),
      ),
      byBrand: productsByBrand.map((r: { _id: string; count: number }) => ({
        name: r._id || "Unknown",
        count: r.count,
      })),
      stockByCategory: stockByCategory.map(
        (r: { _id: string; inStock: number; outOfStock: number }) => ({
          name: r._id || "Uncategorized",
          inStock: r.inStock,
          outOfStock: r.outOfStock,
        }),
      ),
    },
    projects: {
      total: facet(projectCounts, "total"),
      drafts: facet(projectCounts, "drafts"),
      published: facet(projectCounts, "published"),
      ongoing: facet(projectCounts, "ongoing"),
      completed: facet(projectCounts, "completed"),
      featured: facet(projectCounts, "featured"),
    },
    blog: {
      total: facet(blogCounts, "total"),
      drafts: facet(blogCounts, "drafts"),
      published: facet(blogCounts, "published"),
      featured: facet(blogCounts, "featured"),
    },
    publishingActivity,
    featuredContent: {
      blog: featuredBlog
        ? {
            title: featuredBlog.title,
            slug: featuredBlog.slug,
            image: featuredBlog.heroImage?.url ?? null,
          }
        : null,
      projects: featuredProjects.map((p) => ({
        title: p.title,
        slug: p.slug,
        image: p.heroImage?.url ?? null,
      })),
    },
  };
}
