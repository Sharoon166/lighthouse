import {
  ArrowRight02Icon,
  ArrowUpRight01FreeIcons,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import HeroImage from "@/assets/hero-img.png";
import { Marquee } from "@/components/shared/marquee";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { For } from "@/components/utils/for";
import {
  dummyCategories,
  dummyProducts,
  dummyProjects,
  featuredBlogs,
  marqueeText,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { OppelDistributorBanner } from "@/components/hero/oppel-distributor-banner";
import { BlogCard } from "@/components/shared/blog-card";
import { Clients } from "@/components/shared/clients";
import { Partners } from "@/components/shared/partners";
import { CTA } from "@/components/hero/cta";

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
        <div className="space-y-8 container">
          <div className="lg:w-[65%] space-y-4">
            <h1 className="text-pretty max-sm:text-5xl">
              A house is only as warm as its{" "}
              <span className="text-gold">light</span>
            </h1>
            <p className="lg:text-lg">
              Pendants, chandeliers, and architectural fixtures for homes and
              commercial spaces across Pakistan. Chosen for how a room feels
              once the switch is on, not just how the fixture looks when
              it&apos;s off.
            </p>
          </div>

          <Button size="lg" className="group py-7 font-bold">
            Shop Collection
            <HugeiconsIcon
              icon={ArrowUpRight01FreeIcons}
              className="bg-primary-foreground text-primary p-1 rounded-full size-7 group-hover:rotate-45 transition-transform"
            />
          </Button>
        </div>
      </section>
      <Marquee duration="10s" className="bg-gray-900 text-gold py-4">
        <For each={marqueeText}>
          {(text, index) => (
            <>
              <span>{text}</span>✦
            </>
          )}
        </For>
      </Marquee>

      <div className="container">
        <section>
          <SectionHeader
            title="Lighting Collections for Every Space"
            description="Explore our curated range of premium lighting solutions for homes, offices and commercial environments. Find the perfect fixture for every style and every space."
          />

          <div className="grid grid-cols-12 gap-4">
            <For each={dummyCategories} by={(category) => category.id}>
              {({ id, title, items }, index) => (
                <Link
                  href="#"
                  className={cn(
                    "p-6 min-h-80 bg-contain relative overflow-hidden",
                    {
                      "row-span-1 col-span-12 md:col-span-6 lg:col-span-8":
                        index == 0,
                      "lg:row-span-2 col-span-12 md:col-span-6 lg:col-span-4":
                        index === 1,
                      "row-span-1 col-span-12 md:col-span-6 lg:col-span-4":
                        index === 2 || index === 3,
                    },
                  )}
                >
                  <h3 className="text-primary text-xl font-normal tracking-tight">
                    {title}
                  </h3>
                  <p className="text-gold uppercase tracking-widest">
                    {items} Designs
                  </p>

                  <Image
                    src={`/${id}.png`}
                    width={1024}
                    height={1024}
                    alt={id}
                    className="absolute top-0 right-0 w-full h-full -z-10 object-cover brightness-170"
                  />
                </Link>
              )}
            </For>
          </div>
        </section>

        <section>
          <SectionHeader
            title="Customer Favorites"
            description="Explore our most popular lighting designs, chosen by homeowners, architects and interior designers for their exceptional quality and timeless style."
            ctaText="View all Products"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <For each={dummyProducts} by={(product) => product.id}>
              {({ id, title, price }, index) => (
                <Link href="#" className="border">
                  <Image
                    src={`/products/${index + 1}.png`}
                    width={1024}
                    height={1024}
                    alt={id}
                    className="h-80 aspect-square -z-10 object-contain bg-muted"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-sans">{title}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground font-semibold uppercase font-heading">
                        {price}
                      </p>
                      <Button variant="secondary" className="rounded-full">
                        <HugeiconsIcon icon={PlusSignIcon} />
                      </Button>
                    </div>
                  </div>
                </Link>
              )}
            </For>
          </div>
        </section>
      </div>

      <section className="bg-noise pb-0 lg:pt-0 grid lg:grid-cols-5 place-items-center overflow-hidden">
        <div className="container max-lg:pt-10 lg:ml-28 space-y-6 lg:col-start-1 lg:col-span-2 lg:row-start-1 z-10">
          <h2 className="text-primary">About Lighthouse</h2>

          <p className="max-w-2xl">
            For years, Light House has helped homeowners, architects, and
            businesses create warm, inviting spaces. We carefully source premium
            lighting that blends quality, performance, and timeless design. Our
            goal is simple, to provide fixtures that enhance the look and feel
            of every room.
          </p>

          <Button size="lg" className="mt-2">
            Learn More <HugeiconsIcon icon={ArrowRight02Icon} />
          </Button>
        </div>

        <Image
          src="/about-image.png"
          width={1024}
          height={1024}
          priority
          alt=""
          className="
          w-full
            lg:col-start-3
            lg:col-span-5
            lg:row-start-1
            hover:brightness-125
            transition-all
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
          <div className="grid grid-cols-3 gap-4">
            <For each={dummyProjects} by={(project) => project.id}>
              {({ title, subtitle, link, image }, index) => (
                <Link
                  href={link}
                  style={{ backgroundImage: `url(${image})` }}
                  className={cn(
                    `border min-h-72 p-4 bg-cover max-md:col-span-3 place-content-end`,
                    {
                      "md:col-span-2 md:row-span-2": index === 0,
                    },
                  )}
                >
                  <h3 className="text-xl text-primary">{title}</h3>
                  <div className="flex items-center gap-4 text-gold">
                    <p>{subtitle}</p>
                    <HugeiconsIcon icon={ArrowRight02Icon} />
                  </div>
                </Link>
              )}
            </For>
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
            <For each={featuredBlogs} by={(blog) => blog.title}>
              {(blog) => <BlogCard {...blog} />}
            </For>
          </div>
        </div>
      </section>
      <div className="container space-y-32">
        <Partners />
        <CTA />
      </div>
    </main>
  );
}
