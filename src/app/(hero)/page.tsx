import {
  ArrowRight02Icon,
  ArrowUpRight01FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import HeroImage from "@/assets/hero-img.webp";
import MobileHeroImage from "@/assets/hero-img-mobile.png";
import { HeroLinks } from "@/components/hero/hero-links";
import { CTA } from "@/components/hero/cta";
import { OppelDistributorBanner } from "@/components/hero/oppel-distributor-banner";
import { BlogCard } from "@/components/shared/blog-card";
import { Clients } from "@/components/shared/clients";
import { Marquee } from "@/components/shared/marquee";
import { SectionHeader } from "@/components/shared/section-header";
import { Partners } from "@/components/shared/partners";
import { Button } from "@/components/ui/button";
import {
  dummyCategories,
  dummyProducts,
  dummyProjects,
  featuredBlogs,
  marqueeText,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main>
      <section className="relative h-[95dvh] overflow-hidden flex justify-center items-center px-6">
        <Image
          src={HeroImage}
          alt="hero image"
          priority
          className="absolute top-0 right-0 -z-10 h-full w-full object-cover"
        />
        <Image
          src={MobileHeroImage}
          alt="hero image"
          priority
          className="absolute inset-0 -z-10 block w-full h-full object-cover object-top sm:hidden"
        />
        <div className="space-y-6 sm:space-y-8 container max-sm:mt-auto max-sm:mb-[20%]">
          <div className="lg:w-[65%] space-y-4">
            <h1 className="text-pretty max-sm:text-4xl">
              A house is only as warm as its{" "}
              <span className="text-gold">light</span>
            </h1>
            <p className=" lg:text-lg">
              Pendants, chandeliers, and architectural fixtures for homes and
              commercial spaces across Pakistan.
              <span className="max-sm:hidden">  
              Chosen for how a room feels
              once the switch is on, not just how the fixture looks when
              it&apos;s off.
              </span>
            </p>
          </div>

          <Button size="lg" className="group gap-4 font-bold">
            Shop Collection
            <HugeiconsIcon
              icon={ArrowUpRight01FreeIcons}
              className="bg-primary-foreground text-primary p-1 rounded-full size-8 group-hover:rotate-45 transition-transform"
            />
          </Button>
        </div>
        <HeroLinks />
      </section>

      <Marquee duration="10s" className="bg-gray-900 text-gold py-2">
        {marqueeText.map((text) => (
          <div key={text} className="contents">
            <span>{text}</span>
            <span>•</span>
          </div>
        ))}
      </Marquee>

      <div className="container">
        <section>
          <SectionHeader
            title="Lighting Collections for Every Space"
            description="Explore our curated range of premium lighting solutions for homes, offices and commercial environments. Find the perfect fixture for every style and every space."
          />

          <div className="grid grid-cols-12 gap-4">
            {dummyCategories.map((category, index) => (
              <Link
                key={category.id}
                href="#"
                className={cn(
                  "p-6 min-h-66 bg-contain relative overflow-hidden",
                  {
                    "row-span-1 col-span-12 md:col-span-6 lg:col-span-8":
                      index === 0,
                    "lg:row-span-2 col-span-6 md:col-span-6 lg:col-span-4":
                      index === 1,
                    "row-span-1 col-span-6 md:col-span-6 lg:col-span-4 min-h-62":
                      index === 2,
                    "row-span-1 col-span-12 md:col-span-6 lg:col-span-4 min-h-62":
                      index === 3,
                  },
                )}
              >
                <h3 className="text-primary text-xl font-normal tracking-tight">
                  {category.title}
                </h3>
                <p className="text-gold uppercase tracking-widest">
                  {category.items} Designs
                </p>

                <Image
                  src={`/${category.id}.png`}
                  width={1024}
                  height={1024}
                  alt={category.id}
                  className="absolute top-0 right-0 w-full h-full -z-10 object-cover brightness-180"
                />
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Customer Favorites"
            description="Explore our most popular lighting designs, chosen by homeowners, architects and interior designers for their exceptional quality and timeless style."
            ctaText="View all Products"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {dummyProducts.map((product, index) => (
              <div key={product.id} className="group border">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={`/products/${index + 1}.png`}
                    alt={product.title}
                    width={1024}
                    height={1024}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-sans hover:text-gold transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-muted-foreground font-semibold uppercase font-heading">
                    {product.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-noise pb-0 lg:pt-0 grid lg:grid-cols-5 place-items-center overflow-hidden">
        <div className="container lg:ml-28 space-y-6 lg:col-start-1 lg:col-span-3 lg:row-start-1 z-10">
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
          priority
          alt=""
          className="
          w-full
            lg:col-start-3
            lg:col-span-5
            lg:row-start-1
            brightness-75
            hover:brightness-150
            transition-all
            duration-500
          "
        />
      </section>

      <section className="bg-muted mb-0">
        <div className="container">
          <SectionHeader
            title="Lighting That Transforms Every Space"
            description="Explore a selection of residential and commercial projects featuring our premium lighting solutions, designed to enhance ambience, functionality and style."
            ctaText="View all Projects"
          />
          <div className="grid grid-cols-5 gap-4 h-136">
            {dummyProjects.map((project, index) => (
              <Link
                key={project.id}
                href={project.link}
                style={{ backgroundImage: `url(${project.image})` }}
                className={cn(
                  `border p-4 bg-cover max-md:col-span-5 place-content-end col-span-2`,
                  {
                    "md:col-span-3 md:row-span-2": index === 0,
                  },
                )}
              >
                <h3 className="text-2xl font-bold text-primary">
                  {project.title}
                </h3>
                <div className="flex items-center gap-4 text-gold">
                  <p>{project.subtitle}</p>
                  <HugeiconsIcon icon={ArrowRight02Icon} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div className="container">
        <Clients />
      </div>

      <OppelDistributorBanner />

      <section className="bg-muted mb-0">
        <div className="container">
          <SectionHeader
            title="Lighting Ideas & Design Inspiration"
            description="Explore expert tips, interior design trends, and practical lighting guides to help you create beautiful, functional spaces with confidence."
            ctaText="View All Articles"
          />
          <div className="grid md:grid-cols-3 gap-4">
            {featuredBlogs.map((blog) => (
              <BlogCard key={blog.title} {...blog} />
            ))}
          </div>
        </div>
      </section>
      <div className="container">
        <Partners />
        <CTA />
      </div>
    </main>
  );
}
