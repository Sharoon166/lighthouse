import { ArrowRight02Icon, MapPin } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import LogoImage from "../shared/logo-img";
import { Button } from "../ui/button";
import Link from "next/link";

export function OppelDistributorBanner({
  hideButton = false,
}: {
  hideButton?: boolean;
}) {
  return (
    <section className="bg-opple-banner bg-right relative w-full aspect-2/3 sm:h-155 max-sm:pt-0">
      {/*<section className="bg-opple-banner bg-right relative h-[90vh] sm:h-155 max-sm:pt-0">*/}
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

      <div className="container flex max-lg:flex-col lg:items-center gap-y-10 justify-between py-10 max-sm:pt-[27%]">
        <header className="flex flex-col gap-4 sm:gap-6">
          {/* Logo section */}
          <div className="flex items-centern gap-4 h-12 ">
            <LogoImage />
            <div className="w-0.5 bg-gold h-10 sm:h-14" aria-hidden />
            <Image
              src="/brands/opple-logo.png"
              alt="OPPLE brand logo"
              height={60}
              width={120}
              className="object-contain"
            />
          </div>

          {/* Main content */}
          <div className="space-y-6">
            <Image
              src="/exciting-news-badge.png"
              alt="OPPLE brand logo"
              height={50}
              width={180}
              className="-rotate-6 hidden"
            />
            <h2 className="heading-underline text-primary uppercase max-w-xs sm:max-w-3xl max-sm:text-2xl  leading-snug">
              We are now the official distributor of{" "}
              <span className="text-gold">Opple</span>
            </h2>

            <address className="not-italic">
              <div className="flex items-center gap-2 sm:gap-4 uppercase sm:text-xl">
                <HugeiconsIcon
                  icon={MapPin}
                  className="text-gold size-4 sm:size-6"
                />
                <p>
                  In{" "}
                  <span className="text-gold font-semibold">
                    Rawalpindi & Islamabad
                  </span>
                </p>
              </div>
            </address>

            {!hideButton && (
              <Button
                size="lg"
                className="group h-12"
                nativeButton={false}
                render={
                  <Link href="/opple">
                    View Opple Collection{" "}
                    <HugeiconsIcon
                      icon={ArrowRight02Icon}
                      className="group-hover:translate-x-1.5 transition-transform size-6"
                    />
                  </Link>
                }
              />
            )}
          </div>
        </header>
      </div>
    </section>
  );
}
