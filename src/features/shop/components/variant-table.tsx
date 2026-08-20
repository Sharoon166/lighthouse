"use client";

import {
  Cancel01Icon,
  Delete02Icon,
  ExpandIcon,
  MinusSignIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState, useCallback } from "react";
import { ImageDropzone, type UploadedImage, type UploadImageResult } from "@/components/shared/image-dropzone";
import { ColorSwatch } from "@/components/shared/color-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export interface VariantRow {
  _id?: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  weight?: number;
  barcode?: string;
  images: Array<{ url: string; publicId: string }>;
  isActive: boolean;
}

interface VariantTableProps {
  variants: VariantRow[];
  optionKeys: string[];
  optionLabels: Record<string, string>;
  optionValues: Record<string, string[]>;
  colorOptions?: Set<string>;
  onChange: (variants: VariantRow[]) => void;
  onRemoveManual?: () => void;
  upload?: (formData: FormData) => Promise<UploadImageResult>;
  deleteImage?: (publicId: string) => Promise<{ ok: boolean }>;
  fieldErrors?: Record<string, string[] | undefined>;
}

export function VariantTable({
  variants,
  optionKeys,
  optionLabels,
  optionValues,
  colorOptions = new Set(),
  onChange,
  upload,
  deleteImage,
  fieldErrors,
}: VariantTableProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkCostPrice, setBulkCostPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");
  const [bulkWeight, setBulkWeight] = useState("");

  const allSelected = selected.size === variants.length && variants.length > 0;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(variants.map((_, i) => i)));
    }
  };

  const toggleRow = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const updateVariant = (
    index: number,
    field: keyof VariantRow,
    value: string | number | boolean | Record<string, string> | Array<{ url: string; publicId: string }>,
  ) => {
    const next = variants.map((v, i) =>
      i === index ? { ...v, [field]: value } : v,
    );
    onChange(next);
  };

  const removeVariant = (index: number) => {
    const next = variants.filter((_, i) => i !== index);
    onChange(next);
    setSelected((prev) => {
      const nextSel = new Set(prev);
      nextSel.delete(index);
      const rebased = new Set<number>();
      for (const i of nextSel) {
        rebased.add(i > index ? i - 1 : i);
      }
      return rebased;
    });
    if (expandedRow === index) setExpandedRow(null);
    else if (expandedRow !== null && expandedRow > index) {
      setExpandedRow(expandedRow - 1);
    }
  };

  const addVariant = () => {
    const newVariant: VariantRow = {
      sku: "",
      name: "",
      attributes: {},
      price: 0,
      salePrice: undefined,
      costPrice: undefined,
      stock: 0,
      images: [],
      isActive: true,
    };
    onChange([...variants, newVariant]);
  };

  const applyBulk = () => {
    const indices = [...selected];
    const next = variants.map((v, i) => {
      if (!selected.has(i)) return v;
      const updated = { ...v };
      if (bulkPrice !== "") updated.price = Number(bulkPrice);
      if (bulkCostPrice !== "") updated.costPrice = Number(bulkCostPrice);
      if (bulkStock !== "") updated.stock = Number(bulkStock);
      if (bulkWeight !== "") updated.weight = Number(bulkWeight);
      return updated;
    });
    onChange(next);
    setBulkMode(false);
    setBulkPrice("");
    setBulkCostPrice("");
    setBulkStock("");
    setBulkWeight("");
    setSelected(new Set());
  };

  const autoName = (attrs: Record<string, string>): string => {
    return Object.values(attrs).filter(Boolean).join(" / ");
  };

  if (variants.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {optionKeys.length > 0
            ? "No variants yet. Add variants manually or generate them from options above."
            : "No variants yet. Add a base variant for this product."}
        </div>
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={14} />
            {optionKeys.length > 0 ? "Add variant" : "Add base variant"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          {variants.length} variant{variants.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={14} />
            Add variant
          </Button>
          {selected.size > 0 && (
            <Badge variant="secondary">
              {selected.size} selected
            </Badge>
          )}
          {selected.size > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBulkMode(!bulkMode)}
            >
              {bulkMode ? "Cancel" : "Bulk edit"}
            </Button>
          )}
        </div>
      </div>

      {bulkMode && selected.size > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Apply to {selected.size} variant{selected.size !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Price</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                placeholder="Skip"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cost price</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={bulkCostPrice}
                onChange={(e) => setBulkCostPrice(e.target.value)}
                placeholder="Skip"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Stock</Label>
              <Input
                type="number"
                min={0}
                value={bulkStock}
                onChange={(e) => setBulkStock(e.target.value)}
                placeholder="Skip"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Weight (g)</Label>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={bulkWeight}
                onChange={(e) => setBulkWeight(e.target.value)}
                placeholder="Skip"
                className="h-8 text-sm"
              />
            </div>
          </div>
          <Button type="button" size="sm" onClick={applyBulk}>
            Apply to {selected.size} variant{selected.size !== 1 ? "s" : ""}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleSelectAll}
                  className="size-3.5 rounded border-border accent-primary"
                />
              </th>
              <th className="px-3 py-2.5">Active</th>
              {optionKeys.map((key) => (
                <th key={key} className="px-3 py-2.5">
                  {optionLabels[key] ?? key}
                </th>
              ))}
              <th className="px-3 py-2.5">SKU</th>
              <th className="px-3 py-2.5 text-right">Price</th>
              <th className="px-3 py-2.5 text-right">Stock</th>
              <th className="w-10 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {variants.map((variant, index) => {
              const isExpanded = expandedRow === index;
              return (
                <VariantRow
                  key={variant._id ?? `new-${index}`}
                  variant={variant}
                  index={index}
                  optionKeys={optionKeys}
                  optionValues={optionValues}
                  colorOptions={colorOptions}
                  isSelected={selected.has(index)}
                  isExpanded={isExpanded}
                  onToggleSelect={() => toggleRow(index)}
                  onToggleExpand={() =>
                    setExpandedRow(isExpanded ? null : index)
                  }
                  onUpdate={(field, value) =>
                    updateVariant(index, field, value)
                  }
                  onRemove={() => removeVariant(index)}
                  upload={upload}
                  deleteImage={deleteImage}
                  fieldErrors={fieldErrors}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VariantRow({
  variant,
  index,
  optionKeys,
  optionValues,
  colorOptions,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  onUpdate,
  onRemove,
  upload,
  deleteImage,
  fieldErrors,
}: {
  variant: VariantRow;
  index: number;
  optionKeys: string[];
  optionValues: Record<string, string[]>;
  colorOptions: Set<string>;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onUpdate: (field: keyof VariantRow, value: string | number | boolean | Record<string, string> | Array<{ url: string; publicId: string }>) => void;
  onRemove?: () => void;
  upload?: (formData: FormData) => Promise<UploadImageResult>;
  deleteImage?: (publicId: string) => Promise<{ ok: boolean }>;
  fieldErrors?: Record<string, string[] | undefined>;
}) {
  const skuError = fieldErrors?.[`variants.${index}.sku`]?.[0];
  const nameError = fieldErrors?.[`variants.${index}.name`]?.[0];
  const canToggleOptions = optionKeys.length > 0;

  return (
    <>
      <tr
        className={`border-b border-border transition-colors ${
          isSelected ? "bg-primary/5" : "hover:bg-muted/30"
        }`}
      >
        <td className="px-3 py-2.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="size-3.5 rounded border-border accent-primary"
          />
        </td>
        <td>
          <div className="flex items-center justify-center gap-3">
            <Switch
              checked={variant.isActive}
              onCheckedChange={(checked) => onUpdate("isActive", checked)}
            />
          </div>
        </td>
        {optionKeys.map((key) => (
          <td key={key} className="px-3 py-2.5">
            {canToggleOptions && optionValues[key]?.length ? (
              <Select
                value={variant.attributes[key] ?? ""}
                onValueChange={(value) => {
                  const newAttrs = { ...variant.attributes, [key]: String(value ?? "") };
                  onUpdate("attributes", newAttrs);
                }}
              >
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {optionValues[key].map((val) => (
                    <SelectItem key={val} value={val}>
                      <span className="flex items-center gap-1.5">
                        {colorOptions.has(key) && (
                          <ColorSwatch color={val} size="xs" />
                        )}
                        {val}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {colorOptions.has(key) && variant.attributes[key] && (
                  <ColorSwatch color={variant.attributes[key]} size="xs" />
                )}
                {variant.attributes[key] ?? "\u2014"}
              </span>
            )}
          </td>
        ))}
        <td className="px-3 py-2.5">
          <div className="space-y-1">
            <Input
              value={variant.sku}
              onChange={(e) => onUpdate("sku", e.target.value)}
              placeholder="SKU"
              aria-invalid={Boolean(skuError)}
              className={`h-8 min-w-24 w-full font-mono text-xs ${skuError ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {skuError && (
              <p className="text-[11px] text-destructive leading-tight">{skuError}</p>
            )}
          </div>
        </td>
        <td className="px-3 py-2.5 text-right">
          <Input
            type="number"
            min={0}
            step={0.01}
            value={variant.price || ""}
            onChange={(e) => onUpdate("price", Number(e.target.value) || 0)}
            placeholder="0"
            className="h-8 w-24 text-right text-xs"
          />
        </td>
        <td className="px-3 py-2.5 text-right">
          <Input
            type="number"
            min={0}
            value={variant.stock || ""}
            onChange={(e) => onUpdate("stock", Number(e.target.value) || 0)}
            placeholder="0"
            className="h-8 w-20 text-right text-xs"
          />
        </td>
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-1">
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Remove variant"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={onToggleExpand}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <HugeiconsIcon icon={ExpandIcon} size={14} />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-border bg-muted/20">
          <td colSpan={optionKeys.length + 4} className="px-6 py-4">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Sale price</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={variant.salePrice ?? ""}
                    onChange={(e) =>
                      onUpdate(
                        "salePrice",
                        e.target.value ? Number(e.target.value) : 0,
                      )
                    }
                    placeholder="Optional"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cost price</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={variant.costPrice ?? ""}
                    onChange={(e) =>
                      onUpdate(
                        "costPrice",
                        e.target.value ? Number(e.target.value) : 0,
                      )
                    }
                    placeholder="Optional"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Weight (g)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={variant.weight ?? ""}
                    onChange={(e) =>
                      onUpdate(
                        "weight",
                        e.target.value ? Number(e.target.value) : 0,
                      )
                    }
                    placeholder="Optional"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Barcode</Label>
                  <Input
                    value={variant.barcode ?? ""}
                    onChange={(e) => onUpdate("barcode", e.target.value)}
                    placeholder="Optional"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <Switch
                    checked={variant.isActive}
                    onCheckedChange={(checked) => onUpdate("isActive", checked)}
                  />
                  <Label className="cursor-pointer text-sm">Active</Label>
                </div>
              </div>
              {upload && (
                <div className="space-y-2 border-t border-border pt-4">
                  <Label className="text-xs font-medium">Variant Images</Label>
                  <div className="flex flex-wrap gap-3">
                    {variant.images.map((img, imgIndex) => (
                      <div key={img.publicId} className="relative group">
                        <div className="size-20 overflow-hidden rounded-lg border border-border">
                          <img
                            src={img.url}
                            alt={`Variant image ${imgIndex + 1}`}
                            className="size-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (deleteImage && img.publicId) {
                              await deleteImage(img.publicId);
                            }
                            const nextImages = variant.images.filter((_, i) => i !== imgIndex);
                            onUpdate("images", nextImages);
                          }}
                          className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={10} />
                        </button>
                      </div>
                    ))}
                    <ImageDropzone
                      value={null}
                      onChange={(img) => {
                        if (img) {
                          onUpdate("images", [...variant.images, img]);
                        }
                      }}
                      upload={upload}
                      deleteImage={deleteImage}
                      emptyLabel="Add variant image"
                      aspectRatio={1}
                      maxSizeMB={5}
                    />
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
