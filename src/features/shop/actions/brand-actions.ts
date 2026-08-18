"use server";

import type { QueryFilter } from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { type Brand, BrandModel } from "@/models/brand";

export type { Brand };
import { brandInputSchema } from "../validation/brand";

export type BrandActionResult =
  | { ok: true; slug: string }
  | { ok: false; fieldErrors: Record<string, string[]>; formErrors: string[] };

function flattenValidation(error: z.ZodError) {
  const flattened = error.flatten();
  return {
    fieldErrors: flattened.fieldErrors,
    formErrors: flattened.formErrors,
  };
}

async function uniqueSlug(name: string, excludeId?: string) {
  const baseSlug = slugify(name) || "brand";
  let slug = baseSlug;
  let counter = 2;
  const existsQuery: QueryFilter<Brand> = excludeId
    ? { slug, _id: { $ne: excludeId } }
    : { slug };
  while (await BrandModel.exists(existsQuery)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
    existsQuery.slug = slug;
  }
  return slug;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function createBrand(
  input: unknown,
): Promise<BrandActionResult> {
  const parsed = brandInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, ...flattenValidation(parsed.error) };
  }

  const data = parsed.data;

  try {
    await connectToDatabase();

    const slug = data.slug || (await uniqueSlug(data.name));

    await BrandModel.create({
      name: data.name,
      slug,
      logo: data.logo,
      description: data.description,
      website: data.website,
      isActive: data.isActive,
      seo: {
        metaTitle: data.seo?.metaTitle?.trim() || "",
        metaDescription: data.seo?.metaDescription?.trim() || "",
      },
    });

    revalidatePath("/admin/brands");

    return { ok: true, slug };
  } catch (error) {
    console.error("Failed to create brand:", error);
    return {
      ok: false,
      fieldErrors: {},
      formErrors: ["Something went wrong while saving. Please try again."],
    };
  }
}

export async function updateBrand(
  id: string,
  input: unknown,
): Promise<BrandActionResult> {
  const parsed = brandInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, ...flattenValidation(parsed.error) };
  }

  const data = parsed.data;

  try {
    await connectToDatabase();

    const existing = await BrandModel.findById(id);
    if (!existing) {
      return {
        ok: false,
        fieldErrors: {},
        formErrors: ["This brand no longer exists."],
      };
    }

    const nextSlug =
      data.slug || (await uniqueSlug(data.name, String(existing._id)));

    existing.set({
      name: data.name,
      slug: nextSlug,
      logo: data.logo,
      description: data.description,
      website: data.website,
      isActive: data.isActive,
      seo: {
        metaTitle: data.seo?.metaTitle?.trim() || "",
        metaDescription: data.seo?.metaDescription?.trim() || "",
      },
    });

    await existing.save();

    revalidatePath("/admin/brands");

    return { ok: true, slug: nextSlug };
  } catch (error) {
    console.error("Failed to update brand:", error);
    return {
      ok: false,
      fieldErrors: {},
      formErrors: ["Something went wrong while saving. Please try again."],
    };
  }
}

export async function deleteBrand(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  await connectToDatabase();

  const existing = await BrandModel.findById(id);
  if (!existing) {
    return { ok: false, message: "This brand no longer exists." };
  }

  await existing.deleteOne();

  revalidatePath("/admin/brands");

  return { ok: true, message: "Brand deleted." };
}

const listBrandsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).default(""),
  showAll: z.boolean().default(false),
});

export type BrandListItem = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type BrandListResult = {
  brands: BrandListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listBrands(input: unknown): Promise<BrandListResult> {
  const parsed = listBrandsSchema.safeParse(input);
  const { page, pageSize, search, showAll } = parsed.success
    ? parsed.data
    : { page: 1, pageSize: 20, search: "", showAll: false };

  const filter: QueryFilter<Brand> = {};
  if (!showAll) {
    filter.isActive = true;
  }
  if (search) {
    filter.name = { $regex: escapeRegExp(search), $options: "i" };
  }

  await connectToDatabase();

  const [total, documents] = await Promise.all([
    BrandModel.countDocuments(filter),
    BrandModel.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  const brands: BrandListItem[] = documents.map((document) => ({
    id: String(document._id),
    name: document.name,
    slug: document.slug,
    logo: document.logo,
    description: document.description,
    isActive: document.isActive,
    productCount: document.productCount,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  }));

  return {
    brands,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getAllBrands(): Promise<
  { id: string; name: string; slug: string; logo: string }[]
> {
  await connectToDatabase();

  const brands = await BrandModel.find({ isActive: true })
    .sort({ name: 1 })
    .select("name slug logo")
    .lean();

  return brands.map((b) => ({
    id: String(b._id),
    name: b.name,
    slug: b.slug,
    logo: b.logo,
  }));
}

export async function getBrandById(
  id: string,
): Promise<Brand | null> {
  await connectToDatabase();
  return BrandModel.findById(id).lean();
}
