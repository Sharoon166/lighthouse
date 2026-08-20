"use server";

import type { QueryFilter } from "mongoose";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { slugify } from "@/lib/utils";
import {
  type AttributeDefinition,
  AttributeDefinitionModel,
} from "@/models/attribute-definition";
import { CategoryModel } from "@/models/category";
import { ProductModel } from "@/models/product";
import { type AttributeDefinitionInput, attributeDefinitionInputSchema } from "../validation/attribute-definition";

export type { AttributeDefinition };

export type AttributeDefinitionActionResult =
  | { ok: true; key: string; id: string }
  | { ok: false; fieldErrors: Record<string, string[]>; formErrors: string[] };

function flattenValidation(error: z.ZodError) {
  const flattened = error.flatten();
  return {
    fieldErrors: flattened.fieldErrors,
    formErrors: flattened.formErrors,
  };
}

async function uniqueKey(name: string, excludeId?: string) {
  const baseKey = slugify(name) || "attribute";
  let key = baseKey;
  let counter = 2;
  const existsQuery: QueryFilter<AttributeDefinition> = excludeId
    ? { key, _id: { $ne: excludeId } }
    : { key };
  while (await AttributeDefinitionModel.exists(existsQuery)) {
    key = `${baseKey}-${counter}`;
    counter += 1;
    existsQuery.key = key;
  }
  return key;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function createAttributeDefinition(
  input: unknown,
): Promise<AttributeDefinitionActionResult> {
  const parsed = attributeDefinitionInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, ...flattenValidation(parsed.error) };
  }

  const data = parsed.data;

  try {
    await connectToDatabase();

    const key = await uniqueKey(data.name);

    const created = await AttributeDefinitionModel.create({
      key,
      name: data.name,
      type: data.type,
      options: data.type === "select" || data.type === "color" ? (data.options ?? []) : [],
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    });

    revalidatePath("/admin/attributes");
    revalidatePath("/admin/categories");

    return { ok: true, key, id: String(created._id) };
  } catch (error) {
    console.error("Failed to create attribute definition:", error);
    const message =
      (error as { code?: number }).code === 11000
        ? "An attribute with this name already exists."
        : "Something went wrong while saving. Please try again.";
    return {
      ok: false,
      fieldErrors: {},
      formErrors: [message],
    };
  }
}

export async function updateAttributeDefinition(
  id: string,
  input: unknown,
): Promise<AttributeDefinitionActionResult> {
  const parsed = attributeDefinitionInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, ...flattenValidation(parsed.error) };
  }

  const data = parsed.data;

  try {
    await connectToDatabase();

    const existing = await AttributeDefinitionModel.findById(id);
    if (!existing) {
      return {
        ok: false,
        fieldErrors: {},
        formErrors: ["This attribute no longer exists."],
      };
    }

    existing.set({
      name: data.name,
      type: data.type,
      options: data.type === "select" || data.type === "color" ? (data.options ?? []) : [],
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    });

    await existing.save();

    revalidatePath("/admin/attributes");
    revalidatePath("/admin/categories");

    return { ok: true, key: existing.key, id: String(existing._id) };
  } catch (error) {
    console.error("Failed to update attribute definition:", error);
    const message =
      (error as { code?: number }).code === 11000
        ? "An attribute with this name already exists."
        : "Something went wrong while saving. Please try again.";
    return {
      ok: false,
      fieldErrors: {},
      formErrors: [message],
    };
  }
}

export async function deleteAttributeDefinition(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  await connectToDatabase();

  const existing = await AttributeDefinitionModel.findById(id);
  if (!existing) {
    return { ok: false, message: "This attribute no longer exists." };
  }

  const usedInCategory = await CategoryModel.exists({
    "attributes.attributeId": id,
  });
  if (usedInCategory) {
    return {
      ok: false,
      message:
        "Cannot delete this attribute because it is assigned to one or more categories. Remove it from all categories first, or deactivate it instead.",
    };
  }

  const usedInProduct = await ProductModel.exists({
    $or: [
      { "variantAttributes": existing.name },
      { [`attributes.${existing.key}`]: { $exists: true } },
    ],
  });
  if (usedInProduct) {
    return {
      ok: false,
      message:
        "Cannot delete this attribute because it is used by one or more products. Deactivate it instead.",
    };
  }

  await existing.deleteOne();

  revalidatePath("/admin/attributes");
  revalidatePath("/admin/categories");

  return { ok: true, message: "Attribute deleted." };
}

