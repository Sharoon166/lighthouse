import { type Model, model, models, Schema } from "mongoose";

export interface BlogPostAuthor {
  name: string;
  designation: string;
  bio: string;
}

export interface BlogPostHeroImage {
  url: string;
  publicId: string;
}

export interface BlogPostSEO {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  noIndex?: boolean;
}

export interface BlogPost {
  title: string;
  slug: string;
  summary: string;
  content: Record<string, unknown> | null;
  category: string;
  tags: string[];
  author: BlogPostAuthor;
  status: "draft" | "published";
  publishedAt: Date | null;
  featured: boolean;
  heroImage: BlogPostHeroImage | null;
  seo: BlogPostSEO;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const authorSchema = new Schema<BlogPostAuthor>(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, default: "", trim: true },
    bio: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const heroImageSchema = new Schema<BlogPostHeroImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
);

const seoSchema = new Schema<BlogPostSEO>(
  {
    metaTitle: { type: String, default: "", trim: true, maxlength: 60 },
    metaDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160,
    },
    focusKeyword: { type: String, default: "", trim: true, maxlength: 100 },
    noIndex: { type: Boolean, default: false },
  },
  { _id: false },
);

const blogPostSchema = new Schema<BlogPost>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    summary: { type: String, default: "", trim: true },
    content: { type: Schema.Types.Mixed, default: null },
    category: { type: String, default: "", trim: true },
    tags: { type: [String], default: [] },
    author: { type: authorSchema, required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date, default: null },
    featured: { type: Boolean, default: false },
    heroImage: { type: heroImageSchema, default: null },
    seo: { type: seoSchema, default: () => ({}) },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ deletedAt: 1, publishedAt: -1 });

export const BlogPostModel: Model<BlogPost> =
  (models.BlogPost as Model<BlogPost> | undefined) ??
  model<BlogPost>("BlogPost", blogPostSchema);
