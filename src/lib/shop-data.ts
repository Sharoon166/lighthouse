import { unstable_cache } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { CategoryModel } from "@/models/category";
import { ProductModel } from "@/models/product";

const COLOR_NAME_TO_HEX: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Gray: "#6B7280",
  Silver: "#C0C0C0",
  Chrome: "#D9D9D9",
  Gold: "#D4AF37",
  Brass: "#B5A642",
  Bronze: "#CD7F32",
  Copper: "#B87333",
  Nickel: "#A8A9AD",
  Brown: "#795548",
  Beige: "#D6C6A8",
};

export interface ShopCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  designsCount: number;
  featured: boolean;
}

export interface ShopProductVariant {
  id: string;
  sku: string;
  title: string;
  attributes: Record<string, string>;
  colorHex: string;
  price: number;
  salePrice?: number;
  images: string[];
  stock: number;
  availability: "in_stock" | "out_of_stock" | "preorder" | "backorder";
  isDefault: boolean;
}

export interface ShopProductItem {
  id: string;
  name: string;
  slug: string;
  tag: string;
  categoryName: string;
  categorySlug: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  shortDescription: string;
  description: string;
  images: string[]; // Includes main product + all variant images
  finishes: { name: string; hex: string }[];
  variantAttributes: string[];
  variants: ShopProductVariant[];
  ratings: {
    average: number;
    count: number;
    distribution: { stars: number; count: number }[];
  };
  reviews: {
    id: string;
    author: string;
    date: string;
    rating: number;
    comment: string;
  }[];
  content: {
    materialsAndCare: string;
    shippingAndReturns: string;
    payment: string;
    installationAndBulbs: string;
  };
  specifications: { key: string; value: string }[];
  designStyle: string;
  material: string;
  inStock: boolean;
  seo: {
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    noIndex: boolean;
  };
}

export const FALLBACK_CATEGORIES: ShopCategoryItem[] = [
  {
    id: "pendant-lights",
    name: "Pendant Lights",
    slug: "pendant-lights",
    description:
      "Suspended statement fixtures designed to elevate dining tables and kitchen islands.",
    image: "/1.png",
    designsCount: 42,
    featured: false,
  },
  {
    id: "wall-lights",
    name: "Wall Light",
    slug: "wall-lights",
    description: "Elegant sconces providing warm ambient up and down lighting.",
    image: "/3.png",
    designsCount: 29,
    featured: false,
  },
  {
    id: "chandeliers",
    name: "Chandeliers",
    slug: "chandeliers",
    description:
      "Intricate multi-light centerpiece lighting for grand rooms and foyers.",
    image: "/4.png",
    designsCount: 19,
    featured: false,
  },
  {
    id: "floor-lamp",
    name: "Floor Lamp",
    slug: "floor-lamp",
    description:
      "Versatile standing lamps for cozy reading corners and living rooms.",
    image: "/2.png",
    designsCount: 41,
    featured: false,
  },
  {
    id: "desk-lamp",
    name: "Desk Lamp",
    slug: "desk-lamp",
    description: "Precision task lighting with warm LED illumination.",
    image: "/products/1.png",
    designsCount: 18,
    featured: false,
  },
  {
    id: "ceiling-lights",
    name: "Ceiling Lights",
    slug: "ceiling-lights",
    description:
      "Flush and semi-flush mounted architectural overhead fixtures.",
    image: "/products/2.png",
    designsCount: 32,
    featured: false,
  },
  {
    id: "table-lamps",
    name: "Table Lamps",
    slug: "table-lamps",
    description:
      "Accent lighting designed for nightstands, consoles, and desks.",
    image: "/products/3.png",
    designsCount: 24,
    featured: false,
  },
  {
    id: "outdoor-lights",
    name: "Outdoor Lights",
    slug: "outdoor-lights",
    description:
      "Weather-resistant fixtures for gardens, gates, and patio spaces.",
    image: "/projects/oak-residence.png",
    designsCount: 16,
    featured: false,
  },
  {
    id: "commercial-lights",
    name: "Commercial Lights",
    slug: "commercial-lights",
    description:
      "High-performance illumination tailored for offices, retail, and hospitality.",
    image: "/projects/aurora-penthouse.png",
    designsCount: 35,
    featured: false,
  },
  {
    id: "spot-lights",
    name: "Spot Lights",
    slug: "spot-lights",
    description:
      "Directional accent lights to highlight art and architectural details.",
    image: "/projects/skyline-bedroom.png",
    designsCount: 22,
    featured: false,
  },
  {
    id: "track-lights",
    name: "Track Lights",
    slug: "track-lights",
    description: "Flexible track systems for customizable spotlighting.",
    image: "/blogs/1.png",
    designsCount: 15,
    featured: false,
  },
  {
    id: "architectural-lighting",
    name: "Architectural Lighting",
    slug: "architectural-lighting",
    description: "Seamlessly integrated linear and cove lighting solutions.",
    image: "/blogs/2.png",
    designsCount: 12,
    featured: false,
  },
  {
    id: "linear-lights",
    name: "Linear Lights",
    slug: "linear-lights",
    description:
      "Minimalist continuous light bars ideal for offices and kitchen spaces.",
    image: "/blogs/3.png",
    designsCount: 10,
    featured: false,
  },
];