export async function deactivateAttributeDefinition(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  await connectToDatabase();

  const existing = await AttributeDefinitionModel.findById(id);
  if (!existing) {
    return { ok: false, message: "This attribute no longer exists." };
  }

  existing.isActive = !existing.isActive;
  await existing.save();

  revalidatePath("/admin/attributes");

  return {
    ok: true,
    message: existing.isActive
      ? "Attribute activated."
      : "Attribute deactivated.",
  };
}

const listAttributesSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).default(""),
  showAll: z.boolean().default(false),
});

export type AttributeDefinitionListItem = {
  id: string;
  key: string;
  name: string;
  type: "text" | "number" | "select" | "boolean" | "color";
  options: string[];
  isActive: boolean;
  sortOrder: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AttributeDefinitionListResult = {
  attributes: AttributeDefinitionListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listAttributeDefinitions(
  input: unknown,
): Promise<AttributeDefinitionListResult> {
  const parsed = listAttributesSchema.safeParse(input);
  const { page, pageSize, search, showAll } = parsed.success
    ? parsed.data
    : { page: 1, pageSize: 20, search: "", showAll: false };

  const filter: QueryFilter<AttributeDefinition> = {};
  if (!showAll) {
    filter.isActive = true;
  }
  if (search) {
    filter.name = { $regex: escapeRegExp(search), $options: "i" };
  }

  await connectToDatabase();

  const [total, documents] = await Promise.all([
    AttributeDefinitionModel.countDocuments(filter),
    AttributeDefinitionModel.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  const attributeIds = documents.map((d) => String(d._id));

  let usageCountMap = new Map<string, number>();
  if (attributeIds.length > 0) {
    const objectIds = attributeIds.map((id) => new Types.ObjectId(id));
    const usageCounts = await CategoryModel.aggregate([
      {
        $match: {
          "attributes.attributeId": { $in: objectIds },
        },
      },
      { $unwind: "$attributes" },
      {
        $match: {
          "attributes.attributeId": { $in: objectIds },
        },
      },
      {
        $group: {
          _id: "$attributes.attributeId",
          count: { $sum: 1 },
        },
      },
    ]);

    for (const row of usageCounts) {
      usageCountMap.set(String(row._id), row.count);
    }
  }

  const attributes: AttributeDefinitionListItem[] = documents.map((document) => ({
    id: String(document._id),
    key: document.key,
    name: document.name,
    type: document.type,
    options: document.options,
    isActive: document.isActive,
    sortOrder: document.sortOrder,
    usageCount: usageCountMap.get(String(document._id)) ?? 0,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  }));

  return {
    attributes,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getAttributeDefinitionById(
  id: string,
): Promise<AttributeDefinition | null> {
  await connectToDatabase();
  return AttributeDefinitionModel.findById(id).lean();
}

export async function getAllActiveAttributeDefinitions(): Promise<
  { id: string; key: string; name: string; type: string; options: string[] }[]
> {
  await connectToDatabase();

  const attributes = await AttributeDefinitionModel.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .select("key name type options")
    .lean();

  return attributes.map((a) => ({
    id: String(a._id),
    key: a.key,
    name: a.name,
    type: a.type,
    options: a.options,
  }));
}

export async function getAllAttributeDefinitions(): Promise<
  {
    id: string;
    key: string;
    name: string;
    type: string;
    options: string[];
    isActive: boolean;
  }[]
> {
  await connectToDatabase();

  const attributes = await AttributeDefinitionModel.find()
    .sort({ sortOrder: 1, name: 1 })
    .select("key name type options isActive")
    .lean();

  return attributes.map((a) => ({
    id: String(a._id),
    key: a.key,
    name: a.name,
    type: a.type,
    options: a.options,
    isActive: a.isActive,
  }));
}
