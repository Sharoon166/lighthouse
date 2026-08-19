import { z } from "zod";
import { FIELD_LIMITS } from "@/lib/field-limits";

export const categoryAttributeAssignmentSchema = z.object({
  attributeId: z.string().trim().min(1, "Attribute is required"),
  required: z.boolean().default(false),
  isVariant: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export const categoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(FIELD_LIMITS.name.short, `Name must be ${FIELD_LIMITS.name.short} characters or fewer`),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(FIELD_LIMITS.slug, `Slug must be ${FIELD_LIMITS.slug} characters or fewer`)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens",
    ),
  description: z
    .string()
    .trim()
    .max(FIELD_LIMITS.description.medium, `Description must be ${FIELD_LIMITS.description.medium} characters or fewer`),
  image: z.string().trim(),
  parent: z.string().trim().nullable().optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
  attributes: z
    .array(categoryAttributeAssignmentSchema)
    .optional()
    .superRefine((attrs, context) => {
      if (!attrs) return;
      const ids = attrs.map((a) => a.attributeId);
      const uniqueIds = new Set(ids);
      if (uniqueIds.size !== ids.length) {
        context.addIssue({
          code: "custom",
          path: ["attributes"],
          message: "Each attribute can only be assigned once",
        });
      }
    }),
  seo: z
    .object({
      metaTitle: z
        .string()
        .trim()
        .max(FIELD_LIMITS.seo.metaTitle, `Meta title must be ${FIELD_LIMITS.seo.metaTitle} characters or fewer`)
        .optional(),
      metaDescription: z
        .string()
        .trim()
        .max(FIELD_LIMITS.seo.metaDescription, `Meta description must be ${FIELD_LIMITS.seo.metaDescription} characters or fewer`)
        .optional(),
    })
    .optional(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
