import { type Model, model, models, Schema, type Types } from "mongoose";

export interface Category {
  name: string;
  slug: string;
  description: string;
  image: string;
  parent: Types.ObjectId | null;
  ancestors: Types.ObjectId[];
  ancestorSlugs: string[];
  level: number;
  isActive: boolean;
  sortOrder: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const seoSchema = new Schema(
  {
    metaTitle: { type: String, default: "", trim: true, maxlength: 60 },
    metaDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160,
    },
  },
  { _id: false },
);

const categorySchema = new Schema<Category>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    ancestors: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    ancestorSlugs: [{ type: String }],
    level: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
    seo: { type: seoSchema, default: () => ({}) },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

categorySchema.index({ parent: 1, isActive: 1, sortOrder: 1 });
categorySchema.index({ ancestors: 1, isActive: 1 });

categorySchema.pre("save", async function () {
  if (!this.isModified("parent")) return;

  if (!this.parent) {
    this.ancestors = [];
    this.ancestorSlugs = [];
    this.level = 0;
    return;
  }

  const parentDoc = await model("Category").findById(this.parent);
  if (!parentDoc) {
    throw new Error("Parent category not found");
  }

  this.ancestors = [...parentDoc.ancestors, parentDoc._id];
  this.ancestorSlugs = [...parentDoc.ancestorSlugs, parentDoc.slug];
  this.level = parentDoc.level + 1;
});

export const CategoryModel: Model<Category> =
  (models.Category as Model<Category> | undefined) ??
  model<Category>("Category", categorySchema);
