import { unstable_cache } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { FALLBACK_PRODUCTS } from "@/lib/shop-data";
import { BlogPostModel } from "@/models/blog-post";
import { ProductModel } from "@/models/product";
import { ProjectModel } from "@/models/project";

// ---------------------------------------------------------------------------
// Types — only the fields the homepage cards actually render
// ---------------------------------------------------------------------------

export interface HomepageProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
}

export interface HomepageProject {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  image: string;
}

export interface HomepageBlog {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  imageUrl: string;
}

// ---------------------------------------------------------------------------
// Fallbacks — rendered if the database is unreachable
// ---------------------------------------------------------------------------

export const HOMEPAGE_FALLBACK_PRODUCTS: HomepageProduct[] =
  FALLBACK_PRODUCTS.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.images[0] ?? "/products/1.png",
  }));

export const HOMEPAGE_FALLBACK_PROJECTS: HomepageProject[] = [
  {
    id: "the-oak-residence",
    title: "The Oak Residence",
    slug: "oak-residence",
    subtitle: "Residential Lighting Design",
    image: "/projects/oak-residence.webp",
  },
  {
    id: "aurora-penthouse",
    title: "Aurora Penthouse",
    slug: "aurora-penthouse",
    subtitle: "Luxury Apartment Lighting",
    image: "/projects/aurora-penthouse.webp",
  },
  {
    id: "skyline-bedroom",
    title: "Skyline Bedroom",
    slug: "skyline-bedroom",
    subtitle: "Bedroom Lighting Design",
    image: "/projects/skyline-bedroom.webp",
  },
];

export const HOMEPAGE_FALLBACK_BLOGS: HomepageBlog[] = [
  {
    id: "fallback-pendant-light",
    title: "How to Choose the Perfect Pendant Light for Every Room",
    slug: "",
    summary:
      "Discover how size, placement and style can transform kitchens, dining areas and living spaces with the...",
    category: "INTERIOR DESIGN",
    imageUrl: "/blogs/1.webp",
  },
  {
    id: "fallback-lighting-mistakes",
    title: "7 Common Lighting Mistakes and How to Avoid Them",
    slug: "",
    summary:
      "From incorrect fixture sizing to poor layering, learn the most common lighting mistakes and simple...",
    category: "BUYING GUIDE",
    imageUrl: "/blogs/2.webp",
  },
  {
    id: "fallback-lighting-trends",
    title: "Top Modern Lighting Trends Transforming Homes in 2026",
    slug: "",
    summary:
      "Explore the latest trends in luxury lighting, warm ambient tones and statement fixtures that are...",
    category: "LIGHTING TRENDS",
    imageUrl: "/blogs/3.webp",
  },
];

// ---------------------------------------------------------------------------
// Products — flagged `isFeatured` first, then filled with recent products
// ---------------------------------------------------------------------------

const HOMEPAGE_PRODUCT_LIMIT = 6;

type ProductDoc = {
  _id: unknown;
  name: string;
  slug: string;
  priceRange?: { min?: number };
  images?: string[];
};

function mapProduct(doc: ProductDoc): HomepageProduct {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    price: doc.priceRange?.min ?? 0,
    image: doc.images?.[0] ?? "",
  };
}

async function fetchFeaturedProductsUncached(): Promise<HomepageProduct[]> {
  try {
    await connectToDatabase();

    const selection = "name slug priceRange images";

    const featured = (await ProductModel.find({
      isFeatured: true,
      status: "active",
      deletedAt: { $eq: null },
    })
      .select(selection)
      .sort({ updatedAt: -1 })
      .limit(HOMEPAGE_PRODUCT_LIMIT)
      .lean()) as unknown as ProductDoc[];

    let products = featured;

    // Top up with recent active products so the grid is never half-empty.
    if (products.length < HOMEPAGE_PRODUCT_LIMIT) {
      const seen = new Set(products.map((p) => String(p._id)));
      const fillers = (await ProductModel.find({
        status: "active",
        deletedAt: { $eq: null },
        _id: { $nin: Array.from(seen) },
      })
        .select(selection)
        .sort({ updatedAt: -1 })
        .limit(HOMEPAGE_PRODUCT_LIMIT - products.length)
        .lean()) as unknown as ProductDoc[];

      products = [...products, ...fillers];
    }

    // Empty catalog (not an error) — the section hides itself.
    if (products.length === 0) return [];

    return products.map(mapProduct);
  } catch (error) {
    console.warn("Failed to fetch featured products, using fallback:", error);
    return HOMEPAGE_FALLBACK_PRODUCTS;
  }
}

