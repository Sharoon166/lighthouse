"use server";

import type { QueryFilter } from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteImage, extractPublicId } from "@/lib/cloudinary";
import { connectToDatabase } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { BrandModel } from "@/models/brand";
import { CategoryModel } from "@/models/category";
import { type Product, ProductModel } from "@/models/product";
import { productInputSchema } from "../validation/product";

export type { Product };

export type ProductActionResult =
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
  const baseSlug = slugify(name) || "product";
  let slug = baseSlug;
  let counter = 2;
  const existsQuery: QueryFilter<Product> = excludeId
    ? { slug, _id: { $ne: excludeId } }
    : { slug };
  while (await ProductModel.exists(existsQuery)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
    existsQuery.slug = slug;
  }
  return slug;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function buildProductData(data: z.infer<typeof productInputSchema>) {
  const [categoryDoc, brandDoc] = await Promise.all([
    CategoryModel.findById(data.category).lean(),
    BrandModel.findById(data.brand).lean(),
  ]);

  if (!categoryDoc) {
    throw new Error("Category not found");
  }
  if (!brandDoc) {
    throw new Error("Brand not found");
  }

  const variantAttributes = [
    ...new Set([
      ...(data.variantDimensions ?? []),
      ...(data.attributes ?? []).map((a) => a.name),
    ]),
  ];

  const baseAttributes = new Map<string, string>();
  for (const spec of data.specifications ?? []) {
    if (spec.key.trim() && spec.value.trim()) {
      baseAttributes.set(spec.key.trim(), spec.value.trim());
    }
  }
  for (const attr of data.attributes ?? []) {
    if (attr.name.trim()) {
      baseAttributes.set(attr.name.trim(), attr.values.join(","));
    }
  }

  return {
    name: data.name,
    description: data.description,
    descriptionHtml: "",
    shortDescription: data.shortDescription || "",
    content: {
      materialsAndCare: data.content?.materialsAndCare?.trim() || "",
      shippingAndReturns: data.content?.shippingAndReturns?.trim() || "",
      payment: data.content?.payment?.trim() || "",
      installationAndBulbs: data.content?.installationAndBulbs?.trim() || "",
    },
    specifications: (data.specifications ?? [])
      .filter((s) => s.key.trim() && s.value.trim())
      .map((s) => ({ key: s.key.trim(), value: s.value.trim() })),
    specificationsDescription: data.specificationsDescription?.trim() || "",
    category: {
      _id: categoryDoc._id,
      name: categoryDoc.name,
      slug: categoryDoc.slug,
      ancestorSlugs: categoryDoc.ancestorSlugs,
    },
    brand: {
      _id: brandDoc._id,
      name: brandDoc.name,
      slug: brandDoc.slug,
      logo: brandDoc.logo,
    },
    variantAttributes,
    baseAttributes,
    images: data.images,
    isFeatured: data.isFeatured,
    variants: data.variants.map((v, index) => ({
      sku: v.sku,
      slug: slugify(v.name),
      gtin: "",
      mpn: "",
      attributes: new Map(Object.entries(v.attributes)),
      colorHex: v.colorHex || "",
      title: v.name,
      price: v.price,
      salePrice: v.salePrice != null ? v.salePrice : undefined,
      costPrice: v.costPrice != null ? v.costPrice : 0,
      currency: "PKR",
      stock: v.stock,
      lowStockThreshold: 5,
      availability: (v.stock > 0 ? "in_stock" : "out_of_stock") as
        | "in_stock"
        | "out_of_stock"
        | "preorder"
        | "backorder",
      images: v.images ?? [],
      weight: undefined as number | undefined,
      barcode: "",
      isDefault: index === 0,
      isActive: v.isActive,
    })),
    tags: [] as string[],
    status: (data.intent === "draft"
      ? "draft"
      : data.isActive
        ? "active"
        : "draft") as "draft" | "active" | "archived",
    seo: {
      metaTitle: data.seo?.metaTitle?.trim() || "",
      metaDescription: data.seo?.metaDescription?.trim() || "",
    },
  };
}

