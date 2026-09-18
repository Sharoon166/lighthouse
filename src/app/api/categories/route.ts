import { NextResponse } from "next/server";
import { computeCumulativeCounts } from "@/lib/category-helpers";
import { connectToDatabase } from "@/lib/db";
import { FALLBACK_CATEGORIES } from "@/lib/shop-data";
import { CategoryModel } from "@/models/category";

export async function GET() {
  try {
    await connectToDatabase();
    const allCategories = await CategoryModel.find({ isActive: true })
      .sort({ level: 1, sortOrder: 1, name: 1 })
      .select("name slug description image productCount parent featured featuredImage")
      .lean({ serialize: true });

    if (allCategories.length > 0) {
      const countBySlug = computeCumulativeCounts(allCategories);

      // Return only top-level categories (no parent)
      const topLevel = allCategories.filter((c) => !c.parent);

      return NextResponse.json(
        {
          categories: topLevel.map((c) => ({
            id: String(c._id),
            name: c.name,
            slug: c.slug,
            description: c.description || "",
            image: c.image || "/products/6.png",
            productCount: countBySlug.get(c.slug) ?? c.productCount ?? 0,
            featured: c.featured,
            featuredImage: c.featuredImage || "",
          })),
        },
        {
          headers: {
            "Cache-Control":
              "private, no-cache, no-store, must-revalidate",
          },
        },
      );
    }
  } catch {}

  return NextResponse.json(
    {
      categories: FALLBACK_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        productCount: c.designsCount,
        featured: false,
        featuredImage: "",
      })),
    },
    {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    },
  );
}
