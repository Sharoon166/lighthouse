"use client";

import { CheckIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export const PRESET_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#6B7280" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Chrome", hex: "#D9D9D9" },
  { name: "Gold", hex: "#D4AF37" },
  { name: "Brass", hex: "#B5A642" },
  { name: "Bronze", hex: "#CD7F32" },
  { name: "Copper", hex: "#B87333" },
  { name: "Nickel", hex: "#A8A9AD" },
  { name: "Brown", hex: "#795548" },
  { name: "Beige", hex: "#D6C6A8" },
];

function colorToHex(color: string): string {
  if (color.startsWith("#") && (color.length === 7 || color.length === 4)) {
    return color.toUpperCase();
  }
  return "";
}

function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

export function ColorPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (hex: string) => void;
  className?: string;
}) {
  const [hexInput, setHexInput] = useState(() => {
    const hex = colorToHex(value);
    return hex.startsWith("#") ? hex.slice(1) : "";
  });

  const normalizedValue = colorToHex(value);
  const isCustom =
    normalizedValue &&
    !PRESET_COLORS.some((c) => c.hex.toUpperCase() === normalizedValue);

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-1.5">
        {PRESET_COLORS.map((color) => {
          const isSelected =
            normalizedValue.toUpperCase() === color.hex.toUpperCase();
          const isLight =
            color.hex === "#FFFFFF" ||
            color.hex === "#C0C0C0" ||
            color.hex === "#FFD700" ||
            color.hex === "#EAB308" ||
            color.hex === "#F59E0B" ||
            color.hex === "#F97316" ||
            color.hex === "#84CC16";
          return (
            <button
              key={color.hex}
              type="button"
              title={color.name}
              onClick={() => onChange(color.hex)}
              className={`relative size-7 shrink-0 rounded-full border-2 transition-all ${
                isSelected
                  ? "border-foreground ring-2 ring-foreground/20 scale-110"
                  : "border-border hover:scale-110 hover:border-foreground/30"
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected && (
                <HugeiconsIcon
                  icon={CheckIcon}
                  size={12}
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
                    isLight ? "text-foreground" : "text-white"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div
          className="size-7 shrink-0 rounded-full border-2 border-border"
          style={{ backgroundColor: normalizedValue || "#E5E7EB" }}
        />
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">#</span>
          <Input
            value={hexInput}
            onChange={(e) => {
              const val = e.target.value
                .replace(/[^0-9A-Fa-f]/g, "")
                .slice(0, 6);
              setHexInput(val);
              if (isValidHex(`#${val}`)) {
                onChange(`#${val}`);
              }
            }}
            placeholder="000000"
            className="h-7 w-20 font-mono text-xs"
            maxLength={6}
          />
        </div>
      </div>
    </div>
  );
}

export function ColorSwatch({
  color,
  size = "sm",
}: {
  color: string;
  size?: "xs" | "sm" | "md";
}) {
  const hex = colorToHex(color) || color;
  const sizeClasses = {
    xs: "size-3",
    sm: "size-4",
    md: "size-5",
  };

  return (
    <span
      className={`inline-block shrink-0 rounded-full border border-border ${sizeClasses[size]}`}
      style={{ backgroundColor: hex || "#E5E7EB" }}
      title={color}
    />
  );
}