export async function createProduct(
  input: unknown,
): Promise<ProductActionResult> {
  const parsed = productInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, ...flattenValidation(parsed.error) };
  }

  const data = parsed.data;

  try {
    await connectToDatabase();

    const slug = await uniqueSlug(data.slug || data.name);

    const productData = await buildProductData(data);

    await ProductModel.create({
      ...productData,
      slug,
    });

    revalidatePath("/admin/products");

    return { ok: true, slug };
  } catch (error) {
    console.error("Failed to create product:", error);
    const message =
      (error as { code?: number }).code === 11000
        ? "A product with this slug or a variant with this SKU already exists. Please use unique values."
        : "Something went wrong while saving. Please try again.";
    return {
      ok: false,
      fieldErrors: {},
      formErrors: [message],
    };
  }
}

export async function updateProduct(
  id: string,
  input: unknown,
): Promise<ProductActionResult> {
  const parsed = productInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, ...flattenValidation(parsed.error) };
  }

  const data = parsed.data;

  try {
    await connectToDatabase();

    const existing = await ProductModel.findById(id);
    if (!existing) {
      return {
        ok: false,
        fieldErrors: {},
        formErrors: ["This product no longer exists."],
      };
    }

    const nextSlug = await uniqueSlug(
      data.slug || data.name,
      String(existing._id),
    );

    const productData = await buildProductData(data);

    existing.set({
      ...productData,
      slug: nextSlug,
    });

    await existing.save();

    revalidatePath("/admin/products");

    return { ok: true, slug: nextSlug };
  } catch (error) {
    console.error("Failed to update product:", error);
    
    // Handle duplicate variant slug within product
    if (error instanceof Error && error.message.includes("Duplicate variant slug")) {
      return {
        ok: false,
        fieldErrors: {},
        formErrors: [error.message],
      };
    }
    
    // Handle MongoDB duplicate key errors
    const message =
      (error as { code?: number }).code === 11000
        ? "A product with this slug or a variant with this SKU already exists. Please use unique values."
        : "Something went wrong while saving. Please try again.";
    return {
      ok: false,
      fieldErrors: {},
      formErrors: [message],
    };
  }
}

export async function updateProductStatus(
  id: string,
  status: "draft" | "active" | "archived",
): Promise<{ ok: boolean; message?: string }> {
  await connectToDatabase();

  const product = await ProductModel.findById(id);
  if (!product) {
    return { ok: false, message: "Product not found." };
  }

  product.status = status;
  await product.save();

  revalidatePath("/admin/products");

  return { ok: true, message: "Status updated." };
}

export async function deleteProduct(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  await connectToDatabase();

  const existing = await ProductModel.findById(id);
  if (!existing) {
    return { ok: false, message: "This product no longer exists." };
  }

  if (existing.deletedAt) {
    return { ok: false, message: "This product is already in trash." };
  }

  existing.deletedAt = new Date();
  await existing.save();

  revalidatePath("/admin/products");

  return { ok: true, message: "Product moved to trash." };
}

export async function restoreProduct(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  await connectToDatabase();

  const existing = await ProductModel.findById(id);
  if (!existing) {
    return { ok: false, message: "Product not found." };
  }

  existing.deletedAt = null;
  await existing.save();

  revalidatePath("/admin/products");
  revalidatePath("/admin/products/trash");

  return { ok: true, message: "Product restored." };
}

export async function permanentlyDeleteProduct(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  await connectToDatabase();

  const existing = await ProductModel.findById(id);
  if (!existing) {
    return { ok: false, message: "Product not found." };
  }

  for (const imageUrl of existing.images) {
    const publicId = extractPublicId(imageUrl);
    if (publicId) {
      await deleteImage(publicId).catch((error) => {
        console.error("Failed to delete product image from Cloudinary:", error);
      });
    }
  }

  for (const variant of existing.variants) {
    for (const imageUrl of variant.images) {
      const publicId = extractPublicId(imageUrl);
      if (publicId) {
        await deleteImage(publicId).catch((error) => {
          console.error("Failed to delete variant image from Cloudinary:", error);
        });
      }
    }
  }

  await existing.deleteOne();

  revalidatePath("/admin/products");
  revalidatePath("/admin/products/trash");

  return { ok: true, message: "Product permanently deleted." };
}

export async function updateVariantStock(
  productId: string,
  variantId: string,
  stock: number,
): Promise<{ ok: boolean; message?: string }> {
  await connectToDatabase();

  const product = await ProductModel.findById(productId);
  if (!product) {
    return { ok: false, message: "Product not found." };
  }

  const variant = product.variants.find((v) => String(v._id) === variantId);
  if (!variant) {
    return { ok: false, message: "Variant not found." };
  }

  variant.stock = Math.max(0, stock);
  variant.availability = variant.stock > 0 ? "in_stock" : "out_of_stock";

  await product.save();

  revalidatePath("/admin/products");

  return { ok: true, message: "Stock updated." };
}

const listProductsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(24),
  search: z.string().trim().max(200).default(""),
  status: z.enum(["all", "draft", "active", "archived"]).default("all"),
  categoryId: z.string().trim().default(""),
  brandId: z.string().trim().default(""),
  inStock: z.boolean().nullable().default(null),
  sortBy: z
    .enum(["newest", "price_asc", "price_desc", "name"])
    .default("newest"),
});

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  brandName: string;
  priceRange: { min: number; max: number };
  inStock: boolean;
  totalStock: number;
  status: "draft" | "active" | "archived";
  defaultVariantSku: string;
  images: string[];
  ratings: { average: number; count: number };
  createdAt: string;
  updatedAt: string;
};

export type ProductListResult = {
  products: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listProducts(input: unknown): Promise<ProductListResult> {
  const parsed = listProductsSchema.safeParse(input);
  const {
    page,
    pageSize,
    search,
    status,
    categoryId,
    brandId,
    inStock,
    sortBy,
  } = parsed.success
    ? parsed.data
    : {
        page: 1,
        pageSize: 24,
        search: "",
        status: "all" as const,
        categoryId: "",
        brandId: "",
        inStock: null,
        sortBy: "newest" as const,
      };

  const filter: QueryFilter<Product> = {};
  filter.deletedAt = { $eq: null };
  if (status !== "all") {
    filter.status = status;
  }
  if (categoryId) {
    filter["category._id"] = categoryId;
  }
  if (brandId) {
    filter["brand._id"] = brandId;
  }
  if (inStock !== null) {
    filter.inStock = inStock;
  }
  if (search) {
    filter.name = { $regex: escapeRegExp(search), $options: "i" };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    price_asc: { "priceRange.min": 1 },
    price_desc: { "priceRange.max": -1 },
    name: { name: 1 },
  };

  await connectToDatabase();

  const [total, documents] = await Promise.all([
    ProductModel.countDocuments(filter),
    ProductModel.find(filter)
      .sort(sortMap[sortBy])
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  const products: ProductListItem[] = documents.map((document) => ({
    id: String(document._id),
    name: document.name,
    slug: document.slug,
    categoryName: document.category.name,
    brandName: document.brand.name,
    priceRange: document.priceRange,
    inStock: document.inStock,
    totalStock: document.totalStock,
    status: document.status,
    defaultVariantSku: document.defaultVariantSku,
    images: document.images,
    ratings: document.ratings,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  }));

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProduct(id: string): Promise<Product | null> {
  await connectToDatabase();
  return ProductModel.findById(id).lean();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await connectToDatabase();
  return ProductModel.findOne({
    slug,
    deletedAt: { $eq: null },
    status: { $ne: "archived" },
  }).lean();
}

export async function getProductById(id: string): Promise<Product | null> {
  await connectToDatabase();
  return ProductModel.findOne({ _id: id, deletedAt: null }).lean();
}

const listTrashedProductsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).default(""),
});

export type TrashedProductListItem = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  brandName: string;
  status: "draft" | "active" | "archived";
  images: string[];
  deletedAt: string | null;
};

export type TrashedProductListResult = {
  products: TrashedProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listTrashedProducts(
  input: unknown,
): Promise<TrashedProductListResult> {
  const parsed = listTrashedProductsSchema.safeParse(input);
  const { page, pageSize, search } = parsed.success
    ? parsed.data
    : { page: 1, pageSize: 20, search: "" };

  const filter: Record<string, unknown> = { deletedAt: { $ne: null } };
  if (search) {
    filter.name = { $regex: escapeRegExp(search), $options: "i" };
  }

  await connectToDatabase();

  const [total, documents] = await Promise.all([
    ProductModel.collection.countDocuments(filter),
    ProductModel.collection
      .aggregate([
        { $match: filter },
        { $sort: { deletedAt: -1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ])
      .toArray(),
  ]);

  const products: TrashedProductListItem[] = documents.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    categoryName: doc.category?.name ?? "",
    brandName: doc.brand?.name ?? "",
    status: doc.status,
    images: doc.images ?? [],
    deletedAt: doc.deletedAt instanceof Date ? doc.deletedAt.toISOString() : doc.deletedAt ?? null,
  }));

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
