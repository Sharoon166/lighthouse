"use client";

import {
  Delete02Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SpecEntry {
  key: string;
  value: string;
}

interface SpecsEditorProps {
  value: SpecEntry[];
  onChange: (specs: SpecEntry[]) => void;
  suggestedSpecs?: Array<{ key: string; name: string; type?: string }>;
}

export function SpecsEditor({
  value,
  onChange,
  suggestedSpecs = [],
}: SpecsEditorProps) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const addSpec = (key: string, val: string) => {
    if (!key.trim() || !val.trim()) return;
    if (value.some((s) => s.key.toLowerCase() === key.trim().toLowerCase())) return;
    onChange([...value, { key: key.trim(), value: val.trim() }]);
  };

  const updateSpec = (
    index: number,
    field: "key" | "value",
    newValue: string,
  ) => {
    onChange(
      value.map((s, i) => (i === index ? { ...s, [field]: newValue } : s)),
    );
  };

  const removeSpec = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const addFromSuggested = (suggested: { key: string; name: string }) => {
    if (value.some((s) => s.key.toLowerCase() === suggested.key.toLowerCase())) return;
    onChange([...value, { key: suggested.key, value: "" }]);
  };

  const unusedSuggested = suggestedSpecs.filter(
    (s) => !value.some((v) => v.key.toLowerCase() === s.key.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((spec, index) => {
            const suggestedType = suggestedSpecs.find(
              (s) => s.key.toLowerCase() === spec.key.toLowerCase(),
            )?.type;
            const isNumber = suggestedType === "number";
            const isBoolean = suggestedType === "boolean";

            return (
              <div key={`${spec.key}-${index}`} className="flex items-center gap-2">
                <Input
                  value={spec.key}
                  onChange={(e) => updateSpec(index, "key", e.target.value)}
                  placeholder="Name"
                  className="h-9 flex-1 text-sm"
                />
                {isBoolean ? (
                  <Select
                    value={spec.value || ""}
                    onValueChange={(val) => updateSpec(index, "value", val ?? "")}
                  >
                    <SelectTrigger className="h-9 flex-1 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={spec.value}
                    onChange={(e) => updateSpec(index, "value", e.target.value)}
                    placeholder={isNumber ? "Numeric value" : "Value"}
                    type={isNumber ? "number" : "text"}
                    min={isNumber ? 0 : undefined}
                    step={isNumber ? 0.01 : undefined}
                    className="h-9 flex-1 text-sm"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeSpec(index)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newKey.trim() && newValue.trim()) {
              e.preventDefault();
              addSpec(newKey, newValue);
              setNewKey("");
              setNewValue("");
            }
          }}
          placeholder="Specification name"
          className="h-9 flex-1 text-sm"
        />
        <Input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newKey.trim() && newValue.trim()) {
              e.preventDefault();
              addSpec(newKey, newValue);
              setNewKey("");
              setNewValue("");
            }
          }}
          placeholder="Value"
          className="h-9 flex-1 text-sm"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (newKey.trim() && newValue.trim()) {
              addSpec(newKey, newValue);
              setNewKey("");
              setNewValue("");
            }
          }}
          disabled={!newKey.trim() || !newValue.trim()}
        >
          <HugeiconsIcon icon={PlusSignIcon} size={14} />
          Add
        </Button>
      </div>

      {unusedSuggested.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unusedSuggested.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => addFromSuggested(s)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={10} />
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
