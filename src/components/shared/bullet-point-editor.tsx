"use client";

import {
  Add01Icon,
  Delete02Icon,
  DragDropVerticalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SingleFieldItem {
  id: string;
  value: string;
}

interface DoubleFieldItem {
  id: string;
  field1: string;
  field2: string;
}

interface BulletItem {
  id: string;
}

interface BulletPointEditorProps<T extends BulletItem> {
  label: string;
  description?: string;
  items: T[];
  onChange: (items: T[]) => void;
  createEmpty: () => T;
  renderFields: (
    item: T,
    index: number,
    onChange: (updated: T) => void,
  ) => React.ReactNode;
  minItems?: number;
  maxItems?: number;
}

export function BulletPointEditor<T extends BulletItem>({
  label,
  description,
  items,
  onChange,
  createEmpty,
  renderFields,
  minItems = 0,
  maxItems = 20,
}: BulletPointEditorProps<T>) {
  const handleAdd = () => {
    if (items.length >= maxItems) return;
    onChange([...items, createEmpty()]);
  };

  const handleRemove = (index: number) => {
    if (items.length <= minItems) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, updated: T) => {
    const next = [...items];
    next[index] = updated;
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {items.length}/{maxItems} items
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="group relative rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                #{index + 1}
              </div>
              <div className="flex-1 space-y-3">
                {renderFields(item, index, (updated) =>
                  handleChange(index, updated),
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={items.length <= minItems}
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
                aria-label={`Remove item ${index + 1}`}
              >
                <HugeiconsIcon icon={Delete02Icon} size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length < maxItems && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          className="w-full"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} />
          Add {label.toLowerCase().replace(/s$/, "")}
        </Button>
      )}
    </div>
  );
}

// Specific implementations for common use cases

interface Challenge {
  id: string;
  challenge: string;
  solution: string;
}

interface ChallengesEditorProps {
  challenges: Challenge[];
  onChange: (challenges: Challenge[]) => void;
  errors?: Record<string, string[]>;
}

export function ChallengesEditor({
  challenges,
  onChange,
  errors = {},
}: ChallengesEditorProps) {
  return (
    <BulletPointEditor<Challenge>
      label="Challenges & Solutions"
      description="Describe the challenges faced and how they were solved"
      items={challenges}
      onChange={onChange}
      createEmpty={() => ({
        id: `challenge-${Date.now()}-${Math.random()}`,
        challenge: "",
        solution: "",
      })}
      renderFields={(item, index, onUpdate) => (
        <>
          <div className="space-y-1.5">
            <Label htmlFor={`challenge-${item.id}`} className="text-xs">
              Challenge
            </Label>
            <Textarea
              id={`challenge-${item.id}`}
              value={item.challenge}
              onChange={(e) => onUpdate({ ...item, challenge: e.target.value })}
              placeholder="What was the challenge?"
              rows={2}
              className="resize-none"
            />
            {errors[`challenges.${index}.challenge`] && (
              <p className="text-xs text-destructive">
                {errors[`challenges.${index}.challenge`][0]}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`solution-${item.id}`} className="text-xs">
              Solution
            </Label>
            <Textarea
              id={`solution-${item.id}`}
              value={item.solution}
              onChange={(e) => onUpdate({ ...item, solution: e.target.value })}
              placeholder="How was it solved?"
              rows={2}
              className="resize-none"
            />
            {errors[`challenges.${index}.solution`] && (
              <p className="text-xs text-destructive">
                {errors[`challenges.${index}.solution`][0]}
              </p>
            )}
          </div>
        </>
      )}
    />
  );
}

interface Feature {
  id: string;
  title: string;
  description: string;
}

interface FeaturesEditorProps {
  features: Feature[];
  onChange: (features: Feature[]) => void;
  errors?: Record<string, string[]>;
}

export function FeaturesEditor({
  features,
  onChange,
  errors = {},
}: FeaturesEditorProps) {
  return (
    <BulletPointEditor<Feature>
      label="Features"
      description="Highlight key features and their benefits"
      items={features}
      onChange={onChange}
      createEmpty={() => ({
        id: `feature-${Date.now()}-${Math.random()}`,
        title: "",
        description: "",
      })}
      renderFields={(item, index, onUpdate) => (
        <>
          <div className="space-y-1.5">
            <Label htmlFor={`feature-title-${item.id}`} className="text-xs">
              Feature Title
            </Label>
            <Input
              id={`feature-title-${item.id}`}
              value={item.title}
              onChange={(e) => onUpdate({ ...item, title: e.target.value })}
              placeholder="e.g. Smart Dimming Control"
            />
            {errors[`features.${index}.title`] && (
              <p className="text-xs text-destructive">
                {errors[`features.${index}.title`][0]}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`feature-desc-${item.id}`} className="text-xs">
              Description
            </Label>
            <Textarea
              id={`feature-desc-${item.id}`}
              value={item.description}
              onChange={(e) =>
                onUpdate({ ...item, description: e.target.value })
              }
              placeholder="Describe the feature and its benefits"
              rows={2}
              className="resize-none"
            />
            {errors[`features.${index}.description`] && (
              <p className="text-xs text-destructive">
                {errors[`features.${index}.description`][0]}
              </p>
            )}
          </div>
        </>
      )}
    />
  );
}
