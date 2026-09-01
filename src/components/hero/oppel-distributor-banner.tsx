import Image from "next/image";
import LogoImage from "../shared/logo-img";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, MapPin } from "@hugeicons/core-free-icons";
import { Button } from "../ui/button";

export function OppelDistributorBanner() {
  return (
    <section className="bg-noise">
      <div className="container flex max-lg:flex-col items-center gap-y-10 justify-between py-10">
        <header className="flex flex-col gap-6">
          {/* Logo section */}
          <div className="flex items-center gap-4">
            <LogoImage />
            <div className="w-0.5 bg-gold h-14" aria-hidden />
            <Image
              src="/brands/opple-logo.png"
              alt="OPPLE brand logo"
              height={60}
              width={120}
            />
          </div>

          {/* Main content */}
          <div className="space-y-6">
            <h2 className="heading-underline text-primary uppercase max-w-3xl leading-snug">
              We are now the official distributor of{" "}
              <span className="text-gold">Opple</span>
            </h2>

            <address className="not-italic">
              <div className="flex items-center gap-4 uppercase text-xl">
                <HugeiconsIcon icon={MapPin} className="text-gold w-6 h-6" />
                <p>
                  In{" "}
                  <span className="text-gold font-semibold">
                    Rawalpindi & Islamabad
                  </span>
                </p>
              </div>
            </address>

            <Button size="lg" className="group">
              View Opple Collection{" "}
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                className="group-hover:translate-x-1.5 transition-transform size-6"
              />
            </Button>
          </div>
        </header>

        <figure className="grow relative">
          <Image
            src="/exciting-news-badge.png"
            alt="Exciting news badge"
            height={60}
            width={220}
            className="absolute left-2/12 -rotate-6"
          />
          <Image
            src="/brands/opple-product-showcase.png"
            alt="OPPLE product showcase featuring lighting fixtures and panels"
            height={452}
            width={660}
          />
          <figcaption className="sr-only">OPPLE lighting products</figcaption>
        </figure>
      </div>
    </section>
  );
}