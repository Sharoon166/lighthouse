"use server";

import type { QueryFilter } from "mongoose";
import { revalidatePath, unstable_cache, updateTag } from "next/cache";
import { z } from "zod";
import {
  CLOUDINARY_DEFAULT_FOLDER,
  deleteImage,
  uploadImage,
} from "@/lib/cloudinary";
import { connectToDatabase } from "@/lib/db";
import { slugify } from "@/lib/utils";
import {
  type BlogPost,
  type BlogPostHeroImage,
  BlogPostModel,
} from "@/models/blog-post";
import { blogPostInputSchema } from "./validation";

export type BlogPostActionResult =
  | { ok: true; slug: string }
  | { ok: false; fieldErrors: Record<string, string[]>; formErrors: string[] };

export type BlogPostDraftData = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  content: Record<string, unknown> | null;
  author: {
    name: string;
    designation: string;
    bio: string;
  };
  status: "draft" | "published";
  publishedAt: string | null;
  featured: boolean;
  heroImage: BlogPostHeroImage | null;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    noIndex?: boolean;
  };
};

function flattenValidation(error: z.ZodError) {
  const flattened = error.flatten();
  return {
    fieldErrors: flattened.fieldErrors,
    formErrors: flattened.formErrors,
  };
}

function buildPostData(data: z.infer<typeof blogPostInputSchema>): {
  title: string;
  summary: string;
  content: Record<string, unknown>;
  category: string;
  tags: string[];
  author: { name: string; designation: string; bio: string };
  status: "draft" | "published";
  featured: boolean;
  heroImage: BlogPostHeroImage | null;
  seo: {
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    noIndex: boolean;
  };
} {
  return {
    title: data.title,
    summary: data.summary,
    content: data.content,
    category: data.category,
    tags: data.tags,
    author: {
      name: data.author.name,
      designation: data.author.designation,
      bio: data.author.bio,
    },
    status: data.intent === "publish" ? "published" : "draft",
    featured: data.featured ?? false,
    heroImage: data.heroImage ?? null,
    seo: {
      metaTitle: data.seo?.metaTitle?.trim() || "",
      metaDescription: data.seo?.metaDescription?.trim() || "",
      focusKeyword: data.seo?.focusKeyword?.trim() || "",
      noIndex: data.seo?.noIndex ?? false,
    },
  };
}

async function uniqueSlug(title: string, excludeId?: string) {
  const baseSlug = slugify(title) || "post";
  let slug = baseSlug;
  let counter = 2;
  const existsQuery: QueryFilter<BlogPost> = excludeId
    ? { slug, _id: { $ne: excludeId } }
    : { slug };
  while (await BlogPostModel.exists(existsQuery)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
    existsQuery.slug = slug;
  }
  return slug;
}

export async function createBlogPost(
  input: unknown,
): Promise<BlogPostActionResult> {
  const parsed = blogPostInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, ...flattenValidation(parsed.error) };
  }

  const data = parsed.data;

  try {
    await connectToDatabase();

    if (data.featured) {
      const count = await BlogPostModel.countDocuments({
        featured: true,
        deletedAt: null,
      });
      if (count >= 1) {
        return {
          ok: false,
          fieldErrors: {
            featured: [
              "Maximum 1 featured post allowed. Unfeature the current post first.",
            ],
          },
          formErrors: [],
        };
      }
    }

    const slug = data.slug || (await uniqueSlug(data.title));

    const publishedAt =
      data.intent === "publish"
        ? data.publishedAt
          ? new Date(data.publishedAt)
          : new Date()
        : null;

    await BlogPostModel.create({
      ...buildPostData(data),
      slug,
      publishedAt,
    });

    revalidatePath("/admin/blog");
    updateTag("blog-posts");

    return { ok: true, slug };
  } catch (error) {
    console.error("Failed to create blog post:", error);
    return {
      ok: false,
      fieldErrors: {},
      formErrors: ["Something went wrong while saving. Please try again."],
    };
  }
}

