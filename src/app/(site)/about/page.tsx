import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Image from "next/image";
import { CTA } from "@/components/hero/cta";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Clients } from "@/components/shared/clients";
import { Partners } from "@/components/shared/partners";
import { Button } from "@/components/ui/button";
import { aboutStats, ceoMessage, howWeWork } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About | Lighthouse",
  description:
    "Learn about Lighthouse — our craftsmanship, approach, and the team behind Pakistan's premium lighting solutions.",
};

export default function AboutPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-noise pb-0 lg:pt-0 grid lg:grid-cols-5 place-items-center overflow-hidden">
        <div className="container max-lg:pt-10 lg:ml-28 space-y-6 lg:col-start-1 lg:col-span-2 lg:row-start-1 z-10">
          <Breadcrumb
            items={[{ label: "Home", href: "/" }, { label: "About" }]}
          />
          <h1 className="lg:text-5xl">About Lighthouse</h1>
          <p className="max-w-2xl">
            Premium lighting, carefully chosen for quality, style, and performance. Beautiful fixtures that make every space feel warm and inviting.
          </p>
          <Button size="lg" className="mt-2">
            Learn More <HugeiconsIcon icon={ArrowRight02Icon} />
          </Button>
        </div>

        <Image
          src="/about-image.webp"
          width={1024}
          height={1024}
          priority
          alt="Premium lighting fixture"
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

      {/* Stats Section */}
      <section className="py-8">
        <div className="container">
          <div className="w-full grid grid-cols-2 md:grid-cols-4 divide-x max-md:divide-y divide-border border">
            {aboutStats.map((stat) => (
              <div
                key={stat.label}
                className="py-10 px-6 space-y-2"
              >
                <p className="text-4xl font-heading font-semibold text-primary-foreground">
                  {stat.value}
                </p>
                <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="bg-muted">
        <div className="container">
          <div className="max-w-3xl space-y-3 mb-12">
            <h2>How We Work</h2>
            <p>
              From your first idea to the final installation, we make the
              lighting process simple, thoughtful, and tailored to your space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {howWeWork.map((item) => (
              <div key={item.number} className="space-y-4">
                <p className="text-5xl font-heading font-semibold text-muted-foreground/40">
                  {item.number}
                </p>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-primary-foreground">
                    {item.title}
                  </h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Clients */}
      <div className="container">
        <Clients />
      </div>

      {/* CEO Message */}
      <section className="bg-muted">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Quote side */}
            <div className="space-y-8">
              <svg
                viewBox="0 0 80 60"
                className="w-16 h-16 text-secondary fill-current"
                aria-hidden="true"
              >
                <path d="M26.3 23.1C21.8 23.1 18.1 24.9 15.4 28.5C12.7 32.1 11.3 36.8 11.3 42.6C11.3 48.1 12.7 52.6 15.4 56.2C18.1 59.8 21.8 61.6 26.3 61.6C30.1 61.6 33.3 60.1 35.8 57.1C38.4 54.1 39.7 50.1 39.7 45.1C39.7 40.6 38.5 36.8 36.1 33.8C33.7 30.7 30.3 29.1 26.3 29.1V23.1ZM61.3 23.1C56.8 23.1 53.1 24.9 50.4 28.5C47.7 32.1 46.3 36.8 46.3 42.6C46.3 48.1 47.7 52.6 50.4 56.2C53.1 59.8 56.8 61.6 61.3 61.6C65.1 61.6 68.3 60.1 70.8 57.1C73.4 54.1 74.7 50.1 74.7 45.1C74.7 40.6 73.5 36.8 71.1 33.8C68.7 30.7 65.3 29.1 61.3 29.1V23.1Z" />
              </svg>

              <blockquote className="text-lg leading-relaxed text-foreground space-y-4">
                {ceoMessage.message.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </blockquote>

              <div className="space-y-1">
                <p className="font-heading text-xl font-semibold text-gold">
                  {ceoMessage.name}
                </p>
                <p className="text-sm tracking-widest text-muted-foreground uppercase">
                  {ceoMessage.role}
                </p>
              </div>
            </div>

            {/* Image side */}
            <div className="relative aspect-4/5 overflow-hidden">
              <Image
                src={ceoMessage.image}
                alt={ceoMessage.name}
                fill
                className="object-cover"
                priority
              />
            </div>
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
