"use client";

import { ChevronUpIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" },
    );

    for (const heading of headings) {
      if (heading) observer.observe(heading);
    }

    return () => observer.disconnect();
  }, [items]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <nav aria-label="Table of contents">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Table of Contents
          </h3>
          <ul className="space-y-1">
            {items.map((item, index) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`flex items-baseline gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                      isActive
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="font-heading text-base font-bold text-gold shrink-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="line-clamp-1">{item.text}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <div className="border-t border-border pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollToTop}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <HugeiconsIcon icon={ChevronUpIcon} size={16} />
          Back to top
        </Button>
      </div>
    </div>
  );
}
