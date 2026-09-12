"use client";

import { ArrowDown02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useId } from "react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const headerId = `${baseId}-header-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div
            key={index}
            className="border border-border bg-card overflow-hidden rounded-xl transition-all duration-300 hover:border-gold/30"
          >
            <h3>
              <button
                id={headerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(index)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors",
                  "hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
                )}
              >
                <span className="font-medium text-base md:text-lg pr-4">
                  {item.question}
                </span>
                <HugeiconsIcon
                  icon={ArrowDown02Icon}
                  size={20}
                  className={cn(
                    "shrink-0 text-muted-foreground transition-transform duration-300",
                    isOpen && "rotate-180 text-gold",
                  )}
                />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
              className="overflow-hidden"
            >
              <div className="px-6 pb-5 text-muted-foreground leading-relaxed border-t border-border pt-4">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
