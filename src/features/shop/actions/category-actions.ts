"use server";

import type { QueryFilter } from "mongoose";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { type Category, CategoryModel } from "@/models/category";
import { AttributeDefinitionModel } from "@/models/attribute-definition";
import { ProductModel } from "@/models/product";

export type { Category };
import { categoryInputSchema } from "../validation/category";

const MAX_CATEGORY_DEPTH = 4;

async function cascadeDescendants(
  categoryId: string,
  newAncestors: string[],
  newAncestorSlugs: string[],
  newLevel: number,
) {
  const children = await CategoryModel.find({ parent: categoryId });

  for (const child of children) {
    child.ancestors = [
      ...newAncestors.map((a) => a as unknown as Category["ancestors"][0]),
      categoryId as unknown as Category["ancestors"][0],
    ];
    child.ancestorSlugs = [...newAncestorSlugs, slugify(child.name)];
    child.level = newLevel + 1;
    await child.save();

    await cascadeDescendants(
      String(child._id),
      child.ancestors.map((a) => String(a)),
      child.ancestorSlugs,
      child.level,
    );
  }
}

function getAncestorChain(categoryId: string, allCategories: Map<string, { parent: string | null }>): string[] {
  const chain: string[] = [];
  let currentId: string | null = categoryId;
  while (currentId) {
    chain.push(currentId);
    const cat = allCategories.get(currentId);
    currentId = cat?.parent ?? null;
  }
  return chain;
}

export type CategoryActionResult =
  | { ok: true; slug: string }
  | { ok: false; fieldErrors: Record<string, string[]>; formErrors: string[] };

export type CategoryTreeNode = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: string | null;
  ancestors: string[];
  ancestorSlugs: string[];
  level: number;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  children: CategoryTreeNode[];
};

function flattenValidation(error: z.ZodError) {
  const flattened = error.flatten();
  return {
    fieldErrors: flattened.fieldErrors,
    formErrors: flattened.formErrors,
  };
}

async function uniqueSlug(name: string, excludeId?: string) {
  const baseSlug = slugify(name) || "category";
  let slug = baseSlug;
  let counter = 2;
  const existsQuery: QueryFilter<Category> = excludeId
    ? { slug, _id: { $ne: excludeId } }
    : { slug };
  while (await CategoryModel.exists(existsQuery)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
    existsQuery.slug = slug;
  }
  return slug;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function createCategory(
  input: unknown,
): Promise<CategoryActionResult> {
  const parsed = categoryInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, ...flattenValidation(parsed.error) };
  }

  const data = parsed.data;

  try {
    await connectToDatabase();

    if (data.parent) {
      const parentExists = await CategoryModel.exists({ _id: data.parent });
      if (!parentExists) {
        return {
          ok: false,
          fieldErrors: { parent: ["Parent category not found."] },
          formErrors: [],
        };
      }

      const parentDoc = await CategoryModel.findById(data.parent).select("level").lean();
      if (parentDoc && parentDoc.level + 1 >= MAX_CATEGORY_DEPTH) {
        return {
          ok: false,
          fieldErrors: { parent: [`Categories cannot exceed ${MAX_CATEGORY_DEPTH} levels deep.`] },
          formErrors: [],
        };
      }
    }

    const slug = await uniqueSlug(data.slug || data.name);

    await CategoryModel.create({
      name: data.name,
      slug,
      description: data.description,
      image: data.image,
      parent: data.parent || null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      attributes: (data.attributes ?? []).map((a) => ({
        attributeId: a.attributeId as unknown as Category["attributes"][0]["attributeId"],
        required: a.required,
        isVariant: a.isVariant,
        sortOrder: a.sortOrder,
      })),
      seo: {
        metaTitle: data.seo?.metaTitle?.trim() || "",
        metaDescription: data.seo?.metaDescription?.trim() || "",
      },
    });

    revalidatePath("/admin/categories");

    return { ok: true, slug };
  } catch (error) {
    console.error("Failed to create category:", error);
    const message =
      (error as { code?: number }).code === 11000
        ? "A category with this name or slug already exists."
        : "Something went wrong while saving. Please try again.";
    return {
      ok: false,
      fieldErrors: {},
      formErrors: [message],
    };
  }
}

