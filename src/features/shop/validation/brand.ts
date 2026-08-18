import { z } from "zod";
import { FIELD_LIMITS } from "@/lib/field-limits";

export const brandInputSchema = z.object({
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
  logo: z.string().trim(),
  description: z
    .string()
    .trim()
    .max(FIELD_LIMITS.description.medium, `Description must be ${FIELD_LIMITS.description.medium} characters or fewer`),
  website: z.string().trim().url("Website URL is invalid").or(z.literal("")),
  isActive: z.boolean(),
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

export type BrandInput = z.infer<typeof brandInputSchema>;
