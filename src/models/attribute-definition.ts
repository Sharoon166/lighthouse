import { type Model, model, models, Schema } from "mongoose";

export interface AttributeDefinition {
  id?: string;
  key: string;
  name: string;
  type: "text" | "number" | "select" | "boolean" | "color";
  options: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const attributeDefinitionSchema = new Schema<AttributeDefinition>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["text", "number", "select", "boolean", "color"],
      required: true,
    },
    options: [{ type: String }],
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

attributeDefinitionSchema.index({ name: "text" });

export const AttributeDefinitionModel: Model<AttributeDefinition> =
  (models.AttributeDefinition as Model<AttributeDefinition> | undefined) ??
  model<AttributeDefinition>("AttributeDefinition", attributeDefinitionSchema);