export async function updateBlogPost(
  slug: string,
  input: unknown,
): Promise<BlogPostActionResult> {
  const parsed = blogPostInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, ...flattenValidation(parsed.error) };
  }

  const data = parsed.data;

  try {
    await connectToDatabase();

    const existing = await BlogPostModel.findOne({ slug, deletedAt: null });
    if (!existing) {
      return {
        ok: false,
        fieldErrors: {},
        formErrors: ["This post no longer exists."],
      };
    }

    if (data.featured && !existing.featured) {
      const count = await BlogPostModel.countDocuments({
        featured: true,
        deletedAt: null,
      });
      if (count >= 1) {
        return {
          ok: false,
          fieldErrors: {
            featured: [
              "Maximum 1 featured post allowed. Unfeature the current post first.",
            ],
          },
          formErrors: [],
        };
      }
    }

    const nextSlug =
      data.slug || (await uniqueSlug(data.title, String(existing._id)));

    const publishedAt =
      data.intent === "publish"
        ? data.publishedAt
          ? new Date(data.publishedAt)
          : (existing.publishedAt ?? new Date())
        : null;

    existing.set({
      ...buildPostData(data),
      slug: nextSlug,
      publishedAt,
    });

    await existing.save();

    revalidatePath("/admin/blog");
    updateTag("blog-posts");

    return { ok: true, slug: nextSlug };
  } catch (error) {
    console.error("Failed to update blog post:", error);
    return {
      ok: false,
      fieldErrors: {},
      formErrors: ["Something went wrong while saving. Please try again."],
    };
  }
}

const cachedGetBlogPost = unstable_cache(
  async (key: string): Promise<BlogPostDraftData | null> => {
    await connectToDatabase();

    const document = await BlogPostModel.findOne({
      slug: key,
      deletedAt: null,
    }).lean();
    if (!document) return null;

    return {
      slug: document.slug,
      title: document.title,
      summary: document.summary,
      category: document.category,
      tags: document.tags,
      content: document.content,
      author: {
        name: document.author.name,
        designation: document.author.designation,
        bio: document.author.bio,
      },
      status: document.status,
      publishedAt: document.publishedAt
        ? document.publishedAt.toISOString()
        : null,
      featured: document.featured,
      heroImage: document.heroImage,
      seo: {
        metaTitle: document.seo?.metaTitle || "",
        metaDescription: document.seo?.metaDescription || "",
        focusKeyword: document.seo?.focusKeyword || "",
        noIndex: document.seo?.noIndex || false,
      },
    };
  },
  ["blog-posts", "get-post"],
  { tags: ["blog-posts"] },
);

export async function getBlogPost(
  slug: string,
): Promise<BlogPostDraftData | null> {
  return cachedGetBlogPost(slug);
}

export async function deleteBlogPost(
  slug: string,
): Promise<{ ok: boolean; message?: string }> {
  await connectToDatabase();

  const existing = await BlogPostModel.findOne({ slug, deletedAt: null });
  if (!existing) {
    return { ok: false, message: "This post no longer exists." };
  }

  existing.deletedAt = new Date();
  await existing.save();

  revalidatePath("/admin/blog");
  revalidatePath("/admin/blog/trash");
  updateTag("blog-posts");

  return { ok: true, message: "Moved to trash." };
}

export async function restoreBlogPost(
  slug: string,
): Promise<{ ok: boolean; message?: string }> {
  await connectToDatabase();

  const existing = await BlogPostModel.findOne({
    slug,
    deletedAt: { $ne: null },
  });
  if (!existing) {
    return { ok: false, message: "This post is not in the trash." };
  }

  existing.deletedAt = null;
  await existing.save();

  revalidatePath("/admin/blog");
  revalidatePath("/admin/blog/trash");
  updateTag("blog-posts");

  return { ok: true, message: "Restored." };
}

