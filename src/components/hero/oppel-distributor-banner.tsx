import { ArrowRight02Icon, MapPin } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import LogoImage from "../shared/logo-img";
import { Button } from "../ui/button";

export function OppelDistributorBanner() {
  return (
    <section className="bg-opple-banner relative h-[155dvh] sm:h-155">
      {/*<picture className="absolute inset-0 -z-10">
          <source
            media="(max-width: 639px)"
            srcSet="/brands/opple-distribution-banner-mobile.png"
          />
          <img
            src="/brands/opple-distribution-banner.png"
            alt=""
            className="h-full w-full object-cover"
          />
      </picture>*/}

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
            <Image
              src="/exciting-news-badge.png"
              alt="OPPLE brand logo"
              height={50}
              width={180}
              className="-rotate-6 sm:hidden"
            />
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

            <Button size="lg" className="group max-sm:w-full">
              View Opple Collection{" "}
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                className="group-hover:translate-x-1.5 transition-transform size-6"
              />
            </Button>
          </div>
        </header>
      </div>
    </section>
  );
}
