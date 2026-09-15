import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { FALLBACK_CATEGORIES } from "@/lib/shop-data";
import { CategoryModel } from "@/models/category";

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await CategoryModel.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select("name slug description image productCount featured featuredImage")
      .lean();

    if (categories.length > 0) {
      return NextResponse.json({
        categories: categories.map((c) => ({
          id: String(c._id),
          name: c.name,
          slug: c.slug,
          description: c.description || "",
          image: c.image || "/products/6.png",
          productCount: c.productCount || 0,
          featured: c.featured,
          featuredImage: c.featuredImage || "",
        })),
      });
    }
  } catch {}

  return NextResponse.json({
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
  });
}