export async function permanentlyDeleteBlogPost(
  slug: string,
): Promise<{ ok: boolean; message?: string }> {
  await connectToDatabase();

  const existing = await BlogPostModel.findOne({
    slug,
    deletedAt: { $ne: null },
  });
  if (!existing) {
    return { ok: false, message: "This post is not in the trash." };
  }

  if (existing.heroImage?.publicId) {
    await deleteImage(existing.heroImage.publicId).catch((error) => {
      console.error("Failed to delete hero image from Cloudinary:", error);
    });
  }

  await existing.deleteOne();

  revalidatePath("/admin/blog");
  revalidatePath("/admin/blog/trash");
  updateTag("blog-posts");

  return { ok: true, message: "Deleted forever." };
}

export async function getPublishedTags(): Promise<string[]> {
  await connectToDatabase();

  const documents = await BlogPostModel.find({
    deletedAt: null,
    status: "published",
  })
    .select("tags")
    .lean();

  const tagSet = new Set<string>();
  for (const doc of documents) {
    for (const tag of doc.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

export async function getFeaturedPost(): Promise<BlogPostListItem | null> {
  await connectToDatabase();

  const doc = await BlogPostModel.findOne({
    deletedAt: null,
    status: "published",
    featured: true,
  })
    .sort({ publishedAt: -1 })
    .lean();

  if (!doc) return null;

  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    summary: doc.summary,
    category: doc.category,
    tags: doc.tags,
    authorName: doc.author.name,
    status: doc.status,
    featured: doc.featured,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
    heroImage: doc.heroImage,
    deletedAt: null,
  };
}

const listBlogPostsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(8),
  search: z.string().trim().max(200).default(""),
  status: z.enum(["all", "draft", "published"]).default("all"),
  category: z.string().trim().default(""),
  tag: z.string().trim().max(100).default(""),
});

export type BlogPostListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  authorName: string;
  status: "draft" | "published";
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  heroImage: BlogPostHeroImage | null;
  deletedAt: string | null;
};

