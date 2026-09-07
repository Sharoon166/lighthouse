import Link from "next/link";
import { heroLinks } from "@/lib/constants";
import { HugeiconsIcon } from "@hugeicons/react";

export function HeroLinks() {
  return (
    <div className="max-sm:hidden absolute right-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-lg p-0">
      {heroLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm text-white/70 transition-colors hover:text-gold border border-secondary not-last:border-b-0 p-4 group"
        >
          <HugeiconsIcon icon={link.icon} />
          <span className="sr-only">{link.label}</span>
        </Link>
      ))}
    </div>
  );
}
