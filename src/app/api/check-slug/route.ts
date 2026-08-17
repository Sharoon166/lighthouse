import type { QueryFilter } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { type BlogPost, BlogPostModel } from "@/models/blog-post";
import { type Project, ProjectModel } from "@/models/project";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const collection = searchParams.get("collection");
  const excludeSlug = searchParams.get("excludeSlug") || undefined;

  if (!slug || !collection) {
    return NextResponse.json(
      { error: "slug and collection are required" },
      { status: 400 },
    );
  }

  if (collection !== "blog" && collection !== "project") {
    return NextResponse.json(
      { error: "collection must be 'blog' or 'project'" },
      { status: 400 },
    );
  }

  await connectToDatabase();

  if (slug === excludeSlug) {
    return NextResponse.json({ available: true });
  }

  if (collection === "blog") {
    const query: QueryFilter<BlogPost> = { slug, deletedAt: null };
    const exists = await BlogPostModel.exists(query);
    return NextResponse.json({ available: !exists });
  }

  const query: QueryFilter<Project> = { slug, deletedAt: null };
  const exists = await ProjectModel.exists(query);
  return NextResponse.json({ available: !exists });
}
