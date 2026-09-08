import Link from "next/link";
import { heroLinks } from "@/lib/constants";

export function HeroLinks() {
  return (
    <div className="max-sm:hidden absolute right-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-lg p-0">
      {heroLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="w-full grid place-content-center text-sm text-white/70 transition-colors border border-secondary/50 not-last:border-b-0 p-4 group"
        >
          <link.icon />
          <span className="sr-only">{link.label}</span>
        </Link>
      ))}
    </div>
  );
}
