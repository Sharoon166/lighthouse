import { type Model, model, models, Schema, type Types } from "mongoose";
import { slugify } from "@/lib/utils";

export interface ProductVariant {
  _id: Types.ObjectId;
  sku: string;
  slug: string;
  gtin: string;
  mpn: string;
  attributes: Map<string, string>;
  title: string;
  price: number;
  salePrice: number;
  costPrice: number;
  currency: string;
  stock: number;
  lowStockThreshold: number;
  availability: "in_stock" | "out_of_stock" | "preorder" | "backorder";
  images: string[];
  weight: number;
  barcode: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  name: string;
  slug: string;
  description: string;
  descriptionHtml: string;
  shortDescription: string;
  content: {
    materialsAndCare: string;
    shippingAndReturns: string;
    payment: string;
    installationAndBulbs: string;
  };
  specifications: Array<{ key: string; value: string }>;
  specificationsDescription: string;
  category: {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    ancestorSlugs: string[];
  };
  brand: {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    logo: string;
  };
  variantAttributes: string[];
  baseAttributes: Map<string, string>;
  isFeatured: boolean;
  images: string[];
  variants: ProductVariant[];
  priceRange: {
    min: number;
    max: number;
  };
  defaultVariantSku: string;
  totalStock: number;
  inStock: boolean;
  ratings: {
    average: number;
    count: number;
  };
  tags: string[];
  status: "draft" | "active" | "archived";
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<ProductVariant>(
  {
    sku: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    gtin: { type: String, default: "" },
    mpn: { type: String, default: "" },
    attributes: { type: Map, of: String, required: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0, default: 0 },
    currency: { type: String, default: "PKR" },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    availability: {
      type: String,
      enum: ["in_stock", "out_of_stock", "preorder", "backorder"],
      default: "in_stock",
    },
    images: [{ type: String }],
    weight: { type: Number, min: 0 },
    barcode: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true },
);

const categoryRefSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, default: "" },
    slug: { type: String, default: "" },
    ancestorSlugs: [{ type: String }],
  },
  { _id: false },
);

const brandRefSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    name: { type: String, default: "" },
    slug: { type: String, default: "" },
    logo: { type: String, default: "" },
  },
  { _id: false },
);

const ratingsSchema = new Schema(
  {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  { _id: false },
);

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

const contentSchema = new Schema(
  {
    materialsAndCare: { type: String, default: "", trim: true },
    shippingAndReturns: { type: String, default: "", trim: true },
    payment: { type: String, default: "", trim: true },
    installationAndBulbs: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const specificationSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const productSchema = new Schema<Product>(
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
    descriptionHtml: { type: String, default: "" },
    shortDescription: { type: String, default: "", trim: true },
    content: { type: contentSchema, default: () => ({}) },
    specifications: { type: [specificationSchema], default: [] },
    specificationsDescription: { type: String, default: "", trim: true },
    category: { type: categoryRefSchema, required: true },
    brand: { type: brandRefSchema, required: true },
    variantAttributes: [{ type: String }],
    baseAttributes: { type: Map, of: String, default: () => new Map() },
    images: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    variants: {
      type: [variantSchema],
      validate: {
        validator: (v: ProductVariant[]) => v.length > 0,
        message: "Product must have at least one variant",
      },
    },
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    defaultVariantSku: { type: String, default: "" },
    totalStock: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    ratings: { type: ratingsSchema, default: () => ({}) },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    seo: { type: seoSchema, default: () => ({}) },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ "category._id": 1, status: 1, "priceRange.min": 1 });
productSchema.index({ "brand._id": 1, status: 1 });
productSchema.index({ "variants.sku": 1 }, { unique: true });
productSchema.index({ "variants.slug": 1 }, { unique: true });
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ "category._id": 1, inStock: 1, status: 1 });

productSchema.pre("save", function () {
  if (this.isModified("name") && !this.slug) {
    this.slug = slugify(this.name);
  }

  if (this.isModified("variants")) {
    const activeVariants = this.variants.filter((v) => v.isActive);

    if (activeVariants.length > 0) {
      const prices = activeVariants.map((v) => v.salePrice ?? v.price);
      this.priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices),
      };

      this.totalStock = activeVariants.reduce((sum, v) => sum + v.stock, 0);
      this.inStock = this.totalStock > 0;

      const def = activeVariants.find((v) => v.isDefault) || activeVariants[0];
      this.defaultVariantSku = def?.sku ?? "";
    } else {
      this.priceRange = { min: 0, max: 0 };
      this.totalStock = 0;
      this.inStock = false;
      this.defaultVariantSku = "";
    }

    this.variants.forEach((v) => {
      if (!v.slug) {
        v.slug = slugify(Array.from(v.attributes.values()).join("-"));
      }
    });
  }
});

export const ProductModel: Model<Product> =
  (models.Product as Model<Product> | undefined) ??
  model<Product>("Product", productSchema);
