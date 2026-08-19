import { z } from "zod";
import { FIELD_LIMITS } from "@/lib/field-limits";

export const attributeDefinitionInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(
        FIELD_LIMITS.attributeDefinition.name,
        `Name must be ${FIELD_LIMITS.attributeDefinition.name} characters or fewer`,
      ),
    type: z.enum(["text", "number", "select", "boolean", "color"]),
    options: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Option cannot be empty")
          .max(
            FIELD_LIMITS.attributeDefinition.optionValue,
            `Option must be ${FIELD_LIMITS.attributeDefinition.optionValue} characters or fewer`,
          ),
      )
      .max(
        FIELD_LIMITS.attributeDefinition.maxOptions,
        `Maximum ${FIELD_LIMITS.attributeDefinition.maxOptions} options allowed`,
      )
      .optional(),
    isActive: z.boolean(),
    sortOrder: z.number().int().min(0),
  })
  .superRefine((data, context) => {
    if (data.type === "select" || data.type === "color") {
      const options = data.options ?? [];
      if (options.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["options"],
          message: "Select attributes must have at least one option",
        });
      }
      const unique = new Set(options.map((o) => o.toLowerCase()));
      if (unique.size !== options.length) {
        context.addIssue({
          code: "custom",
          path: ["options"],
          message: "Options must be unique",
        });
      }
    }
  });

export type AttributeDefinitionInput = z.infer<
  typeof attributeDefinitionInputSchema
>;