export const FALLBACK_PRODUCTS: ShopProductItem[] = [
  {
    id: "aurora-brass-desk-lamp",
    name: "Aurora Brass Desk Lamp",
    slug: "aurora-brass-desk-lamp",
    tag: "DESK LAMP / TASK LIGHTING",
    categoryName: "Desk Lamp",
    categorySlug: "desk-lamp",
    price: 18900,
    originalPrice: 21000,
    discountPercentage: 10,
    shortDescription:
      "A refined desk lamp combining solid brass construction with a warm ambient glow, crafted for reading nooks and study spaces.",
    description:
      "The Aurora Brass Desk Lamp brings timeless elegance and focused functionality to your workspace. Crafted with precision-machined solid brass, it features a fluid adjustable neck and a softly flared dome shade that casts a glare-free warm beam. Perfect for executive desks, nightstands, or library nooks.",
    images: [
      "/products/1.png",
      "/products/2.png",
      "/products/3.png",
      "/products/4.png",
    ],
    finishes: [
      { name: "Brass", hex: "#D4AF37" },
      { name: "Black", hex: "#1A1A1A" },
      { name: "Silver", hex: "#C0C0C0" },
    ],
    variantAttributes: ["finish"],
    variants: [
      {
        id: "v1",
        sku: "ABL-BRASS",
        title: "Brass",
        attributes: { finish: "Brass" },
        colorHex: "#B5A642",
        price: 21000,
        salePrice: 18900,
        images: [],
        stock: 15,
        availability: "in_stock",
        isDefault: true,
      },
      {
        id: "v2",
        sku: "ABL-BLACK",
        title: "Black",
        attributes: { finish: "Black" },
        colorHex: "#000000",
        price: 21000,
        salePrice: 18900,
        images: [],
        stock: 8,
        availability: "in_stock",
        isDefault: false,
      },
      {
        id: "v3",
        sku: "ABL-SILVER",
        title: "Silver",
        attributes: { finish: "Silver" },
        colorHex: "#C0C0C0",
        price: 21000,
        salePrice: 18900,
        images: [],
        stock: 5,
        availability: "in_stock",
        isDefault: false,
      },
    ],
    ratings: {
      average: 4.8,
      count: 24,
      distribution: [
        { stars: 5, count: 19 },
        { stars: 4, count: 4 },
        { stars: 3, count: 1 },
        { stars: 2, count: 1 },
        { stars: 1, count: 1 },
      ],
    },
    reviews: [
      {
        id: "r1",
        author: "Sana M.",
        date: "June 2026",
        rating: 5,
        comment:
          "Absolutely stunning piece. The brass finish is exactly as shown and the light quality is warm and inviting. Very happy with the purchase.",
      },
      {
        id: "r2",
        author: "Bilal K.",
        date: "May 2026",
        rating: 5,
        comment:
          "Exceptional quality. Our interior designer recommended Light House and this lamp is the centerpiece of our living room now.",
      },
      {
        id: "r3",
        author: "Nadia R.",
        date: "April 2026",
        rating: 4,
        comment:
          "Beautiful lamp, arrived well-packaged. Delivery was quick too. Took one star off only because the shade was slightly off-center — easily adjusted.",
      },
    ],
    content: {
      materialsAndCare:
        "Materials: solid brass body, premium linen shade, marble accent base. All brass surfaces are hand-finished and lacquered to prevent tarnishing.\n\nCare: wipe with a soft, dry cloth. Avoid moisture, direct sunlight, and harsh cleaning agents to preserve the natural finish and appearance.",
      shippingAndReturns:
        "Standard delivery: 3–5 business days within Karachi. Nationwide delivery: 5–8 business days. Free shipping on orders above Rs. 20,000.\n\nReturns accepted within 7 days of delivery. Item must be unused and in original packaging.",
      payment:
        "We accept all major debit and credit cards, EasyPaisa, JazzCash, and bank transfers. Cash on delivery available in Karachi and Lahore.\n\nInstallment plans available via Bank Alfalah and Meezan Bank for orders above Rs. 25,000.",
      installationAndBulbs:
        "No installation required — simply plug in and use. Takes a standard E27 bulb (not included). We recommend a 10W warm white LED at 2700K for the ideal ambience.",
    },
    specifications: [
      { key: "Dimensions", value: '18" H x 12" W x 8" D' },
      { key: "Material", value: "Solid Brass & White Linen" },
      { key: "Bulb Base", value: "E27 Standard (Max 40W)" },
      { key: "Voltage", value: "220V - 240V AC" },
      { key: "Cord Length", value: "1.8 meters woven fabric cable" },
      { key: "Switch Type", value: "Inline toggle switch on cord" },
      { key: "Warranty", value: "2 Years electrical warranty" },
    ],
    designStyle: "Modern",
    material: "Brass",
    inStock: true,
    seo: {
      metaTitle: "Aurora Brass Desk Lamp | Lighthouse",
      metaDescription:
        "A refined desk lamp combining solid brass construction with a warm ambient glow.",
      focusKeyword: "brass desk lamp",
      noIndex: false,
    },
  },
  {
    id: "marble-aura-table-lamp",
    name: "Marble Aura Table Lamp",
    slug: "marble-aura-table-lamp",
    tag: "TABLE LAMP / ACCENT LIGHTING",
    categoryName: "Table Lamps",
    categorySlug: "table-lamps",
    price: 16900,
    shortDescription:
      "Hand-carved Italian marble pedestal with an etched globe glass shade.",
    description:
      "The Marble Aura Table Lamp showcases a solid marble base topped with a frosted glass sphere that emits a continuous 360-degree halo of soft light.",
    images: ["/products/2.png", "/products/1.png", "/products/3.png"],
    finishes: [
      { name: "White Marble", hex: "#F5F5F0" },
      { name: "Black Marble", hex: "#222222" },
    ],
    variantAttributes: ["finish"],
    variants: [
      {
        id: "ma-v1",
        sku: "MA-WHITE",
        title: "White Marble",
        attributes: { finish: "White Marble" },
        colorHex: "#F5F5F0",
        price: 16900,
        images: [],
        stock: 12,
        availability: "in_stock",
        isDefault: true,
      },
      {
        id: "ma-v2",
        sku: "MA-BLACK",
        title: "Black Marble",
        attributes: { finish: "Black Marble" },
        colorHex: "#222222",
        price: 17900,
        images: [],
        stock: 6,
        availability: "in_stock",
        isDefault: false,
      },
    ],
    ratings: {
      average: 4.9,
      count: 18,
      distribution: [
        { stars: 5, count: 16 },
        { stars: 4, count: 2 },
        { stars: 3, count: 0 },
        { stars: 2, count: 0 },
        { stars: 1, count: 0 },
      ],
    },
    reviews: [],
    content: {
      materialsAndCare:
        "Hand-carved Carrara marble base with blown glass globe.",
      shippingAndReturns: "Ships in 3-5 business days across Pakistan.",
      payment: "All major credit cards, JazzCash, EasyPaisa, COD.",
      installationAndBulbs: "Requires 1x G9 LED bulb (included).",
    },
    specifications: [
      { key: "Dimensions", value: '14" H x 9" W' },
      { key: "Material", value: "Carrara Marble & Glass" },
      { key: "Bulb Base", value: "G9 LED" },
    ],
    designStyle: "Art Deco",
    material: "Ceramic",
    inStock: true,
    seo: {
      metaTitle: "Marble Aura Table Lamp | Lighthouse",
      metaDescription:
        "Hand-carved Italian marble pedestal with an etched globe glass shade.",
      focusKeyword: "marble table lamp",
      noIndex: false,
    },
  },
  {
    id: "luna-arc-floor-lamp",
    name: "Luna Arc Floor Lamp",
    slug: "luna-arc-floor-lamp",
    tag: "FLOOR LAMP / STANDING LIGHTING",
    categoryName: "Floor Lamp",
    categorySlug: "floor-lamp",
    price: 28900,
    shortDescription:
      "Sweeping brass arch with an oversized dome shade for living room lounge seating.",
    description:
      "Graceful proportions and architectural height make the Luna Arc Floor Lamp an understated statement fixture for spacious living rooms.",
    images: ["/products/3.png", "/products/4.png", "/products/1.png"],
    finishes: [
      { name: "Brass", hex: "#D4AF37" },
      { name: "Matte Black", hex: "#1A1A1A" },
    ],
    variantAttributes: ["finish"],
    variants: [
      {
        id: "la-v1",
        sku: "LA-BRASS",
        title: "Brass",
        attributes: { finish: "Brass" },
        colorHex: "#D4AF37",
        price: 28900,
        images: [],
        stock: 9,
        availability: "in_stock",
        isDefault: true,
      },
      {
        id: "la-v2",
        sku: "LA-BLACK",
        title: "Matte Black",
        attributes: { finish: "Matte Black" },
        colorHex: "#1A1A1A",
        price: 29900,
        images: [],
        stock: 4,
        availability: "in_stock",
        isDefault: false,
      },
    ],
    ratings: {
      average: 4.7,
      count: 14,
      distribution: [
        { stars: 5, count: 11 },
        { stars: 4, count: 3 },
      ],
    },
    reviews: [],
    content: {
      materialsAndCare:
        "Heavy steel weighted base with hand-brushed brass finish.",
      shippingAndReturns: "Delivery within 5 business days nationwide.",
      payment: "Credit Card, COD in Karachi & Lahore.",
      installationAndBulbs: "Simple assembly required. Takes E27 bulb.",
    },
    specifications: [
      { key: "Dimensions", value: '72" H x 42" Span' },
      { key: "Material", value: "Steel & Brass" },
    ],
    designStyle: "Nordic",
    material: "Steel",
    inStock: true,
    seo: {
      metaTitle: "Luna Arc Floor Lamp | Lighthouse",
      metaDescription:
        "Sweeping arc floor lamp with a minimalist Nordic silhouette.",
      focusKeyword: "arc floor lamp",
      noIndex: false,
    },
  },
  {
    id: "elysian-feather-floor-lamp",
    name: "Elysian Feather Floor Lamp",
    slug: "elysian-feather-floor-lamp",
    tag: "FLOOR LAMP / LUXURY",
    categoryName: "Floor Lamp",
    categorySlug: "floor-lamp",
    price: 34900,
    shortDescription:
      "Dramatic gold palm structure adorned with natural ostrich plume feathers.",
    description:
      "Elysian Feather Floor Lamp combines organic glamour with gentle ambient illumination.",
    images: ["/products/4.png", "/products/1.png", "/products/2.png"],
    finishes: [{ name: "Gold", hex: "#D4AF37" }],
    variantAttributes: ["finish"],
    variants: [
      {
        id: "ef-v1",
        sku: "EF-GOLD",
        title: "Gold",
        attributes: { finish: "Gold" },
        colorHex: "#D4AF37",
        price: 34900,
        images: [],
        stock: 3,
        availability: "in_stock",
        isDefault: true,
      },
    ],
    ratings: {
      average: 5.0,
      count: 9,
      distribution: [{ stars: 5, count: 9 }],
    },
    reviews: [],
    content: {
      materialsAndCare:
        "Natural ethically sourced ostrich feathers and brass electroplated tripod.",
      shippingAndReturns: "Specialist shipping within 7 business days.",
      payment: "Bank Transfer, Credit Card.",
      installationAndBulbs: "Bulbs included.",
    },
    specifications: [
      { key: "Dimensions", value: '68" H x 36" W' },
      { key: "Material", value: "Brass & Plumes" },
    ],
    designStyle: "Art Deco",
    material: "Brass",
    inStock: true,
    seo: {
      metaTitle: "Elysian Feather Floor Lamp | Lighthouse",
      metaDescription:
        "Luxury Art Deco floor lamp with feather-inspired brass design.",
      focusKeyword: "luxury floor lamp",
      noIndex: false,
    },
  },
  {
    id: "crystal-bloom-table-lamp",
    name: "Crystal Bloom Table Lamp",
    slug: "crystal-bloom-table-lamp",
    tag: "TABLE LAMP / CRYSTAL",
    categoryName: "Table Lamps",
    categorySlug: "table-lamps",
    price: 22900,
    shortDescription:
      "Facet-cut K9 crystal base with gold leaf details and a pleated silk shade.",
    description:
      "Casts delicate prismatic refractions across your space when illuminated.",
    images: ["/products/5.png", "/products/2.png", "/products/3.png"],
    finishes: [{ name: "Gold & Crystal", hex: "#E5C158" }],
    variantAttributes: ["finish"],
    variants: [
      {
        id: "ob-v1",
        sku: "OB-GOLDCRYSTAL",
        title: "Gold & Crystal",
        attributes: { finish: "Gold & Crystal" },
        colorHex: "#E5C158",
        price: 22900,
        images: [],
        stock: 7,
        availability: "in_stock",
        isDefault: true,
      },
    ],
    ratings: {
      average: 4.8,
      count: 12,
      distribution: [
        { stars: 5, count: 10 },
        { stars: 4, count: 2 },
      ],
    },
    reviews: [],
    content: {
      materialsAndCare: "K9 optic crystal and gold-plated alloy base.",
      shippingAndReturns: "3-5 business days nationwide.",
      payment: "All methods accepted.",
      installationAndBulbs: "E27 max 60W.",
    },
    specifications: [
      { key: "Dimensions", value: '22" H x 14" W' },
      { key: "Material", value: "Hand-blown Glass" },
    ],
    designStyle: "Industrial",
    material: "Hand-blown Glass",
    inStock: true,
    seo: {
      metaTitle: "Crystal Bloom Table Lamp | Lighthouse",
      metaDescription:
        "Industrial crystal table lamp with hand-blown glass shade.",
      focusKeyword: "crystal table lamp",
      noIndex: false,
    },
  },
  {
    id: "globe-marble-floor-lamp",
    name: "Globe Marble Floor Lamp",
    slug: "globe-marble-floor-lamp",
    tag: "FLOOR LAMP / MODERN",
    categoryName: "Floor Lamp",
    categorySlug: "floor-lamp",
    price: 31900,
    shortDescription:
      "Minimalist brass rod mounted on a heavy Nero Marquina black marble base.",
    description:
      "Clean geometric symmetry providing versatile reading and mood lighting.",
    images: ["/products/6.png", "/products/1.png", "/products/4.png"],
    finishes: [{ name: "Brass & Black Marble", hex: "#1F1F1F" }],
    variantAttributes: ["finish"],
    variants: [
      {
        id: "gm-v1",
        sku: "GM-BRASSMARBLE",
        title: "Brass & Black Marble",
        attributes: { finish: "Brass & Black Marble" },
        colorHex: "#1F1F1F",
        price: 31900,
        images: [],
        stock: 5,
        availability: "in_stock",
        isDefault: true,
      },
    ],
    ratings: {
      average: 4.6,
      count: 8,
      distribution: [
        { stars: 5, count: 6 },
        { stars: 4, count: 2 },
      ],
    },
    reviews: [],
    content: {
      materialsAndCare: "Natural marble and solid brass.",
      shippingAndReturns: "Ships in 3-5 days.",
      payment: "Cards, COD, Installments.",
      installationAndBulbs: "Plug-and-play.",
    },
    specifications: [
      { key: "Dimensions", value: '62" H x 12" W' },
      { key: "Material", value: "Brass & Marble" },
    ],
    designStyle: "Rustic",
    material: "Wood",
    inStock: true,
    seo: {
      metaTitle: "Globe Marble Floor Lamp | Lighthouse",
      metaDescription:
        "Rustic floor lamp with globe marble shade and wood base.",
      focusKeyword: "marble floor lamp",
      noIndex: false,
    },
  },
];

