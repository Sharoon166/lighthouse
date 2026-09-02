"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type KeyboardEvent, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TaggedInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  id?: string;
  className?: string;
  suggestions?: readonly { label: string; value: string }[];
}

export function TaggedInput({
  value,
  onChange,
  placeholder = "Add a tag…",
  maxTags = Infinity,
  id,
  className,
  suggestions,
}: TaggedInputProps) {
  const [draft, setDraft] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const canAdd = value.length < maxTags;

  const filteredSuggestions =
    suggestions?.filter(
      (s) =>
        s.label.toLowerCase().includes(draft.toLowerCase()) &&
        !value.some((v) => v.toLowerCase() === s.label.toLowerCase()),
    ) ?? [];

  const addTag = (tag?: string) => {
    const next = (tag ?? draft).trim();
    if (!next || !canAdd) return;
    const exists = value.some(
      (existing) => existing.toLowerCase() === next.toLowerCase(),
    );
    if (!exists) {
      onChange([...value, next]);
    }
    setDraft("");
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-1.5 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className,
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex h-6 items-center gap-1 rounded-md bg-muted px-2 text-xs font-medium text-foreground "
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove tag ${tag}`}
            onClick={() => removeTag(tag)}
            className="rounded-sm text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={12} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        id={id}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          if (suggestions) setShowSuggestions(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions && setShowSuggestions(true)}
        onBlur={() => {
          setTimeout(() => setShowSuggestions(false), 150);
        }}
        placeholder={canAdd ? placeholder : `Maximum ${maxTags} tags`}
        disabled={!canAdd}
        className="h-6 min-w-24 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute left-0 top-full z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-popover p-1 shadow-md">
          {filteredSuggestions.map((suggestion) => (
            <li key={suggestion.value}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(suggestion.label);
                }}
                className="flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
