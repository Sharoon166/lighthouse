import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Image from "next/image";
import { CTA } from "@/components/hero/cta";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Clients } from "@/components/shared/clients";
import { Partners } from "@/components/shared/partners";
import { Button } from "@/components/ui/button";
import { For } from "@/components/utils/for";
import { aboutStats, howWeWork, teamMembers } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About | Lighthouse",
  description:
    "Learn about Lighthouse — our craftsmanship, approach, and the team behind Pakistan's premium lighting solutions.",
};

export default function AboutPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-noise overflow-hidden pb-0">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "About" }]}
          className="container"
        />
        <div className="flex max-lg:flex-col items-center justify-between overflow-x-hidden">
          <div className="container lg:ml-28">
            <div className="max-w-2xl space-y-4 pt-10">
              <h1>About Lighthouse</h1>
              <p>
                For years, Light House has helped homeowners, architects, and
                businesses create warm, inviting spaces. We carefully source
                premium lighting that blends quality, performance, and timeless
                design. Our goal is simple — to provide fixtures that enhance
                the look and feel of every room.
              </p>
              <Button size="lg" className="mt-2">
                Learn More <HugeiconsIcon icon={ArrowRight02Icon} />
              </Button>
            </div>
          </div>

          <Image
            src="/about-image.png"
            width={1024}
            height={1024}
            priority
            alt="Premium lighting fixture"
            className="hover:brightness-125 transition-all"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border border">
            <For each={aboutStats} by={(stat) => stat.label}>
              {({ value, label }) => (
                <div className="py-10 px-6 text-center space-y-2">
                  <p className="text-4xl font-heading font-semibold text-primary-foreground">
                    {value}
                  </p>
                  <p className="text-xs tracking-widest text-muted-foreground uppercase">
                    {label}
                  </p>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="bg-muted">
        <div className="container">
        
        <div className="max-w-3xl space-y-3 mb-12">
          <h2>How We Work</h2>
          <p>
            From your first idea to the final installation, we make the lighting
            process simple, thoughtful, and tailored to your space.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          <For each={howWeWork} by={(item) => item.number}>
            {({ number, title, description }) => (
              <div className="space-y-4">
                <p className="text-5xl font-heading font-semibold text-muted-foreground/40">
                  {number}
                </p>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-primary-foreground">
                    {title}
                  </h3>
                  <p>{description}</p>
                </div>
              </div>
            )}
          </For>
          </div>
        </div>
      </section>

      {/* Our Clients */}
      <section className="container">
        <Clients />
      </section>

      {/* Our Team */}
      <section className="bg-muted">
        <div className="container">
          <div className="max-w-3xl space-y-3 mb-12">
            <h2>Our Team</h2>
            <p>
              A team of lighting enthusiasts, designers, and experts dedicated
              to helping you create spaces that shine.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <For each={teamMembers} by={(member) => member.name}>
              {({ name, role, image }) => (
                <div className="space-y-3">
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    <Image
                      src={image}
                      alt={name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="font-heading font-semibold text-primary-foreground">
                      {name}
                    </p>
                    <p className="text-xs tracking-widest text-gold uppercase">
                      {role}
                    </p>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Our Partners */}
      <section className="container">
        <Partners />
      </section>

      {/* CTA */}
      <div className="container">
        <CTA />
      </div>
    </main>
  );
}
