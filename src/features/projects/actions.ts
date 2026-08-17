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
  type Project,
  type ProjectImage,
  ProjectModel,
} from "@/models/project";
import { projectInputSchema } from "./validation";

export type ProjectActionResult =
  | { ok: true; slug: string }
  | { ok: false; fieldErrors: Record<string, string[]>; formErrors: string[] };

export type ProjectDraftData = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  client: string;
  duration: string;
  location: string;
  categories: string[];
  materials: string;
  lightControl: string;
  budgetRange: string;
  installationDetails: string;
  aboutProject: string;
  challenges: Array<{ id: string; challenge: string; solution: string }>;
  features: Array<{ id: string; title: string; description: string }>;
  heroImage: ProjectImage | null;
  gallery: ProjectImage[];
  testimonial: { quote: string; author: string; role: string } | null;
  projectStatus: "ongoing" | "completed";
  seo: {
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    noIndex: boolean;
  };
  status: "draft" | "published";
  publishedAt: string | null;
  featured: boolean;
};

function flattenValidation(error: z.ZodError) {
  const flattened = error.flatten();
  return {
    fieldErrors: flattened.fieldErrors,
    formErrors: flattened.formErrors,
  };
}

function buildProjectData(data: z.infer<typeof projectInputSchema>) {
  return {
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
    client: data.client,
    duration: data.duration,
    location: data.location,
    categories: data.categories,
    materials: data.materials,
    lightControl: data.lightControl,
    budgetRange: data.budgetRange,
    installationDetails: data.installationDetails,
    aboutProject: data.aboutProject,
    challenges: data.challenges,
    features: data.features,
    heroImage: data.heroImage ?? null,
    gallery: data.gallery,
    testimonial: data.testimonial ?? null,
    projectStatus: data.projectStatus,
    seo: data.seo,
    status:
      data.intent === "publish" ? ("published" as const) : ("draft" as const),
    featured: data.featured ?? false,
  };
}

async function uniqueSlug(title: string, excludeId?: string) {
  const baseSlug = slugify(title) || "project";
  let slug = baseSlug;
  let counter = 2;
  const existsQuery: QueryFilter<Project> = excludeId
    ? { slug, _id: { $ne: excludeId } }
    : { slug };
  while (await ProjectModel.exists(existsQuery)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
    existsQuery.slug = slug;
  }
  return slug;
}