export async function fetchStoreCategories(): Promise<ShopCategoryItem[]> {
  try {
    await connectToDatabase();
    const categoriesFromDb = await CategoryModel.find({
      isActive: true,
    }).lean();

    if (categoriesFromDb && categoriesFromDb.length > 0) {
      // Single aggregation to count active products per category slug
      const counts = await ProductModel.aggregate([
        {
          $match: {
            status: "active",
            deletedAt: null,
          },
        },
        {
          $group: {
            _id: "$category.slug",
            count: { $sum: 1 },
          },
        },
      ]);

      const countMap = new Map<string, number>();
      for (const entry of counts) {
        countMap.set(entry._id, entry.count);
      }

      return categoriesFromDb.map((c) => ({
        id: String(c._id),
        name: c.name,
        slug: c.slug,
        description: c.description || "Curated decorative lighting collection.",
        image: c.image || "/1.png",
        designsCount: countMap.get(c.slug) ?? 0,
        featured: Boolean(c.featured),
      }));
    }
  } catch (error) {
    console.warn(
      "MongoDB query failed for categories, falling back to mock data:",
      error,
    );
  }
  return FALLBACK_CATEGORIES;
}

export interface HomepageCategory {
  id: string;
  title: string;
  slug: string;
  href: string;
  items: number;
}

