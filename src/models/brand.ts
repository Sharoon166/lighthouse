import { type Model, model, models, Schema } from "mongoose";

export interface Brand {
  name: string;
  slug: string;
  logo: string;
  description: string;
  website: string;
  isActive: boolean;
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

const brandSchema = new Schema<Brand>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logo: { type: String, default: "" },
    description: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true, index: true },
    seo: { type: seoSchema, default: () => ({}) },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const BrandModel: Model<Brand> =
  (models.Brand as Model<Brand> | undefined) ??
  model<Brand>("Brand", brandSchema);