export async function createProject(
  input: unknown,
): Promise<ProjectActionResult> {
  const parsed = projectInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, ...flattenValidation(parsed.error) };
  }

  const data = parsed.data;

  try {
    await connectToDatabase();

    if (data.featured) {
      const count = await ProjectModel.countDocuments({
        featured: true,
        deletedAt: null,
      });
      if (count >= 3) {
        return {
          ok: false,
          fieldErrors: {
            featured: [
              "Maximum 3 featured projects allowed. Unfeature another project first.",
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

    await ProjectModel.create({
      ...buildProjectData(data),
      slug,
      publishedAt,
    });

    revalidatePath("/admin/projects");
    updateTag("projects");

    return { ok: true, slug };
  } catch (error) {
    console.error("Failed to create project:", error);
    return {
      ok: false,
      fieldErrors: {},
      formErrors: ["Something went wrong while saving. Please try again."],
    };
  }
}

export async function updateProject(
  slug: string,
  input: unknown,
): Promise<ProjectActionResult> {
  const parsed = projectInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, ...flattenValidation(parsed.error) };
  }

  const data = parsed.data;

  try {
    await connectToDatabase();

    const existing = await ProjectModel.findOne({ slug, deletedAt: null });
    if (!existing) {
      return {
        ok: false,
        fieldErrors: {},
        formErrors: ["This project no longer exists."],
      };
    }

    if (data.featured && !existing.featured) {
      const count = await ProjectModel.countDocuments({
        featured: true,
        deletedAt: null,
      });
      if (count >= 3) {
        return {
          ok: false,
          fieldErrors: {
            featured: [
              "Maximum 3 featured projects allowed. Unfeature another project first.",
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
      ...buildProjectData(data),
      slug: nextSlug,
      publishedAt,
    });

    await existing.save();

    revalidatePath("/admin/projects");
    updateTag("projects");

    return { ok: true, slug: nextSlug };
  } catch (error) {
    console.error("Failed to update project:", error);
    return {
      ok: false,
      fieldErrors: {},
      formErrors: ["Something went wrong while saving. Please try again."],
    };
  }
}

const cachedGetProject = unstable_cache(
  async (key: string): Promise<ProjectDraftData | null> => {
    await connectToDatabase();

    const document = await ProjectModel.findOne({
      slug: key,
      deletedAt: null,
    }).lean();
    if (!document) return null;

    return {
      slug: document.slug,
      title: document.title,
      subtitle: document.subtitle,
      description: document.description,
      client: document.client,
      duration: document.duration,
      location: document.location,
      categories: document.categories,
      materials: document.materials,
      lightControl: document.lightControl,
      budgetRange: document.budgetRange,
      installationDetails: document.installationDetails,
      aboutProject: document.aboutProject,
      challenges: document.challenges,
      features: document.features,
      heroImage: document.heroImage,
      gallery: document.gallery,
      testimonial: document.testimonial,
      projectStatus: document.projectStatus,
      seo: document.seo,
      status: document.status,
      publishedAt: document.publishedAt
        ? document.publishedAt.toISOString()
        : null,
      featured: document.featured,
    };
  },
  ["projects", "get-project"],
  { tags: ["projects"] },
);

export async function getProject(
  slug: string,
): Promise<ProjectDraftData | null> {
  return cachedGetProject(slug);
}

export async function deleteProject(
  slug: string,
): Promise<{ ok: boolean; message?: string }> {
  await connectToDatabase();

  const existing = await ProjectModel.findOne({ slug, deletedAt: null });
  if (!existing) {
    return { ok: false, message: "This project no longer exists." };
  }

  existing.deletedAt = new Date();
  await existing.save();

  revalidatePath("/admin/projects");
  revalidatePath("/admin/projects/trash");
  updateTag("projects");

  return { ok: true, message: "Moved to trash." };
}

export async function restoreProject(
  slug: string,
): Promise<{ ok: boolean; message?: string }> {
  await connectToDatabase();

  const existing = await ProjectModel.findOne({
    slug,
    deletedAt: { $ne: null },
  });
  if (!existing) {
    return { ok: false, message: "This project is not in the trash." };
  }

  existing.deletedAt = null;
  await existing.save();

  revalidatePath("/admin/projects");
  revalidatePath("/admin/projects/trash");
  updateTag("projects");

  return { ok: true, message: "Restored." };
}

export async function permanentlyDeleteProject(
  slug: string,
): Promise<{ ok: boolean; message?: string }> {
  await connectToDatabase();

  const existing = await ProjectModel.findOne({
    slug,
    deletedAt: { $ne: null },
  });
  if (!existing) {
    return { ok: false, message: "This project is not in the trash." };
  }

  // Delete hero image
  if (existing.heroImage?.publicId) {
    await deleteImage(existing.heroImage.publicId).catch((error) => {
      console.error("Failed to delete hero image from Cloudinary:", error);
    });
  }

  // Delete gallery images
  for (const image of existing.gallery) {
    if (image.publicId) {
      await deleteImage(image.publicId).catch((error) => {
        console.error("Failed to delete gallery image from Cloudinary:", error);
      });
    }
  }

  await existing.deleteOne();

  revalidatePath("/admin/projects");
  revalidatePath("/admin/projects/trash");
  updateTag("projects");

  return { ok: true, message: "Deleted forever." };
}

const listProjectsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(12),
  search: z.string().trim().max(200).default(""),
  status: z.enum(["all", "draft", "published"]).default("all"),
  category: z.string().trim().default(""),
});

export type ProjectListItem = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  client: string;
  location: string;
  categories: string[];
  projectStatus: "ongoing" | "completed";
  status: "draft" | "published";
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  heroImage: ProjectImage | null;
  deletedAt: string | null;
};

export type ProjectListResult = {
  projects: ProjectListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listProjects(input: unknown): Promise<ProjectListResult> {
  const parsed = listProjectsSchema.safeParse(input);
  const { page, pageSize, search, status, category } = parsed.success
    ? parsed.data
    : {
        page: 1,
        pageSize: 12,
        search: "",
        status: "all" as const,
        category: "",
      };

  const filter: QueryFilter<Project> = { deletedAt: null };
  if (status !== "all") {
    filter.status = status;
  }
  if (search) {
    filter.title = { $regex: escapeRegExp(search), $options: "i" };
  }
  if (category) {
    filter.categories = category;
  }

  await connectToDatabase();

  const [total, documents] = await Promise.all([
    ProjectModel.countDocuments(filter),
    ProjectModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  const projects: ProjectListItem[] = documents.map((document) => ({
    id: String(document._id),
    title: document.title,
    slug: document.slug,
    subtitle: document.subtitle,
    client: document.client,
    location: document.location,
    categories: document.categories,
    projectStatus: document.projectStatus,
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
    projects,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

const listTrashedProjectsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(12),
  search: z.string().trim().max(200).default(""),
});

export async function listTrashedProjects(
  input: unknown,
): Promise<ProjectListResult> {
  const parsed = listTrashedProjectsSchema.safeParse(input);
  const { page, pageSize, search } = parsed.success
    ? parsed.data
    : { page: 1, pageSize: 12, search: "" };

  const filter: QueryFilter<Project> = { deletedAt: { $ne: null } };
  if (search) {
    filter.title = { $regex: escapeRegExp(search), $options: "i" };
  }

  await connectToDatabase();

  const [total, documents] = await Promise.all([
    ProjectModel.countDocuments(filter),
    ProjectModel.find(filter)
      .sort({ deletedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  const projects: ProjectListItem[] = documents.map((document) => ({
    id: String(document._id),
    title: document.title,
    slug: document.slug,
    subtitle: document.subtitle,
    client: document.client,
    location: document.location,
    categories: document.categories,
    projectStatus: document.projectStatus,
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
    projects,
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

export async function toggleFeaturedProject(
  slug: string,
): Promise<ToggleFeaturedResult> {
  await connectToDatabase();

  const existing = await ProjectModel.findOne({ slug, deletedAt: null });
  if (!existing) {
    return { ok: false, message: "This project no longer exists." };
  }

  if (!existing.featured) {
    const count = await ProjectModel.countDocuments({
      featured: true,
      deletedAt: null,
    });
    if (count >= 3) {
      return {
        ok: false,
        message:
          "Maximum 3 featured projects allowed. Unfeature another project first.",
      };
    }
  }

  existing.featured = !existing.featured;
  await existing.save();

  revalidatePath("/admin/projects");
  updateTag("projects");

  return { ok: true, featured: existing.featured };
}

export type UploadProjectImageResult =
  | { ok: true; image: ProjectImage }
  | { ok: false; message: string };

export async function uploadProjectImage(
  formData: FormData,
): Promise<UploadProjectImageResult> {
  const file = formData.get("file");
  const caption = formData.get("caption");

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
      folder: `${CLOUDINARY_DEFAULT_FOLDER}/projects`,
    });

    if (previousId) {
      await deleteImage(previousId).catch((error) => {
        console.error("Failed to delete previous image:", error);
      });
    }

    return {
      ok: true,
      image: {
        url: uploaded.url,
        publicId: uploaded.publicId,
        caption: typeof caption === "string" ? caption : "",
      },
    };
  } catch (error) {
    console.error("Failed to upload project image:", error);
    return {
      ok: false,
      message: "Upload failed. Please try again in a moment.",
    };
  }
}

export async function deleteProjectImage(
  publicId: string,
): Promise<{ ok: boolean }> {
  try {
    await deleteImage(publicId);
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete project image:", error);
    return { ok: false };
  }
}
