import type { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/db";
import { ProjectModel } from "@/models/project";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lighthouse.pk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectToDatabase();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/faqs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/shipping`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/opple`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  let dynamicPages: MetadataRoute.Sitemap = [];

  try {
    const [products, projects, categories] = await Promise.all([
      import("@/models/product").then(async (mod) => {
        const { ProductModel } = mod;
        return ProductModel.find({
          status: "active",
          deletedAt: null,
        })
          .select("slug updatedAt")
          .lean();
      }),
      ProjectModel.find({ status: "published", deletedAt: null })
        .select("slug updatedAt")
        .lean(),
      import("@/models/category").then(async (mod) => {
        const { CategoryModel } = mod;
        return CategoryModel.find({ deletedAt: null })
          .select("slug updatedAt")
          .lean();
      }),
    ]);

    const productPages: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${siteUrl}/products/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
      url: `${siteUrl}/projects/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${siteUrl}/categories/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    dynamicPages = [...productPages, ...projectPages, ...categoryPages];
  } catch {
    // If DB query fails, return static pages only
  }

  return [...staticPages, ...dynamicPages];
}
