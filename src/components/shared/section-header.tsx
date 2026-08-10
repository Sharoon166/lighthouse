import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils"; // Adjust this path to match your project structure
import { Show } from "../utils/show";

interface SectionHeaderProps {
  title: string;
  accentWord?: string;
  description?: string;
  noCta?: boolean;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  accentWord,
  description,
  noCta = false,
  ctaText = "View All Collections",
  ctaHref = "#",
  className,
}) => {
  return (
    <header
      className={cn(
        "flex flex-col md:flex-row md:items-end md:justify-between gap-6 w-full py-8",
        className,
      )}
    >
      {/* Left Column: Typography Block */}
      <div className="max-w-3xl space-y-3">
        <h2 className="leading-tight">
          {title}
          {accentWord && (
            <span className="text-amber-600 font-serif"> {accentWord}</span>
          )}
        </h2>

        {description && <p>{description}</p>}
      </div>

      {/* Right Column: CTA Anchor Link */}
      <Show when={!noCta}>
        <div className="shrink-0 pb-1">
          <a
            href={ctaHref}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition-colors"
          >
            <span>{ctaText}</span>
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              size={16}
              className="transform transition-transform group-hover:translate-x-1"
            />
          </a>
        </div>
      </Show>
    </header>
  );
};
