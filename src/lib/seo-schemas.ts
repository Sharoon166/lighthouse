/**
 * Reusable JSON-LD structured data schemas.
 *
 * Import these in page components and render via:
 * <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lighthouse.pk";

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lighthouse",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Premium lighting fixtures for homes and commercial spaces in Islamabad, Pakistan.",
    sameAs: [
      "https://www.facebook.com/lighthouseisb",
      "https://www.instagram.com/lighthouse.isb",
      "https://www.linkedin.com/company/light-house-islamabad",
      "https://www.tiktok.com/@light.house.isb",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+92 300 1234 567",
      contactType: "customer service",
      availableLanguage: "English",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Shop 1, Bilal Plaza, Blue Area G 7/3 Blue Area",
      addressLocality: "Islamabad",
      postalCode: "44000",
      addressCountry: "PK",
    },
  };
}

// ---------------------------------------------------------------------------
// LocalBusiness
// ---------------------------------------------------------------------------

export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Lighthouse",
    image: `${SITE_URL}/og-image.png`,
    url: SITE_URL,
    telephone: "+92 300 1234 567",
    priceRange: "PKR",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Shop 1, Bilal Plaza, Blue Area G 7/3 Blue Area",
      addressLocality: "Islamabad",
      postalCode: "44000",
      addressCountry: "PK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 33.716574,
      longitude: 73.0698142,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "19:00",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// WebSite (with sitelinks search box)
// ---------------------------------------------------------------------------

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Lighthouse",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function getBreadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };
}