// ---------------------------------------------------------------------------
// Projects — published, featured first
// ---------------------------------------------------------------------------

const HOMEPAGE_PROJECT_LIMIT = 3;

type ProjectDoc = {
  _id: unknown;
  title: string;
  slug: string;
  subtitle?: string;
  categories?: string[];
  heroImage?: { url?: string } | null;
};

async function fetchHomepageProjectsUncached(): Promise<HomepageProject[]> {
  try {
    await connectToDatabase();

    const documents = (await ProjectModel.find({
      status: "published",
      deletedAt: null,
    })
      .select("title slug subtitle categories heroImage featured")
      .sort({ featured: -1, publishedAt: -1 })
      .limit(HOMEPAGE_PROJECT_LIMIT)
      .lean()) as unknown as ProjectDoc[];

    if (documents.length === 0) return [];

    return documents.map((doc) => ({
      id: String(doc._id),
      title: doc.title,
      slug: doc.slug,
      subtitle: doc.subtitle || doc.categories?.[0] || "Project",
      image: doc.heroImage?.url || "",
    }));
  } catch (error) {
    console.warn("Failed to fetch homepage projects, using fallback:", error);
    return HOMEPAGE_FALLBACK_PROJECTS;
  }
}

// ---------------------------------------------------------------------------
// Blogs — published, featured first
// ---------------------------------------------------------------------------

const HOMEPAGE_BLOG_LIMIT = 3;

type BlogDoc = {
  _id: unknown;
  title: string;
  slug: string;
  summary?: string;
  category?: string;
  heroImage?: { url?: string } | null;
};

async function fetchHomepageBlogsUncached(): Promise<HomepageBlog[]> {
  try {
    await connectToDatabase();

    const documents = (await BlogPostModel.find({
      status: "published",
      deletedAt: null,
    })
      .select("title slug summary category heroImage featured")
      .sort({ featured: -1, publishedAt: -1 })
      .limit(HOMEPAGE_BLOG_LIMIT)
      .lean()) as unknown as BlogDoc[];

    if (documents.length === 0) return [];

    return documents.map((doc) => ({
      id: String(doc._id),
      title: doc.title,
      slug: doc.slug,
      summary: doc.summary || "",
      category: doc.category || "",
      imageUrl: doc.heroImage?.url || "",
    }));
  } catch (error) {
    console.warn("Failed to fetch homepage blogs, using fallback:", error);
    return HOMEPAGE_FALLBACK_BLOGS;
  }
}

// ---------------------------------------------------------------------------
// Cached exports
//
// Cache tags intentionally match the tags your existing mutations already
// fire, so no admin/revalidation code has to change:
//   products -> revalidateTag("homepage")   (product-actions.ts)
//   projects -> updateTag("projects")       (projects/actions.ts)
//   blogs    -> updateTag("blog-posts")     (blog/actions.ts)
// ---------------------------------------------------------------------------

export const fetchFeaturedProducts = unstable_cache(
  fetchFeaturedProductsUncached,
  ["homepage-products"],
  { tags: ["homepage"], revalidate: 1800 },
);

export const fetchHomepageProjects = unstable_cache(
  fetchHomepageProjectsUncached,
  ["homepage-projects"],
  { tags: ["projects"], revalidate: 1800 },
);

export const fetchHomepageBlogs = unstable_cache(
  fetchHomepageBlogsUncached,
  ["homepage-blogs"],
  { tags: ["blog-posts"], revalidate: 1800 },
);
