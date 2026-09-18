import type { Metadata } from "next";

const SITE_NAME = "Lighthouse";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lighthouse.pk";

export interface SeoMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "product";
  noIndex?: boolean;
  keywords?: string[];
  publishedAt?: string;
  updatedAt?: string;
}

export function generateSeoMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  noIndex = false,
  keywords = [],
  publishedAt,
  updatedAt,
}: SeoMetadataInput): Metadata {
  const url = `${siteUrl}${path}`;
  const ogImage = image || `${siteUrl}/og-image.png`;

  return {
    title,
    description,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      // type: type as "website" | "article",
      ...(publishedAt ? { publishedTime: publishedAt } : {}),
      ...(updatedAt ? { modifiedTime: updatedAt } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
    ...(keywords.length > 0 ? { keywords } : {}),
  };
}

interface ProductJsonLdVariant {
  sku: string;
  name: string;
  price: number;
  salePrice?: number;
  images: string[];
  availability: "in_stock" | "out_of_stock" | "preorder" | "backorder";
  attributes: Record<string, string>;
}

export function generateProductJsonLd(product: {
  name: string;
  description: string;
  slug: string;
  image: string;
  currency: string;
  brand: string;
  category: string;
  variants: ProductJsonLdVariant[];
  rating?: number;
  ratingCount?: number;
}) {
  const productUrl = `${siteUrl}/products/${product.slug}`;

  const availabilityMap: Record<string, string> = {
    in_stock: "https://schema.org/InStock",
    out_of_stock: "https://schema.org/OutOfStock",
    preorder: "https://schema.org/PreOrder",
    backorder: "https://schema.org/BackOrder",
  };

  // Single variant or no variants → plain Product
  if (product.variants.length <= 1) {
    const v = product.variants[0];
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: v?.images?.length ? v.images : [product.image],
      sku: v?.sku || product.slug,
      brand: { "@type": "Brand", name: product.brand },
      category: product.category,
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: product.currency,
        price: v?.salePrice || v?.price || 0,
        availability: availabilityMap[v?.availability || "in_stock"],
      },
      ...(product.rating && product.ratingCount
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.ratingCount,
            },
          }
        : {}),
    };
  }

  // Multiple variants → ProductGroup with hasVariant
  const hasVariant = product.variants.map((v) => ({
    "@type": "Product" as const,
    name: `${product.name} — ${Object.entries(v.attributes)
      .map(([, val]) => val)
      .join(", ")}`,
    image: v.images.length ? v.images : [product.image],
    sku: v.sku,
    additionalProperty: Object.entries(v.attributes).map(
      ([key, val]) => ({
        "@type": "PropertyValue" as const,
        name: key,
        value: val,
      }),
    ),
    offers: {
      "@type": "Offer" as const,
      url: productUrl,
      priceCurrency: product.currency,
      price: v.salePrice || v.price,
      availability: availabilityMap[v.availability] || availabilityMap.in_stock,
    },
  }));

  // Collect all unique attribute keys for variesBy
  const variesByKeys = new Set<string>();
  for (const v of product.variants) {
    for (const key of Object.keys(v.attributes)) {
      variesByKeys.add(key);
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    productGroupID: product.slug,
    variesBy: Array.from(variesByKeys).map(
      (key) => `https://schema.org/${key.toLowerCase()}`,
    ),
    hasVariant,
    ...(product.rating && product.ratingCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.ratingCount,
          },
        }
      : {}),
  };
}
