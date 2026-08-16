import { type Model, model, models, Schema } from "mongoose";

export interface ProjectImage {
  url: string;
  publicId: string;
  caption?: string;
}

export interface ProjectChallenge {
  id: string;
  challenge: string;
  solution: string;
}

export interface ProjectFeature {
  id: string;
  title: string;
  description: string;
}

export interface Project {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  client: string;
  duration: string;
  location: string;
  categories: string[];
  materials: string;
  lightControl: string;
  budgetRange: string;
  installationDetails: string;
  aboutProject: string;
  challenges: ProjectChallenge[];
  features: ProjectFeature[];
  heroImage: ProjectImage | null;
  gallery: ProjectImage[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
  } | null;
  projectStatus: "ongoing" | "completed";
  seo: {
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    noIndex: boolean;
  };
  status: "draft" | "published";
  publishedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const projectImageSchema = new Schema<ProjectImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    caption: { type: String, default: "" },
  },
  { _id: false },
);

const projectChallengeSchema = new Schema<ProjectChallenge>(
  {
    id: { type: String, required: true },
    challenge: { type: String, required: true },
    solution: { type: String, required: true },
  },
  { _id: false },
);

const projectFeatureSchema = new Schema<ProjectFeature>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false },
);

const testimonialSchema = new Schema(
  {
    quote: { type: String, required: true },
    author: { type: String, required: true },
    role: { type: String, required: true },
  },
  { _id: false },
);

const seoSchema = new Schema(
  {
    metaTitle: { type: String, default: "", trim: true, maxlength: 60 },
    metaDescription: { type: String, default: "", trim: true, maxlength: 160 },
    focusKeyword: { type: String, default: "", trim: true },
    noIndex: { type: Boolean, default: false },
  },
  { _id: false },
);

const projectSchema = new Schema<Project>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subtitle: { type: String, default: "", trim: true, maxlength: 300 },
    description: { type: String, default: "", trim: true },
    client: { type: String, default: "", trim: true },
    duration: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    categories: { type: [String], default: [] },
    materials: { type: String, default: "", trim: true },
    lightControl: { type: String, default: "", trim: true },
    budgetRange: { type: String, default: "", trim: true },
    installationDetails: { type: String, default: "", trim: true },
    aboutProject: { type: String, default: "", trim: true },
    challenges: { type: [projectChallengeSchema], default: [] },
    features: { type: [projectFeatureSchema], default: [] },
    heroImage: { type: projectImageSchema, default: null },
    gallery: { type: [projectImageSchema], default: [] },
    testimonial: { type: testimonialSchema, default: null },
    projectStatus: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
    seo: {
      type: seoSchema,
      default: {
        metaTitle: "",
        metaDescription: "",
        focusKeyword: "",
        noIndex: false,
      },
    },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

projectSchema.index({ status: 1, publishedAt: -1 });
projectSchema.index({ deletedAt: 1, publishedAt: -1 });
projectSchema.index({ categories: 1 });

export const ProjectModel: Model<Project> =
  (models.Project as Model<Project> | undefined) ??
  model<Project>("Project", projectSchema);