const HOMEPAGE_CATEGORY_SLUGS = [
  "pendant-lights",
  "floor-lamps",
  "wall-lights",
  "chandeliers",
];

const HOMEPAGE_FALLBACK_CATEGORIES: HomepageCategory[] = [
  {
    id: "pendant-lights",
    title: "Pendant Lights",
    slug: "pendant-lights",
    href: "/categories/pendant-lights",
    items: 69,
  },
  {
    id: "floor-lamps",
    title: "Floor Lamps",
    slug: "floor-lamps",
    href: "/categories/floor-lamps",
    items: 41,
  },
  {
    id: "wall-lights",
    title: "Wall lights",
    slug: "wall-lights",
    href: "/categories/wall-lights",
    items: 29,
  },
  {
    id: "chandeliers",
    title: "Chandeliers",
    slug: "chandeliers",
    href: "/categories/chandeliers",
    items: 19,
  },
];

async function fetchHomepageCategoriesUncached(): Promise<HomepageCategory[]> {
  try {
    await connectToDatabase();

    const categories = await CategoryModel.find({
      slug: { $in: HOMEPAGE_CATEGORY_SLUGS },
      isActive: true,
    }).lean();

    if (categories.length !== HOMEPAGE_CATEGORY_SLUGS.length) {
      return HOMEPAGE_FALLBACK_CATEGORIES;
    }

    const counts = await ProductModel.aggregate([
      { $match: { status: "active", deletedAt: null } },
      { $group: { _id: "$category.slug", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    for (const entry of counts) {
      countMap.set(entry._id, entry.count);
    }

    const categoryMap = new Map(categories.map((c) => [c.slug, c]));

    return HOMEPAGE_CATEGORY_SLUGS.map((slug) => {
      const c = categoryMap.get(slug)!;
      return {
        id: c.slug,
        title: c.name,
        slug: c.slug,
        href: `/categories/${c.slug}`,
        items: countMap.get(c.slug) ?? 0,
      };
    });
  } catch (error) {
    console.warn("Failed to fetch homepage categories, using fallback:", error);
    return HOMEPAGE_FALLBACK_CATEGORIES;
  }
}

export const fetchHomepageCategories = unstable_cache(
  fetchHomepageCategoriesUncached,
  ["homepage-categories"],
  { tags: ["homepage"], revalidate: 1800 },
);

export interface FilterMetadata {
  categories: { name: string; slug: string; count: number }[];
  brands: { name: string; slug: string; logo: string; count: number }[];
  priceRange: { min: number; max: number };
}

export async function fetchFilterMetadata(): Promise<FilterMetadata> {
  const meta: FilterMetadata = {
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 200000 },
  };

  try {
    await connectToDatabase();

    const [categories, brandAgg, priceAgg] = await Promise.all([
      CategoryModel.find({ isActive: true })
        .select({ name: 1, slug: 1, productCount: 1 })
        .lean(),
      (ProductModel as any).aggregate([
        { $match: { status: { $ne: "archived" }, deletedAt: { $eq: null } } },
        {
          $group: {
            _id: {
              name: "$brand.name",
              slug: "$brand.slug",
              logo: "$brand.logo",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      ProductModel.aggregate([
        { $match: { status: { $ne: "archived" }, deletedAt: { $eq: null } } },
        {
          $group: {
            _id: null,
            min: { $min: "$priceRange.min" },
            max: { $max: "$priceRange.max" },
          },
        },
      ]),
    ]);

    meta.categories = categories.map((c) => ({
      name: c.name,
      slug: c.slug,
      count: c.productCount || 0,
    }));

    meta.brands = brandAgg
      .filter((b: any) => b._id?.name)
      .map((b: any) => ({
        name: b._id.name,
        slug: b._id.slug || "",
        logo: b._id.logo || "",
        count: b.count,
      }));

    if (priceAgg[0]) {
      meta.priceRange = {
        min: priceAgg[0].min || 0,
        max: priceAgg[0].max || 200000,
      };
    }
  } catch (error) {
    console.warn("Failed to fetch filter metadata:", error);
  }

  return meta;
}

export interface FetchProductsOptions {
  categorySlug?: string;
  brandSlug?: string;
  search?: string;
  designStyle?: string[];
  material?: string[];
  priceRange?: string[];
  sortBy?: "featured" | "price_asc" | "price_desc" | "newest";
}

export async function fetchStoreProducts(
  options: FetchProductsOptions = {},
): Promise<{ products: ShopProductItem[]; total: number }> {
  let products: ShopProductItem[] = [];

  try {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      status: { $ne: "archived" },
      deletedAt: { $eq: null },
    };
    if (options.categorySlug && options.categorySlug !== "all") {
      query["category.slug"] = options.categorySlug;
    }
    if (options.brandSlug && options.brandSlug !== "all") {
      query["brand.slug"] = options.brandSlug;
    }
    if (options.search) {
      query.name = { $regex: options.search, $options: "i" };
    }

    const dbProducts = await ProductModel.find(query).lean();
    if (dbProducts && dbProducts.length > 0) {
      products = dbProducts.map((p) => {
        const minPrice = p.priceRange?.min || 15000;
        const defaultVar = p.variants?.[0];
        const origPrice =
          defaultVar?.price && defaultVar?.salePrice
            ? defaultVar.price
            : undefined;

        // Map real variants from MongoDB
        const variants: ShopProductVariant[] = (p.variants || [])
          .filter((v) => v.isActive)
          .map((v) => ({
            id: String(v._id),
            sku: v.sku,
            title: v.title,
            attributes:
              v.attributes instanceof Map
                ? Object.fromEntries(v.attributes)
                : (v.attributes as Record<string, string>) || {},
            colorHex: v.colorHex || "",
            price: v.salePrice || v.price,
            salePrice:
              v.salePrice && v.salePrice < v.price ? v.salePrice : undefined,
            images: v.images?.length ? v.images : [],
            stock: v.stock,
            availability: v.availability,
            isDefault: v.isDefault,
          }));

        // Combine main product images with all variant images (remove duplicates)
        const allProductImages = [
          ...(p.images || []),
          ...variants.flatMap((v) => v.images || []),
        ];
        const uniqueImages = Array.from(new Set(allProductImages));

        // Extract finish options from variant attributes
        const variantAttributes = p.variantAttributes || [];
        const finishAttrKey = variantAttributes.find((key) =>
          ["finish", "color", "colour"].includes(key.toLowerCase()),
        );
        const finishes: { name: string; hex: string }[] = [];
        if (finishAttrKey && variants.length > 0) {
          const seen = new Set<string>();
          for (const v of variants) {
            const val = v.attributes[finishAttrKey];
            if (val && !seen.has(val)) {
              seen.add(val);
              finishes.push({
                name: val,
                hex: v.colorHex || COLOR_NAME_TO_HEX[val] || "#888888",
              });
            }
          }
        }
        // Fallback finishes if none extracted
        if (finishes.length === 0) {
          finishes.push(
            { name: "Brass", hex: COLOR_NAME_TO_HEX["Brass"] },
            { name: "Black", hex: COLOR_NAME_TO_HEX["Black"] },
          );
        }

        return {
          id: String(p._id),
          name: p.name,
          slug: p.slug,
          tag: `${p.category?.name?.toUpperCase() || "LIGHTING"} / DECORATIVE`,
          categoryName: p.category?.name || "Pendant Lights",
          categorySlug: p.category?.slug || "pendant-lights",
          price: minPrice,
          originalPrice: origPrice,
          discountPercentage: origPrice
            ? Math.round(((origPrice - minPrice) / origPrice) * 100)
            : undefined,
          shortDescription:
            p.shortDescription || p.description?.slice(0, 120) || "",
          description: p.description || "",
          images: uniqueImages.length ? uniqueImages : ["/products/1.png"],
          finishes,
          variantAttributes,
          variants,
          ratings: p.ratings?.count
            ? {
                average: p.ratings.average || 4.8,
                count: p.ratings.count || 12,
                distribution: [
                  {
                    stars: 5,
                    count: Math.round((p.ratings.count || 12) * 0.8),
                  },
                  {
                    stars: 4,
                    count: Math.round((p.ratings.count || 12) * 0.2),
                  },
                ],
              }
            : {
                average: 4.8,
                count: 15,
                distribution: [
                  { stars: 5, count: 12 },
                  { stars: 4, count: 3 },
                ],
              },
          reviews: [],
          content: {
            materialsAndCare:
              p.content?.materialsAndCare || "Solid brass construction.",
            shippingAndReturns:
              p.content?.shippingAndReturns || "Delivery in 3-5 business days.",
            payment: p.content?.payment || "All major credit cards accepted.",
            installationAndBulbs:
              p.content?.installationAndBulbs || "Standard E27 fitting.",
          },
          specifications: p.specifications || [
            { key: "Brand", value: p.brand?.name || "Lighthouse" },
          ],
          designStyle: "Modern",
          material: "Brass",
          inStock: p.inStock ?? true,
          seo: {
            metaTitle: p.seo?.metaTitle || "",
            metaDescription: p.seo?.metaDescription || "",
            focusKeyword: p.seo?.focusKeyword || "",
            noIndex: p.seo?.noIndex ?? false,
          },
        };
      });
    }
  } catch (error) {
    console.warn("MongoDB product query failed, using fallback items:", error);
  }

  // Filter in memory for search/category/price/material/design
  if (options.categorySlug && options.categorySlug !== "all") {
    products = products.filter(
      (p) =>
        p.categorySlug.toLowerCase() === options.categorySlug?.toLowerCase(),
    );
  }

  if (options.search) {
    const q = options.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q),
    );
  }

  if (options.material && options.material.length > 0) {
    products = products.filter((p) =>
      options.material!.some(
        (m) => p.material.toLowerCase() === m.toLowerCase(),
      ),
    );
  }

  if (options.designStyle && options.designStyle.length > 0) {
    products = products.filter((p) =>
      options.designStyle!.some(
        (d) => p.designStyle.toLowerCase() === d.toLowerCase(),
      ),
    );
  }

  if (options.priceRange && options.priceRange.length > 0) {
    products = products.filter((p) => {
      return options.priceRange!.some((range) => {
        if (range === "under-10k") return p.price < 10000;
        if (range === "10k-25k") return p.price >= 10000 && p.price <= 25000;
        if (range === "25k-50k") return p.price >= 25000 && p.price <= 50000;
        if (range === "50k-100k") return p.price >= 50000 && p.price <= 100000;
        if (range === "100k-plus") return p.price > 100000;
        return true;
      });
    });
  }

  // Sort
  if (options.sortBy === "price_asc") {
    products.sort((a, b) => a.price - b.price);
  } else if (options.sortBy === "price_desc") {
    products.sort((a, b) => b.price - a.price);
  }

  return { products, total: products.length };
}

export async function fetchProductBySlug(
  slug: string,
): Promise<ShopProductItem | null> {
  const { products } = await fetchStoreProducts();
  const found = products.find((p) => p.slug === slug);
  return found || null;
}
