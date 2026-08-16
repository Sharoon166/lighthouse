"use client";

import { useEffect, useState } from "react";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
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

    const headings = document.querySelectorAll("h2[id], h3[id], h4[id]");
    for (const heading of headings) {
      observer.observe(heading);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-8 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            On This Page
          </h2>
          <nav>
            <ul className="space-y-2 border-l-2 border-border">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`block border-l-2 py-1.5 text-sm transition-colors ${
                      activeId === item.id
                        ? "-ml-0.5 border-primary font-medium text-foreground"
                        : "border-transparent pl-4 text-muted-foreground hover:text-foreground"
                    }`}
                    style={{
                      paddingLeft:
                        activeId === item.id
                          ? `${(item.level - 2) * 1}rem`
                          : `${(item.level - 2) * 1 + 1}rem`,
                    }}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile Collapsible */}
      <div className="mb-8 rounded-lg border border-border bg-card p-4 lg:hidden">
        <button
          type="button"
          onClick={() => setTocOpen(!tocOpen)}
          className="flex w-full items-center justify-between text-sm font-semibold uppercase tracking-wider text-foreground"
        >
          <span>On This Page</span>
          <span>{tocOpen ? "−" : "+"}</span>
        </button>
        {tocOpen && (
          <nav className="mt-4">
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setTocOpen(false)}
                    className="block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                    style={{
                      paddingLeft: `${(item.level - 2) * 1}rem`,
                    }}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
