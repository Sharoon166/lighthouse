import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/models/product";
import { ProjectModel } from "@/models/project";
import { BlogPostModel } from "@/models/blog-post";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json([]);

  await connectToDatabase();

  const safe = escapeRegExp(q);

  const [textProducts, regexProducts, projects, posts] = await Promise.all([
    ProductModel.find({ $text: { $search: q } })
      .select("name slug status")
      .limit(5)
      .lean(),
    ProductModel.find({ name: { $regex: safe, $options: "i" } })
      .select("name slug status")
      .limit(5)
      .lean(),
    ProjectModel.find({ title: { $regex: safe, $options: "i" }, deletedAt: null })
      .select("title slug status")
      .limit(5)
      .lean(),
    BlogPostModel.find({ title: { $regex: safe, $options: "i" }, deletedAt: null })
      .select("title slug status")
      .limit(5)
      .lean(),
  ]);

  const seen = new Set<string>();
  const results: {
    type: string;
    title: string;
    slug: string;
    status: string;
    href: string;
  }[] = [];

  for (const p of [...textProducts, ...regexProducts]) {
    if (!seen.has(p.slug)) {
      seen.add(p.slug);
      results.push({
        type: "product",
        title: p.name,
        slug: p.slug,
        status: p.status,
        href: `/admin/products/${p.slug}`,
      });
    }
  }
  for (const p of projects) {
    results.push({
      type: "project",
      title: p.title,
      slug: p.slug,
      status: p.status,
      href: `/admin/projects/${p.slug}`,
    });
  }
  for (const p of posts) {
    results.push({
      type: "blog",
      title: p.title,
      slug: p.slug,
      status: p.status,
      href: `/admin/blog/${p.slug}`,
    });
  }

  return NextResponse.json(results.slice(0, 10));
}