export async function updateCategory(
  id: string,
  input: unknown,
): Promise<CategoryActionResult> {
  const parsed = categoryInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, ...flattenValidation(parsed.error) };
  }

  const data = parsed.data;

  try {
    await connectToDatabase();

    const existing = await CategoryModel.findById(id);
    if (!existing) {
      return {
        ok: false,
        fieldErrors: {},
        formErrors: ["This category no longer exists."],
      };
    }

    if (data.parent && data.parent === id) {
      return {
        ok: false,
        fieldErrors: { parent: ["A category cannot be its own parent."] },
        formErrors: [],
      };
    }

    if (data.parent) {
      const parentExists = await CategoryModel.exists({ _id: data.parent });
      if (!parentExists) {
        return {
          ok: false,
          fieldErrors: { parent: ["Parent category not found."] },
          formErrors: [],
        };
      }

      const allCats = await CategoryModel.find({}, { parent: 1 }).lean();
      const catMap = new Map(allCats.map((c) => [String(c._id), { parent: c.parent ? String(c.parent) : null }]));
      const descendantChain = getAncestorChain(data.parent, catMap);
      if (descendantChain.includes(id)) {
        return {
          ok: false,
          fieldErrors: { parent: ["Cannot set a descendant as parent (circular reference)."] },
          formErrors: [],
        };
      }

      const parentDoc = await CategoryModel.findById(data.parent).select("level").lean();
      const currentMaxDepth = Math.max(existing.level, ...allCats.filter((c) => {
        const chain = getAncestorChain(String(c._id), catMap);
        return chain.includes(id);
      }).map((c) => {
        const chain = getAncestorChain(String(c._id), catMap);
        return chain.length;
      }));
      if (parentDoc && parentDoc.level + currentMaxDepth >= MAX_CATEGORY_DEPTH) {
        return {
          ok: false,
          fieldErrors: { parent: [`Moving here would exceed the maximum depth of ${MAX_CATEGORY_DEPTH} levels.`] },
          formErrors: [],
        };
      }
    }

    const parentChanged =
      String(existing.parent ?? "") !== (data.parent || "");

    const nextSlug =
      await uniqueSlug(data.slug || data.name, String(existing._id));

    existing.set({
      name: data.name,
      slug: nextSlug,
      description: data.description,
      image: data.image,
      parent: data.parent || null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      attributes: (data.attributes ?? []).map((a) => ({
        attributeId: a.attributeId as unknown as Category["attributes"][0]["attributeId"],
        required: a.required,
        isVariant: a.isVariant,
        sortOrder: a.sortOrder,
      })),
      seo: {
        metaTitle: data.seo?.metaTitle?.trim() || "",
        metaDescription: data.seo?.metaDescription?.trim() || "",
      },
    });

    await existing.save();

    if (parentChanged) {
      await cascadeDescendants(
        String(existing._id),
        existing.ancestors.map((a) => String(a)),
        existing.ancestorSlugs,
        existing.level,
      );
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");

    return { ok: true, slug: nextSlug };
  } catch (error) {
    console.error("Failed to update category:", error);
    const message =
      (error as { code?: number }).code === 11000
        ? "A category with this name or slug already exists."
        : "Something went wrong while saving. Please try again.";
    return {
      ok: false,
      fieldErrors: {},
      formErrors: [message],
    };
  }
}

export async function deleteCategory(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  await connectToDatabase();

  const existing = await CategoryModel.findById(id);
  if (!existing) {
    return { ok: false, message: "This category no longer exists." };
  }

  const childCount = await CategoryModel.countDocuments({ parent: id });
  if (childCount > 0) {
    return {
      ok: false,
      message:
        "Cannot delete a category that has subcategories. Remove or reassign them first.",
    };
  }

  const productCount = await ProductModel.countDocuments({ "category._id": id });
  if (productCount > 0) {
    return {
      ok: false,
      message: `Cannot delete this category because ${productCount} product${productCount !== 1 ? "s are" : " is"} assigned to it. Reassign or remove them first.`,
    };
  }

  await existing.deleteOne();

  revalidatePath("/admin/categories");

  return { ok: true, message: "Category deleted." };
}

const listCategoriesSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).default(""),
  parentId: z.string().trim().nullable().default(null),
  showAll: z.boolean().default(false),
});

