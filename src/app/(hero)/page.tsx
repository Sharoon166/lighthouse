import {
  ArrowRight02Icon,
  ArrowUpRight01FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import HeroImage from "@/assets/hero-img.webp";
import MobileHeroImage from "@/assets/hero-img-mobile.webp";
import { BlogsFallback, BlogsStream } from "@/components/hero/blogs-stream";
import { CTA } from "@/components/hero/cta";
import { HeroLinks } from "@/components/hero/hero-links";
import { OppelDistributorBanner } from "@/components/hero/oppel-distributor-banner";
import {
  ProductsFallback,
  ProductsStream,
} from "@/components/hero/products-stream";
import {
  ProjectsFallback,
  ProjectsStream,
} from "@/components/hero/projects-stream";
import { Clients } from "@/components/shared/clients";
import {
  FeaturedCategoriesFallback,
  FeaturedCategoriesStream,
} from "@/components/shared/featured-categories-stream";
import { Marquee } from "@/components/shared/marquee";
import { Partners } from "@/components/shared/partners";
import { Button } from "@/components/ui/button";
import { marqueeText } from "@/lib/constants";
import {
  fetchFeaturedProducts,
  fetchHomepageBlogs,
  fetchHomepageProjects,
  HOMEPAGE_FALLBACK_BLOGS,
  HOMEPAGE_FALLBACK_PRODUCTS,
  HOMEPAGE_FALLBACK_PROJECTS,
} from "@/lib/homepage-data";
import {
  getLocalBusinessSchema,
  getOrganizationSchema,
  getWebSiteSchema,
} from "@/lib/seo-schemas";
import { fetchHomepageCategories } from "@/lib/shop-data";

export const metadata: Metadata = {
  title: "Lighthouse | Premium Lighting Solutions in Pakistan",
  description:
    "Premium pendants, chandeliers, and architectural lighting for homes and commercial spaces across Pakistan. Crafted for how a room feels.",
  openGraph: {
    title: "Lighthouse | Premium Lighting Solutions in Pakistan",
    description:
      "Premium pendants, chandeliers, and architectural lighting for homes and commercial spaces across Pakistan.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-pk": "/",
      "x-default": "/",
    },
  },
};

// <section className="relative min-h-125 flex sm:h-[95dvh] aspect-9/16 sm:aspect-auto items-end sm:items-center justify-center overflow-hidden px-6 pb-38 sm:pb-0">
export default async function Home() {
  // Kick all data fetches off in parallel before the first await.
  const categoriesPromise = fetchHomepageCategories();
  const productsPromise = fetchFeaturedProducts();
  const projectsPromise = fetchHomepageProjects();
  const blogsPromise = fetchHomepageBlogs();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getOrganizationSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebSiteSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getLocalBusinessSchema()),
        }}
      />
      <section className="relative min-h-125 sm:h-[95dvh] aspect-9/16 sm:aspect-auto max-sm:pt-[70%] sm:flex items-center overflow-hidden px-6 pb-38 sm:pb-0">
        <Image
          src={HeroImage}
          alt="Modern lighting fixtures illuminating a living space"
          priority
          className="absolute -z-10 right-0 top-0 h-full w-full object-cover max-sm:hidden"
        />
        <Image
          src={MobileHeroImage}
          alt="Modern lighting fixtures illuminating a living space"
          priority
          className="absolute inset-0 -z-10 block h-full w-full object-cover object-[center_30%] sm:hidden"
        />
        <div className="container space-y-6 sm:space-y-8">
          <div className="space-y-6 lg:w-[60%]">
            <h1 className="text-pretty max-sm:text-4xl">
              A house is only as warm as its{" "}
              <span className="text-gold">light</span>
            </h1>
            <p className="lg:text-lg">
              Pendants, chandeliers, and architectural fixtures for homes and
              commercial spaces across Pakistan.
              <span className="max-sm:hidden">
                Chosen for how a room feels once the switch is on, not just how
                the fixture looks when it&apos;s off.
              </span>
            </p>
          </div>

          <Button
            size="lg"
            className="group gap-4 font-bold"
            nativeButton={false}
            render={
              <Link href="/products" className="contents">
                Shop Collection
                <HugeiconsIcon
                  icon={ArrowUpRight01FreeIcons}
                  className="size-8 rounded-full bg-primary-foreground p-1 text-primary transition-transform group-hover:rotate-45"
                />
              </Link>
            }
          />
        </div>
        <HeroLinks />
      </section>
      <Marquee duration="10s" className="bg-gray-900 py-2 text-gold">
        {marqueeText.map((text) => (
          <div key={text} className="contents">
            <span>{text}</span>
            <span>•</span>
          </div>
        ))}
      </Marquee>
      <div className="container">
        <Suspense fallback={<FeaturedCategoriesFallback />}>
          <FeaturedCategoriesStream promise={categoriesPromise} />
        </Suspense>

        <Suspense
          fallback={<ProductsFallback products={HOMEPAGE_FALLBACK_PRODUCTS} />}
        >
          <ProductsStream promise={productsPromise} />
        </Suspense>
      </div>
      <section className="grid overflow-hidden bg-noise pb-0 place-items-center lg:grid-cols-5 lg:pt-0">
        <div className="container space-y-6 lg:col-start-1 lg:col-span-3 lg:row-start-1 z-10 lg:ml-28">
          <h2 className="text-primary">About Lighthouse</h2>

          <p className="max-w-2xl">
            For years, Light House has helped homeowners, architects, and
            businesses create warm, inviting spaces. We carefully source premium
            lighting that blends quality, performance, and timeless design. Our
            goal is simple, to provide fixtures that enhance the look and feel
            of every room.
          </p>

          <Link href="/about">
            <Button size="lg" className="mt-2">
              Learn More{" "}
              <HugeiconsIcon icon={ArrowRight02Icon} className="size-6" />
            </Button>
          </Link>
        </div>

        <Image
          src="/about-image.webp"
          width={1024}
          height={1024}
          alt="Lighthouse showroom with curated lighting displays"
          className="w-full brightness-75 transition-all duration-500 hover:brightness-150 lg:col-start-3 lg:col-span-5 lg:row-start-1"
        />
      </section>
      <Suspense
        fallback={<ProjectsFallback projects={HOMEPAGE_FALLBACK_PROJECTS} />}
      >
        <ProjectsStream promise={projectsPromise} />
      </Suspense>
      <div className="container">
        <Clients />
      </div>
      <OppelDistributorBanner />
      <Suspense fallback={<BlogsFallback blogs={HOMEPAGE_FALLBACK_BLOGS} />}>
        <BlogsStream promise={blogsPromise} />
      </Suspense>
      <div className="container">
        <Partners />
        <CTA />
      </div>
    </main>
  );
}
