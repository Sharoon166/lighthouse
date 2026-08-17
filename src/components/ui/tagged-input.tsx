"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type KeyboardEvent, useState } from "react";
import { cn } from "@/lib/utils";

interface TaggedInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  id?: string;
  className?: string;
}

export function TaggedInput({
  value,
  onChange,
  placeholder = "Add a tag…",
  maxTags = Infinity,
  id,
  className,
}: TaggedInputProps) {
  const [draft, setDraft] = useState("");

  const canAdd = value.length < maxTags;

  const addTag = () => {
    const tag = draft.trim();
    if (!tag || !canAdd) return;
    const exists = value.some(
      (existing) => existing.toLowerCase() === tag.toLowerCase(),
    );
    if (!exists) {
      onChange([...value, tag]);
    }
    setDraft("");
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
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-1.5 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
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
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={canAdd ? placeholder : `Maximum ${maxTags} tags`}
        disabled={!canAdd}
        className="h-6 min-w-24 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
