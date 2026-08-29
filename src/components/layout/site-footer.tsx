import Link from "next/link";
import LogoImage from "@/components/shared/logo-img";
import { footerNav } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-10 px-6 pt-16 pb-8 bg-noise">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-md space-y-4">
          <LogoImage />
          <p className="leading-relaxed">
            Premium decorative lighting for homes and commercial spaces across
            Pakistan. Designed to transform every room with warmth, elegance and
            timeless craftsmanship.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-10 md:grid-cols-4">
          {footerNav.map((group) => (
            <div key={group.heading}>
              <h4 className="text-sm font-semibold tracking-widest text-gray-200 uppercase">
                {group.heading}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => {
                  const isExternal = link.href?.startsWith("http");

                  return (
                    <li key={link.label}>
                      {link.href ? (
                        <Link
                          href={link.href}
                          {...(isExternal
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="text-sm transition-colors hover:text-muted"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <span className="text-sm">{link.label}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-2 border-t border-muted pt-6 text-sm sm:flex-row">
          <span>
            &copy; Copyright {new Date().getFullYear()} Light House. All rights
            reserved
          </span>
          <span>
            Powered by{" "}
            <a
              href="https://synctom.com"
              target="_blank"
              className="text-gold"
              rel="noopener"
            >
              Synctom
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
