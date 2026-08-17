import { z } from "zod";

export const projectInputSchema = z
  .object({
    intent: z.enum(["draft", "publish"]),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(100, "Slug must be 100 characters or fewer")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers and hyphens",
      ),
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title must be 200 characters or fewer"),
    subtitle: z
      .string()
      .trim()
      .max(300, "Subtitle must be 300 characters or fewer"),
    description: z.string().trim(),
    client: z.string().trim(),
    duration: z.string().trim(),
    location: z.string().trim(),
    categories: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(40, "Categories must be 40 characters or fewer"),
      )
      .max(8, "Up to 8 categories allowed"),
    materials: z.string().trim(),
    lightControl: z.string().trim(),
    budgetRange: z.string().trim(),
    installationDetails: z.string().trim(),
    aboutProject: z.string().trim(),
    challenges: z.array(
      z.object({
        id: z.string(),
        challenge: z.string().trim().min(1, "Challenge is required"),
        solution: z.string().trim().min(1, "Solution is required"),
      }),
    ),
    features: z.array(
      z.object({
        id: z.string(),
        title: z.string().trim().min(1, "Feature title is required"),
        description: z
          .string()
          .trim()
          .min(1, "Feature description is required"),
      }),
    ),
    heroImage: z
      .object({
        url: z.string().url("Hero image URL is invalid"),
        publicId: z.string().min(1, "Hero image public ID is required"),
        caption: z.string().optional(),
      })
      .nullable()
      .optional(),
    gallery: z.array(
      z.object({
        url: z.string().url("Gallery image URL is invalid"),
        publicId: z.string().min(1, "Gallery image public ID is required"),
        caption: z.string().optional(),
      }),
    ),
    testimonial: z
      .object({
        quote: z.string().trim().min(1, "Testimonial quote is required"),
        author: z.string().trim().min(1, "Testimonial author is required"),
        role: z.string().trim(),
      })
      .nullable()
      .optional(),
    projectStatus: z.enum(["ongoing", "completed"]),
    featured: z.boolean().optional(),
    publishedAt: z.string().nullable().optional(),
    seo: z.object({
      metaTitle: z
        .string()
        .trim()
        .max(60, "Meta title must be 60 characters or fewer"),
      metaDescription: z
        .string()
        .trim()
        .max(160, "Meta description must be 160 characters or fewer"),
      focusKeyword: z.string().trim(),
      noIndex: z.boolean(),
    }),
  })
  .superRefine((data, context) => {
    if (data.intent !== "publish") return;

    if (!data.description) {
      context.addIssue({
        code: "custom",
        path: ["description"],
        message: "Description is required to publish",
      });
    }

    if (!data.client) {
      context.addIssue({
        code: "custom",
        path: ["client"],
        message: "Client is required to publish",
      });
    }

    if (!data.location) {
      context.addIssue({
        code: "custom",
        path: ["location"],
        message: "Location is required to publish",
      });
    }
  });

export type ProjectInput = z.infer<typeof projectInputSchema>;
