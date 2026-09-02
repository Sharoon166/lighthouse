import { z } from "zod";
import { BLOG_CATEGORIES } from "@/lib/constants";
import { FIELD_LIMITS } from "@/lib/field-limits";

const blogCategoryValues = BLOG_CATEGORIES.map((c) => c.value) as [
  string,
  ...string[],
];

export const blogPostInputSchema = z
  .object({
    intent: z.enum(["draft", "publish"]),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(
        FIELD_LIMITS.slug,
        `Slug must be ${FIELD_LIMITS.slug} characters or fewer`,
      )
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers and hyphens",
      ),
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(
        FIELD_LIMITS.name.medium,
        `Title must be ${FIELD_LIMITS.name.medium} characters or fewer`,
      ),
    summary: z
      .string()
      .trim()
      .max(
        FIELD_LIMITS.description.long,
        `Summary must be ${FIELD_LIMITS.description.long} characters or fewer`,
      ),
    category: z.string().trim().default(""),
    tags: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(
            FIELD_LIMITS.tag.name,
            `Tags must be ${FIELD_LIMITS.tag.name} characters or fewer`,
          ),
      )
      .max(
        FIELD_LIMITS.tag.maxCount,
        `Up to ${FIELD_LIMITS.tag.maxCount} tags allowed`,
      ),
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
        .max(
          FIELD_LIMITS.name.short,
          `Designation must be ${FIELD_LIMITS.name.short} characters or fewer`,
        ),
      bio: z
        .string()
        .trim()
        .max(
          FIELD_LIMITS.description.medium,
          `Bio must be ${FIELD_LIMITS.description.medium} characters or fewer`,
        ),
    }),
    featured: z.boolean().optional(),
    publishedAt: z.string().nullable().optional(),
    seo: z
      .object({
        metaTitle: z
          .string()
          .trim()
          .max(
            FIELD_LIMITS.seo.metaTitle,
            `Meta title must be ${FIELD_LIMITS.seo.metaTitle} characters or fewer`,
          )
          .optional(),
        metaDescription: z
          .string()
          .trim()
          .max(
            FIELD_LIMITS.seo.metaDescription,
            `Meta description must be ${FIELD_LIMITS.seo.metaDescription} characters or fewer`,
          )
          .optional(),
        focusKeyword: z
          .string()
          .trim()
          .max(
            FIELD_LIMITS.seo.focusKeyword,
            `Focus keyword must be ${FIELD_LIMITS.seo.focusKeyword} characters or fewer`,
          )
          .optional(),
        noIndex: z.boolean().optional(),
      })
      .optional(),
  })
  .superRefine((data, context) => {
    if (data.intent !== "publish") return;

    if (!data.category) {
      context.addIssue({
        code: "custom",
        path: ["category"],
        message: "A category is required to publish",
      });
    }

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
