import { NextResponse } from "next/server";
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
      // Build tree and compute cumulative counts (own + descendants)
      type TreeNode = {
        id: string;
        parentId: string | null;
        productCount: number;
        children: TreeNode[];
      };
      const nodeMap = new Map<string, TreeNode>();
      for (const c of allCategories) {
        nodeMap.set(String(c._id), {
          id: String(c._id),
          parentId: c.parent ? String(c.parent) : null,
          productCount: c.productCount || 0,
          children: [],
        });
      }
      const roots: TreeNode[] = [];
      for (const node of nodeMap.values()) {
        if (node.parentId && nodeMap.has(node.parentId)) {
          nodeMap.get(node.parentId)!.children.push(node);
        } else {
          roots.push(node);
        }
      }
      function computeCounts(node: TreeNode): number {
        let total = node.productCount;
        for (const child of node.children) {
          total += computeCounts(child);
        }
        node.productCount = total;
        return total;
      }
      for (const root of roots) {
        computeCounts(root);
      }
      // Flatten to slug→count map
      const countBySlug = new Map<string, number>();
      function flatten(nodes: TreeNode[]) {
        for (const node of nodes) {
          const cat = allCategories.find((c) => String(c._id) === node.id);
          if (cat) countBySlug.set(cat.slug, node.productCount);
          flatten(node.children);
        }
      }
      flatten(roots);

      // Return only top-level categories (level === 0 or no parent)
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
