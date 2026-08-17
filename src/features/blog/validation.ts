import { z } from "zod";

export const blogPostInputSchema = z
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
    summary: z
      .string()
      .trim()
      .max(1000, "Summary must be 1000 characters or fewer"),
    tags: z
      .array(
        z.string().trim().min(1).max(40, "Tags must be 40 characters or fewer"),
      )
      .max(8, "Up to 8 tags allowed"),
    content: z.record(z.string(), z.unknown()),
    heroImage: z
      .object({
        url: z.string().url("Hero image URL is invalid"),
        publicId: z.string().min(1, "Hero image public ID is required"),
      })
      .nullable()
      .optional(),
    author: z.object({
      name: z.string().trim(),
      designation: z
        .string()
        .trim()
        .max(100, "Designation must be 100 characters or fewer"),
      bio: z.string().trim().max(500, "Bio must be 500 characters or fewer"),
    }),
    featured: z.boolean().optional(),
    publishedAt: z.string().nullable().optional(),
    seo: z
      .object({
        metaTitle: z
          .string()
          .trim()
          .max(60, "Meta title must be 60 characters or fewer")
          .optional(),
        metaDescription: z
          .string()
          .trim()
          .max(160, "Meta description must be 160 characters or fewer")
          .optional(),
        focusKeyword: z
          .string()
          .trim()
          .max(100, "Focus keyword must be 100 characters or fewer")
          .optional(),
        noIndex: z.boolean().optional(),
      })
      .optional(),
  })
  .superRefine((data, context) => {
    if (data.intent !== "publish") return;

    if (!data.summary) {
      context.addIssue({
        code: "custom",
        path: ["summary"],
        message: "A summary is required to publish",
      });
    }

    if (!data.author.name) {
      context.addIssue({
        code: "custom",
        path: ["author", "name"],
        message: "An author name is required to publish",
      });
    }

    const nodes = Array.isArray(data.content.content)
      ? data.content.content
      : [];
    if (nodes.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["content"],
        message: "Content is required to publish",
      });
    }
  });

export type BlogPostInput = z.infer<typeof blogPostInputSchema>;
