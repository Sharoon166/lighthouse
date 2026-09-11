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
      type: type as "website" | "article",
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

export function generateProductJsonLd(product: {
  name: string;
  description: string;
  slug: string;
  image: string;
  price: number;
  currency: string;
  availability: "in_stock" | "out_of_stock";
  brand: string;
  category: string;
  sku: string;
  rating?: number;
  ratingCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: product.currency,
      price: product.price,
      availability:
        product.availability === "in_stock"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    ...(product.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.ratingCount || 1,
          },
        }
      : {}),
  };
}