export type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: string | null;
  level: number;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  childCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryListResult = {
  categories: CategoryListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listCategories(
  input: unknown,
): Promise<CategoryListResult> {
  const parsed = listCategoriesSchema.safeParse(input);
  const { page, pageSize, search, parentId, showAll } = parsed.success
    ? parsed.data
    : { page: 1, pageSize: 20, search: "", parentId: null, showAll: false };

  const filter: QueryFilter<Category> = {};
  if (!showAll) {
    filter.parent = parentId;
  }
  if (search) {
    filter.name = { $regex: escapeRegExp(search), $options: "i" };
  }

  await connectToDatabase();

  const [total, documents] = await Promise.all([
    CategoryModel.countDocuments(filter),
    CategoryModel.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  const categoryIds = documents.map((d) => String(d._id));

  let childCountMap = new Map<string, number>();
  if (categoryIds.length > 0) {
    const parentObjectIds = categoryIds
      .filter((id) => id)
      .map((id) => new Types.ObjectId(id));
    const childCounts = await CategoryModel.aggregate([
      { $match: { parent: { $in: parentObjectIds } } },
      { $group: { _id: "$parent", count: { $sum: 1 } } },
    ]);

    for (const row of childCounts) {
      childCountMap.set(String(row._id), row.count);
    }
  }

  const categories: CategoryListItem[] = documents.map((document) => ({
    id: String(document._id),
    name: document.name,
    slug: document.slug,
    description: document.description,
    image: document.image,
    parentId: document.parent ? String(document.parent) : null,
    level: document.level,
    isActive: document.isActive,
    sortOrder: document.sortOrder,
    productCount: document.productCount,
    childCount: childCountMap.get(String(document._id)) ?? 0,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  }));

  return {
    categories,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  await connectToDatabase();

  const all = await CategoryModel.find()
    .sort({ level: 1, sortOrder: 1, name: 1 })
    .lean();

  const nodeMap = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  for (const doc of all) {
    const node: CategoryTreeNode = {
      id: String(doc._id),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      image: doc.image,
      parentId: doc.parent ? String(doc.parent) : null,
      ancestors: doc.ancestors.map((a) => String(a)),
      ancestorSlugs: doc.ancestorSlugs,
      level: doc.level,
      isActive: doc.isActive,
      sortOrder: doc.sortOrder,
      productCount: doc.productCount,
      children: [],
    };
    nodeMap.set(node.id, node);
  }

  for (const node of nodeMap.values()) {
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function getAllCategories(): Promise<
  { id: string; name: string; slug: string; level: number }[]
> {
  await connectToDatabase();

  const categories = await CategoryModel.find({ isActive: true })
    .sort({ level: 1, sortOrder: 1, name: 1 })
    .select("name slug level")
    .lean();

  return categories.map((c) => ({
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    level: c.level,
  }));
}

export async function getCategoryById(
  id: string,
): Promise<Category | null> {
  await connectToDatabase();
  return CategoryModel.findById(id).lean();
}

export async function getAllCategoriesAdmin(): Promise<
  {
    id: string;
    name: string;
    slug: string;
    level: number;
    ancestors: string[];
    parent: string | null;
    attributes: {
      attributeId: string;
      required: boolean;
      isVariant: boolean;
      sortOrder: number;
    }[];
  }[]
> {
  await connectToDatabase();

  const categories = await CategoryModel.find()
    .sort({ level: 1, sortOrder: 1, name: 1 })
    .select("name slug level parent ancestors attributes")
    .lean();

  return categories.map((c) => ({
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    level: c.level,
    ancestors: c.ancestors.map((a) => String(a)),
    parent: c.parent ? String(c.parent) : null,
    attributes: (c.attributes ?? []).map((a) => ({
      attributeId: String(a.attributeId),
      required: a.required,
      isVariant: a.isVariant,
      sortOrder: a.sortOrder,
    })),
  }));
}

export async function getCategoryAttributes(
  categoryId: string,
): Promise<
  {
    attributeId: string;
    key: string;
    name: string;
    type: string;
    options: string[];
    required: boolean;
    isVariant: boolean;
    sortOrder: number;
  }[]
> {
  await connectToDatabase();

  const category = await CategoryModel.findById(categoryId)
    .select("attributes ancestors")
    .lean();

  if (!category) return [];

  const categoryIds = [
    ...category.ancestors.map((a) => String(a)),
    String(category._id),
  ];

  const allCats = await CategoryModel.find({
    _id: { $in: categoryIds.map((id) => new Types.ObjectId(id)) },
  })
    .select("attributes")
    .lean();

  const allAttributeIds = new Set<string>();
  for (const cat of allCats) {
    for (const a of cat.attributes ?? []) {
      allAttributeIds.add(String(a.attributeId));
    }
  }

  if (allAttributeIds.size === 0) return [];

  const definitions = await AttributeDefinitionModel.find({
    _id: {
      $in: [...allAttributeIds].map((id) => new Types.ObjectId(id)),
    },
    isActive: true,
  })
    .select("key name type options")
    .lean();

  const definitionMap = new Map(
    definitions.map((d) => [String(d._id), d]),
  );

  const result: {
    attributeId: string;
    key: string;
    name: string;
    type: string;
    options: string[];
    required: boolean;
    isVariant: boolean;
    sortOrder: number;
  }[] = [];

  const seen = new Set<string>();

  for (const cat of allCats) {
    for (const a of cat.attributes ?? []) {
      const id = String(a.attributeId);
      if (seen.has(id)) continue;
      seen.add(id);

      const def = definitionMap.get(id);
      if (!def) continue;

      result.push({
        attributeId: id,
        key: def.key,
        name: def.name,
        type: def.type,
        options: def.options,
        required: a.required,
        isVariant: a.isVariant,
        sortOrder: a.sortOrder,
      });
    }
  }

  return result.sort((a, b) => a.sortOrder - b.sortOrder);
}
