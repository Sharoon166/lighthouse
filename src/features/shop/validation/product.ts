import { z } from "zod";
import { FIELD_LIMITS } from "@/lib/field-limits";

const variantInputSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .max(
      FIELD_LIMITS.variant.sku,
      `SKU must be ${FIELD_LIMITS.variant.sku} characters or fewer`,
    ),
  name: z
    .string()
    .trim()
    .min(1, "Variant name is required")
    .max(
      FIELD_LIMITS.name.medium,
      `Name must be ${FIELD_LIMITS.name.medium} characters or fewer`,
    ),
  attributes: z.record(z.string(), z.string()),
  price: z.number().min(0, "Price must be 0 or greater"),
  salePrice: z.number().min(0).nullable().optional(),
  costPrice: z.number().min(0).nullable().optional(),
  stock: z.number().int().min(0, "Stock must be 0 or greater"),
  images: z.array(z.string().trim()).optional(),
  isActive: z.boolean(),
});

const variantDraftInputSchema = z.object({
  sku: z
    .string()
    .trim()
    .max(
      FIELD_LIMITS.variant.sku,
      `SKU must be ${FIELD_LIMITS.variant.sku} characters or fewer`,
    )
    .optional()
    .default(""),
  name: z
    .string()
    .trim()
    .max(
      FIELD_LIMITS.name.medium,
      `Name must be ${FIELD_LIMITS.name.medium} characters or fewer`,
    )
    .optional()
    .default(""),
  attributes: z.record(z.string(), z.string()).optional().default({}),
  price: z.number().min(0).optional().default(0),
  salePrice: z.number().min(0).nullable().optional(),
  costPrice: z.number().min(0).nullable().optional(),
  stock: z.number().int().min(0).optional().default(0),
  images: z.array(z.string().trim()).optional(),
  isActive: z.boolean().optional().default(true),
});

const productBaseSchema = z.object({
  intent: z.enum(["draft", "publish"]).default("publish"),

  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(
      FIELD_LIMITS.name.medium,
      `Name must be ${FIELD_LIMITS.name.medium} characters or fewer`,
    ),

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

  description: z.string().trim(),

  shortDescription: z
    .string()
    .trim()
    .max(
      FIELD_LIMITS.description.short,
      `Short description must be ${FIELD_LIMITS.description.short} characters or fewer`,
    )
    .optional(),

  category: z.string().trim().min(1, "Category is required"),

  brand: z.string().trim().min(1, "Brand is required"),

  images: z
    .array(z.string().trim())
    .min(1, "At least one product image is required"),

  attributes: z
    .array(
      z.object({
        name: z
          .string()
          .trim()
          .min(1, "Attribute name is required")
          .max(
            FIELD_LIMITS.variant.attributeName,
            `Name must be ${FIELD_LIMITS.variant.attributeName} characters or fewer`,
          ),

        values: z
          .array(
            z
              .string()
              .trim()
              .min(1)
              .max(FIELD_LIMITS.variant.attributeValue),
          )
          .min(1, "At least one value is required"),

        isColor: z.boolean().default(false),
      }),
    )
    .optional(),

  specifications: z
    .array(
      z.object({
        key: z
          .string()
          .trim()
          .min(1, "Specification name is required")
          .max(
            FIELD_LIMITS.specification.key,
            `Name must be ${FIELD_LIMITS.specification.key} characters or fewer`,
          ),

        value: z
          .string()
          .trim()
          .min(1, "Specification value is required")
          .max(
            FIELD_LIMITS.specification.value,
            `Value must be ${FIELD_LIMITS.specification.value} characters or fewer`,
          ),
      }),
    )
    .max(
      FIELD_LIMITS.specification.maxCount,
      `Maximum ${FIELD_LIMITS.specification.maxCount} specifications allowed`,
    )
    .optional(),

  specificationsDescription: z
    .string()
    .trim()
    .max(
      FIELD_LIMITS.specification.description,
      `Specifications description must be ${FIELD_LIMITS.specification.description} characters or fewer`,
    )
    .optional()
    .default(""),

  variantDimensions: z
    .array(z.string().trim().min(1))
    .optional()
    .default([]),

  variants: z
    .array(variantInputSchema)
    .min(1, "At least one variant is required"),

  isActive: z.boolean(),

  isFeatured: z.boolean(),

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
    })
    .optional(),

  content: z
    .object({
      materialsAndCare: z
        .string()
        .trim()
        .max(
          FIELD_LIMITS.content.materialsAndCare,
          `Materials & Care must be ${FIELD_LIMITS.content.materialsAndCare} characters or fewer`,
        )
        .optional(),

      shippingAndReturns: z
        .string()
        .trim()
        .max(
          FIELD_LIMITS.content.shippingAndReturns,
          `Shipping & Returns must be ${FIELD_LIMITS.content.shippingAndReturns} characters or fewer`,
        )
        .optional(),

      payment: z
        .string()
        .trim()
        .max(
          FIELD_LIMITS.content.payment,
          `Payment must be ${FIELD_LIMITS.content.payment} characters or fewer`,
        )
        .optional(),

      installationAndBulbs: z
        .string()
        .trim()
        .max(
          FIELD_LIMITS.content.installationAndBulbs,
          `Installation & Bulbs must be ${FIELD_LIMITS.content.installationAndBulbs} characters or fewer`,
        )
        .optional(),
    })
    .optional(),
});

export const productInputSchema = productBaseSchema.superRefine(
  (data, context) => {
    const skus = data.variants.map((variant) => variant.sku);
    const uniqueSkus = new Set(skus);

    if (uniqueSkus.size !== skus.length) {
      context.addIssue({
        code: "custom",
        path: ["variants"],
        message: "Each variant must have a unique SKU",
      });
    }

    const comboKeys = data.variants.map((variant) => {
      const entries = Object.entries(variant.attributes).sort(
        ([a], [b]) => a.localeCompare(b),
      );

      return entries
        .map(([key, value]) => `${key}=${value}`)
        .join("|");
    });

    const uniqueCombos = new Set(comboKeys);

    if (uniqueCombos.size !== comboKeys.length) {
      context.addIssue({
        code: "custom",
        path: ["variants"],
        message:
          "Each variant must have a unique combination of attribute values",
      });
    }
  },
);

export const productDraftInputSchema = productBaseSchema
  .partial({
    variants: true,
    images: true,
    brand: true,
  })
  .extend({
    intent: z.literal("draft"),
  });

export type ProductInput = z.infer<typeof productInputSchema>;