export type BlogPostListResult = {
  posts: BlogPostListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listBlogPosts(
  input: unknown,
): Promise<BlogPostListResult> {
  const parsed = listBlogPostsSchema.safeParse(input);
  const { page, pageSize, search, status, category, tag } = parsed.success
    ? parsed.data
    : {
        page: 1,
        pageSize: 8,
        search: "",
        status: "all" as const,
        category: "",
        tag: "",
      };

  const filter: QueryFilter<BlogPost> = { deletedAt: null };
  if (status !== "all") {
    filter.status = status;
  }
  if (search) {
    filter.title = { $regex: escapeRegExp(search), $options: "i" };
  }
  if (category) {
    filter.category = category;
  }
  if (tag) {
    filter.tags = { $in: [tag] };
  }

  await connectToDatabase();

  const [total, documents] = await Promise.all([
    BlogPostModel.countDocuments(filter),
    BlogPostModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  const posts: BlogPostListItem[] = documents.map((document) => ({
    id: String(document._id),
    title: document.title,
    slug: document.slug,
    summary: document.summary,
    category: document.category,
    tags: document.tags,
    authorName: document.author.name,
    status: document.status,
    featured: document.featured,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
    publishedAt: document.publishedAt
      ? document.publishedAt.toISOString()
      : null,
    heroImage: document.heroImage,
    deletedAt: null,
  }));

  return {
    posts,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

const listTrashedBlogPostsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(8),
  search: z.string().trim().max(200).default(""),
});

export async function listTrashedBlogPosts(
  input: unknown,
): Promise<BlogPostListResult> {
  const parsed = listTrashedBlogPostsSchema.safeParse(input);
  const { page, pageSize, search } = parsed.success
    ? parsed.data
    : { page: 1, pageSize: 8, search: "" };

  const filter: QueryFilter<BlogPost> = { deletedAt: { $ne: null } };
  if (search) {
    filter.title = { $regex: escapeRegExp(search), $options: "i" };
  }

  await connectToDatabase();

  const [total, documents] = await Promise.all([
    BlogPostModel.countDocuments(filter),
    BlogPostModel.find(filter)
      .sort({ deletedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  const posts: BlogPostListItem[] = documents.map((document) => ({
    id: String(document._id),
    title: document.title,
    slug: document.slug,
    summary: document.summary,
    category: document.category,
    tags: document.tags,
    authorName: document.author.name,
    status: document.status,
    featured: document.featured,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
    publishedAt: document.publishedAt
      ? document.publishedAt.toISOString()
      : null,
    heroImage: document.heroImage,
    deletedAt: document.deletedAt ? document.deletedAt.toISOString() : null,
  }));

  return {
    posts,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export type ToggleFeaturedResult =
  | { ok: true; featured: boolean }
  | { ok: false; message: string };

export async function toggleFeaturedBlogPost(
  slug: string,
): Promise<ToggleFeaturedResult> {
  await connectToDatabase();

  const existing = await BlogPostModel.findOne({ slug, deletedAt: null });
  if (!existing) {
    return { ok: false, message: "This post no longer exists." };
  }

  if (!existing.featured) {
    const count = await BlogPostModel.countDocuments({
      featured: true,
      deletedAt: null,
    });
    if (count >= 1) {
      return {
        ok: false,
        message:
          "Maximum 1 featured post allowed. Unfeature the current post first.",
      };
    }
  }

  existing.featured = !existing.featured;
  await existing.save();

  revalidatePath("/admin/blog");
  updateTag("blog-posts");

  return { ok: true, featured: existing.featured };
}

export type UploadBlogImageResult =
  | { ok: true; image: BlogPostHeroImage }
  | { ok: false; message: string };

export async function uploadBlogImage(
  formData: FormData,
): Promise<UploadBlogImageResult> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { ok: false, message: "No image was provided." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, message: "Only image files are allowed." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      message: "Images must be 10 MB or smaller. Choose a smaller file.",
    };
  }

  const previousPublicId = formData.get("previousPublicId");
  const previousId =
    typeof previousPublicId === "string" && previousPublicId.trim()
      ? previousPublicId.trim()
      : null;

  try {
    const uploaded = await uploadImage(file, {
      folder: CLOUDINARY_DEFAULT_FOLDER,
    });

    if (previousId) {
      await deleteImage(previousId).catch((error) => {
        console.error("Failed to delete previous hero image:", error);
      });
    }

    return {
      ok: true,
      image: { url: uploaded.url, publicId: uploaded.publicId },
    };
  } catch (error) {
    console.error("Failed to upload blog image:", error);
    return {
      ok: false,
      message: "Upload failed. Please try again in a moment.",
    };
  }
}

export async function deleteBlogImage(
  publicId: string,
): Promise<{ ok: boolean }> {
  try {
    await deleteImage(publicId);
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete blog image:", error);
    return { ok: false };
  }
}

const MAX_INLINE_IMAGE_BYTES = 10 * 1024 * 1024;

export type UploadInlineImageResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function uploadInlineImage(
  formData: FormData,
): Promise<UploadInlineImageResult> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { ok: false, message: "No image was provided." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, message: "Only image files are allowed." };
  }
  if (file.size > MAX_INLINE_IMAGE_BYTES) {
    return {
      ok: false,
      message: "Images must be 10 MB or smaller. Choose a smaller file.",
    };
  }

  try {
    const uploaded = await uploadImage(file, {
      folder: `${CLOUDINARY_DEFAULT_FOLDER}/content`,
    });

    return { ok: true, url: uploaded.url };
  } catch (error) {
    console.error("Failed to upload inline image:", error);
    return {
      ok: false,
      message: "Upload failed. Please try again in a moment.",
    };
  }
}
