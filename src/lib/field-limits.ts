export const FIELD_LIMITS = {
  seo: {
    metaTitle: 60,
    metaDescription: 160,
    focusKeyword: 100,
  },
  name: {
    short: 100,
    medium: 200,
    long: 300,
  },
  slug: 100,
  description: {
    short: 160,
    medium: 500,
    long: 1000,
  },
  tag: {
    name: 40,
    maxCount: 8,
  },
  variant: {
    sku: 100,
    attributeName: 50,
    attributeValue: 100,
  },
  content: {
    materialsAndCare: 1000,
    shippingAndReturns: 1000,
    payment: 1000,
    installationAndBulbs: 1000,
  },
  specification: {
    key: 100,
    value: 200,
    maxCount: 20,
  },
} as const;
