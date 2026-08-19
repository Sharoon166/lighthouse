"use client";

import {
  ArrowLeft02Icon,
  CheckIcon,
  Delete02Icon,
  Loading02Icon,
  PlusSignIcon,
  Refresh01Icon,
  Rocket01Icon,
  SaveIcon,
  SparklesIcon,
  Warning,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { ColorPicker, ColorSwatch } from "@/components/shared/color-picker";
import { ImageDropzone } from "@/components/shared/image-dropzone";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FIELD_LIMITS } from "@/lib/field-limits";
import { slugify } from "@/lib/utils";
import { deleteShopImage, uploadShopImage } from "../actions/image-actions";
import { getCategoryAttributes } from "../actions/category-actions";
import {
  createProduct,
  type Product,
  type ProductActionResult,
  updateProduct,
} from "../actions/product-actions";
import { type ProductInput, productInputSchema } from "../validation/product";
import { VariantTable, type VariantRow } from "./variant-table";
import { SpecsEditor, type SpecEntry } from "./specs-editor";
import {
  AddAttributeDialog,
  type AttributeLibraryItem,
} from "./add-attribute-dialog";

// ── Types ──────────────────────────────────────────────────────

interface OptionDraft {
  attributeId?: string;
  name: string;
  values: string[];
  type?: string;
  isColor?: boolean;
}

interface CategoryAttribute {
  attributeId: string;
  key: string;
  name: string;
  type: string;
  options: string[];
  required: boolean;
  isVariant: boolean;
  sortOrder: number;
}

interface ProductFormProps {
  mode?: "create" | "edit";
  id?: string;
  initialData?: Product | null;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
    level: number;
    ancestors: string[];
  }>;
  brands?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

// ── Helpers ────────────────────────────────────────────────────

function scrollToFirstError(fieldErrors: Record<string, string[] | undefined>) {
  const first = Object.keys(fieldErrors).find(
    (field) => fieldErrors[field]?.length,
  );
  if (!first) return;
  const node = document.querySelector<HTMLElement>(`[data-field="${first}"]`);
  if (!node) return;
  node.scrollIntoView({ behavior: "smooth", block: "center" });
  node
    .querySelector<HTMLElement>(
      "input, textarea, select, [data-slot=select-trigger]",
    )
    ?.focus({ preventScroll: true });
}

function cartesianProduct(arrays: string[][]): string[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<string[][]>(
    (combinations, current) =>
      combinations.flatMap((combo) => current.map((item) => [...combo, item])),
    [[]],
  );
}

function optionKey(attrs: Record<string, string>, keys: string[]): string {
  return keys.map((k) => attrs[k] ?? "").join("||");
}

function buildVariantName(attrs: Record<string, string>): string {
  return Object.values(attrs).filter(Boolean).join(" / ");
}

function readBaseAttr(
  base: Map<string, string> | Record<string, string> | undefined,
  key: string,
): string {
  if (!base) return "";
  if (base instanceof Map) return base.get(key) ?? "";
  return base[key] ?? "";
}

// ── Option Value Input ─────────────────────────────────────────

function OptionValueInput({
  onAdd,
  placeholder,
}: {
  onAdd: (value: string) => void;
  placeholder: string;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && value.trim()) {
            event.preventDefault();
            onAdd(value.trim());
            setValue("");
          }
        }}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8"
        onClick={() => {
          if (value.trim()) {
            onAdd(value.trim());
            setValue("");
          }
        }}
        disabled={!value.trim()}
      >
        Add
      </Button>
    </div>
  );
}

// ── Add Attribute Dialog ───────────────────────────────────────

// ── Add Option Value Dialog ────────────────────────────────────

function AddOptionValueDialog({
  open,
  onOpenChange,
  predefinedValues,
  existingValues,
  onAddValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  predefinedValues: string[];
  existingValues: string[];
  onAddValues: (values: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(existingValues),
  );
  const [customValue, setCustomValue] = useState("");

  useEffect(() => {
    if (open) {
      setSelected(new Set(existingValues));
      setCustomValue("");
    }
  }, [open, existingValues]);

  const toggleValue = (value: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const handleAdd = () => {
    onAddValues([...selected]);
    onOpenChange(false);
  };

  const unselectedPredefined = predefinedValues.filter(
    (v) => !selected.has(v),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add values"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {predefinedValues.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Predefined values
            </Label>
            <div className="flex flex-wrap gap-2">
              {predefinedValues.map((value) => {
                const isSelected = selected.has(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleValue(value)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {isSelected ? "✓ " : ""}
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Custom value
          </Label>
          <div className="flex gap-2">
            <Input
              value={customValue}
              onChange={(event) => setCustomValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && customValue.trim()) {
                  event.preventDefault();
                  toggleValue(customValue.trim());
                  setCustomValue("");
                }
              }}
              placeholder="Enter a value"
              className="h-9 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!customValue.trim()}
              onClick={() => {
                if (customValue.trim()) {
                  toggleValue(customValue.trim());
                  setCustomValue("");
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleAdd}>
            Apply ({selected.size} selected)
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

// ── Main Form ──────────────────────────────────────────────────

export function ProductForm({
  mode = "create",
  id,
  initialData = null,
  categories = [],
  brands = [],
}: ProductFormProps) {
  const isEdit = mode === "edit";
  const router = useRouter();

  // ── Basic product fields ──
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [isSlugEdited, setIsSlugEdited] = useState(isEdit);
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription ?? "",
  );
  const [category, setCategory] = useState<string | null>(
    initialData?.category?._id ? String(initialData.category._id) : null,
  );
  const [brand, setBrand] = useState<string | null>(
    initialData?.brand?._id ? String(initialData.brand._id) : null,
  );
  const [images, setImages] = useState<
    Array<{ url: string; publicId: string }>
  >(
    initialData?.images?.map((img) => ({
      url: img,
      publicId: img,
    })) ?? [],
  );
  const [isActive, setIsActive] = useState(
    initialData ? initialData.status === "active" : true,
  );
  const [isFeatured, setIsFeatured] = useState(
    initialData ? initialData.isFeatured === true : false,
  );
  const [seoMetaTitle, setSeoMetaTitle] = useState(
    initialData?.seo?.metaTitle ?? "",
  );
  const [seoMetaDescription, setSeoMetaDescription] = useState(
    initialData?.seo?.metaDescription ?? "",
  );
  const [contentMaterialsAndCare, setContentMaterialsAndCare] = useState(
    initialData?.content?.materialsAndCare ?? "",
  );
  const [contentShippingAndReturns, setContentShippingAndReturns] = useState(
    initialData?.content?.shippingAndReturns ?? "",
  );
  const [contentPayment, setContentPayment] = useState(
    initialData?.content?.payment ?? "",
  );
  const [contentInstallationAndBulbs, setContentInstallationAndBulbs] =
    useState(initialData?.content?.installationAndBulbs ?? "");

  // ── Options (variant-generating attributes) ──
  const [options, setOptions] = useState<OptionDraft[]>(() => {
    if (!initialData?.variantAttributes?.length) return [];
    return initialData.variantAttributes.map((attrName) => {
      const baseVal = readBaseAttr(initialData.baseAttributes, String(attrName));
      return {
        name: String(attrName),
        values: baseVal ? baseVal.split(",").map((v) => v.trim()) : [],
      };
    });
  });
  const previousOptionsRef = useRef<string[]>(options.map((o) => o.name));

  // ── Specifications (non-variant attributes) ──
  const [specifications, setSpecifications] = useState<SpecEntry[]>(() => {
    if (!initialData?.specifications) return [];
    return initialData.specifications.map((s) => ({
      key: s.key,
      value: s.value,
    }));
  });

  // ── Specifications description (rich text) ──
  const [specificationsDescription, setSpecificationsDescription] = useState(
    initialData?.specificationsDescription ?? "",
  );

  // ── Variants ──
  const [variants, setVariants] = useState<VariantRow[]>(() => {
    if (initialData?.variants) {
      return initialData.variants.map((v) => {
        const attrs: Record<string, string> =
          v.attributes instanceof Map
            ? Object.fromEntries(v.attributes.entries())
            : typeof v.attributes === "object" && v.attributes !== null
              ? (v.attributes as Record<string, string>)
              : {};
        return {
          _id: v._id ? String(v._id) : undefined,
          sku: v.sku,
          name: v.title ?? "",
          attributes: attrs,
          price: v.price,
          salePrice: v.salePrice ?? undefined,
          costPrice: v.costPrice ?? undefined,
          stock: v.stock,
          images: (v.images ?? []).map((img) => ({ url: img, publicId: img })),
          isActive: v.isActive ?? true,
        };
      });
    }
    return [];
  });
  const [hasGeneratedVariants, setHasGeneratedVariants] = useState(
    () => (initialData?.variants?.length ?? 0) > 0,
  );

  // ── Category attributes (fetched) ──
  const [categoryAttributes, setCategoryAttributes] = useState<
    CategoryAttribute[]
  >([]);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);

  // ── Add option/spec dialogs ──
  const [addOptionDialogOpen, setAddOptionDialogOpen] = useState(false);
  const [addSpecDialogOpen, setAddSpecDialogOpen] = useState(false);
  const [addValueDialogIndex, setAddValueDialogIndex] = useState<number | null>(
    null,
  );

  // ── UI state ──
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const savedNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoryFetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editId = id ?? "";

  // ── Slug generation ──
  useEffect(() => {
    if (!isSlugEdited) {
      setSlug(slugify(name));
    }
  }, [name, isSlugEdited]);

  useEffect(() => {
    return () => {
      if (savedNoticeTimer.current) clearTimeout(savedNoticeTimer.current);
      if (categoryFetchTimer.current) clearTimeout(categoryFetchTimer.current);
    };
  }, []);

  // ── Fetch category attributes ──
  const fetchCategoryAttributes = useCallback(
    (categoryId: string) => {
      setIsLoadingAttributes(true);
      if (categoryFetchTimer.current) clearTimeout(categoryFetchTimer.current);

      categoryFetchTimer.current = setTimeout(() => {
        getCategoryAttributes(categoryId)
          .then((attrs) => {
            setCategoryAttributes(attrs);
          })
          .catch(() => {
            setCategoryAttributes([]);
          })
          .finally(() => {
            setIsLoadingAttributes(false);
          });
      }, 300);
    },
    [],
  );

  useEffect(() => {
    if (!category) {
      setCategoryAttributes([]);
      return;
    }
    fetchCategoryAttributes(category);
    return () => {
      if (categoryFetchTimer.current) clearTimeout(categoryFetchTimer.current);
    };
  }, [category, fetchCategoryAttributes]);

  // ── Auto-generate variants from options ──
  const generatedCombinations = useMemo(() => {
    const optionsWithValues = options.filter((o) => o.values.length > 0);
    if (optionsWithValues.length === 0) return [];

    const arrays = optionsWithValues.map((o) => o.values);
    return cartesianProduct(arrays).map((combo) => {
      const attrs: Record<string, string> = {};
      optionsWithValues.forEach((o, i) => {
        attrs[o.name] = combo[i];
      });
      return attrs;
    });
  }, [options]);

  // ── Generate variants on button click ──
  const generateVariants = () => {
    if (generatedCombinations.length === 0) return;

    const optionNames = options
      .filter((o) => o.values.length > 0)
      .map((o) => o.name);

    setVariants((prev) => {
      const newVariants: VariantRow[] = generatedCombinations.map((attrs) => {
        const key = optionKey(attrs, optionNames);
        const existing = prev.find(
          (v) => optionKey(v.attributes, optionNames) === key,
        );
        if (existing) {
          return { ...existing, name: buildVariantName(attrs) };
        }
        return {
          sku: "",
          name: buildVariantName(attrs),
          attributes: attrs,
          price: 0,
          salePrice: undefined,
          costPrice: undefined,
          stock: 0,
          images: [],
          isActive: true,
        };
      });
      return newVariants;
    });
    setHasGeneratedVariants(true);
  };

  // ── Option management ──
  const addOptionFromLibrary = (attr: AttributeLibraryItem) => {
    if (options.some((o) => o.name === attr.name)) return;
    setOptions((prev) => [
      ...prev,
      {
        attributeId: attr.id,
        name: attr.name,
        values: [...attr.options],
        type: attr.type,
        isColor: attr.type === "color",
      },
    ]);
  };

  const addCustomOption = (name: string) => {
    if (options.some((o) => o.name === name)) return;
    setOptions((prev) => [...prev, { name, values: [] }]);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOptionValues = (index: number, values: string[]) => {
    setOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, values } : o)),
    );
  };

  const addValueToOption = (index: number, value: string) => {
    setOptions((prev) =>
      prev.map((o, i) =>
        i === index && !o.values.includes(value)
          ? { ...o, values: [...o.values, value] }
          : o,
      ),
    );
  };

  const removeValueFromOption = (index: number, valueIndex: number) => {
    setOptions((prev) =>
      prev.map((o, i) =>
        i === index
          ? { ...o, values: o.values.filter((_, vi) => vi !== valueIndex) }
          : o,
      ),
    );
  };

  // ── Specification management ──
  const addSpecFromLibrary = (attr: AttributeLibraryItem) => {
    if (specifications.some((s) => s.key === attr.name)) return;
    setSpecifications((prev) => [...prev, { key: attr.name, value: "" }]);
  };

  const addCustomSpec = (name: string) => {
    if (specifications.some((s) => s.key === name)) return;
    setSpecifications((prev) => [...prev, { key: name, value: "" }]);
  };

  // ── Error helpers ──
  const clearFieldError = (field: string) => {
    setFieldErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const fieldError = (field: string) => fieldErrors[field]?.[0];

  // ── Build payload ──
  const buildPayload = (
    intent: "draft" | "publish" = "publish",
  ): ProductInput => ({
    intent,
    name,
    slug,
    description,
    shortDescription: shortDescription.trim() || undefined,
    category: category || "",
    brand: brand || "",
    images: images.map((img) => img.url),
    attributes: options.map((o) => ({
      name: o.name,
      values: o.values,
      isColor: o.isColor ?? false,
    })),
    specifications: specifications
      .filter((s) => s.key.trim() && s.value.trim())
      .map((s) => ({ key: s.key.trim(), value: s.value.trim() })),
    specificationsDescription: specificationsDescription || "",
    variantDimensions: options
      .filter((o) => o.values.length > 0)
      .map((o) => o.name),
    isActive,
    isFeatured,
    variants: variants.map((v) => ({
      sku: v.sku,
      name: v.name,
      attributes: v.attributes,
      price: v.price,
      salePrice: v.salePrice || undefined,
      costPrice: v.costPrice || undefined,
      stock: v.stock,
      images: v.images.map((img) => img.url),
      isActive: v.isActive,
    })),
    seo: {
      metaTitle: seoMetaTitle.trim() || undefined,
      metaDescription: seoMetaDescription.trim() || undefined,
    },
    content: {
      materialsAndCare: contentMaterialsAndCare.trim() || undefined,
      shippingAndReturns: contentShippingAndReturns.trim() || undefined,
      payment: contentPayment.trim() || undefined,
      installationAndBulbs: contentInstallationAndBulbs.trim() || undefined,
    },
  });

  // ── Submit ──
  const run = (intent: "draft" | "publish" = "publish") => {
    const payload = buildPayload(intent);
    const result = productInputSchema.safeParse(payload);
    if (!result.success) {
      const flattened = result.error.flatten();
      setFieldErrors(
        flattened.fieldErrors as Record<string, string[] | undefined>,
      );
      setFormErrors(flattened.formErrors);
      scrollToFirstError(
        flattened.fieldErrors as Record<string, string[] | undefined>,
      );
      return;
    }

    startTransition(async () => {
      const response: ProductActionResult = isEdit
        ? await updateProduct(editId, payload as unknown)
        : await createProduct(payload as unknown);

      if (!response.ok) {
        setFieldErrors(response.fieldErrors);
        setFormErrors(response.formErrors);
        scrollToFirstError(response.fieldErrors);
        return;
      }

      setFieldErrors({});
      setFormErrors([]);

      setSavedNotice(
        intent === "draft" ? "Draft saved." : "Product published.",
      );
      if (savedNoticeTimer.current) clearTimeout(savedNoticeTimer.current);
      savedNoticeTimer.current = setTimeout(() => setSavedNotice(null), 3000);

      if (!isEdit) {
        router.replace("/admin/products");
      } else {
        router.refresh();
      }
    });
  };

  // ── Suggested attributes from category ──
  const suggestedVariantAttrs = useMemo(() => {
    const activeNames = new Set(options.map((o) => o.name));
    return categoryAttributes.filter(
      (a) => a.isVariant && !activeNames.has(a.name),
    );
  }, [categoryAttributes, options]);

  const suggestedSpecAttrs = useMemo(() => {
    const activeNames = new Set(specifications.map((s) => s.key));
    return categoryAttributes.filter(
      (a) => !a.isVariant && !activeNames.has(a.name),
    );
  }, [categoryAttributes, specifications]);

  const addSuggestedOption = (attr: CategoryAttribute) => {
    if (options.some((o) => o.name === attr.name)) return;
    setOptions((prev) => [
      ...prev,
      {
        attributeId: attr.attributeId,
        name: attr.name,
        values: [...attr.options],
        type: attr.type,
        isColor: attr.type === "color",
      },
    ]);
  };

  const addAllSuggestedOptions = () => {
    const newOptions: OptionDraft[] = suggestedVariantAttrs.map((a) => ({
      attributeId: a.attributeId,
      name: a.name,
      values: [...a.options],
      type: a.type,
      isColor: a.type === "color",
    }));
    if (newOptions.length > 0) {
      setOptions((prev) => [...prev, ...newOptions]);
    }
  };

  const addSuggestedSpec = (attr: CategoryAttribute) => {
    if (specifications.some((s) => s.key === attr.name)) return;
    setSpecifications((prev) => [...prev, { key: attr.name, value: "" }]);
  };

  const addAllSuggestedSpecs = () => {
    const newSpecs: SpecEntry[] = suggestedSpecAttrs.map((a) => ({
      key: a.name,
      value: "",
    }));
    if (newSpecs.length > 0) {
      setSpecifications((prev) => [...prev, ...newSpecs]);
    }
  };

  const existingOptionNames = useMemo(
    () => new Set(options.map((o) => o.name)),
    [options],
  );
  const existingSpecNames = useMemo(
    () => new Set(specifications.map((s) => s.key)),
    [specifications],
  );

  const optionKeys = options
    .filter((o) => o.values.length > 0)
    .map((o) => o.name);
  const optionLabels: Record<string, string> = Object.fromEntries(
    options.map((o) => [o.name, o.name]),
  );
  const optionValues: Record<string, string[]> = Object.fromEntries(
    options.map((o) => [o.name, o.values]),
  );

  const colorOptions = useMemo(() => {
    const colors = new Set<string>();
    for (const option of options) {
      if (option.isColor) {
        colors.add(option.name);
      }
    }
    return colors;
  }, [options]);

  const hasFieldErrors = Object.values(fieldErrors).some(
    (errors) => errors && errors.length > 0,
  );
  const showErrorBanner = formErrors.length > 0 || hasFieldErrors;

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            aria-label="Back to products"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl tracking-tight text-foreground md:text-3xl">
                {isEdit ? "Edit product" : "New product"}
              </h1>
              {isEdit && initialData && (
                <StatusBadge
                  status={
                    initialData.status === "active"
                      ? "active"
                      : initialData.status === "draft"
                        ? "draft"
                        : "archived"
                  }
                />
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit
                ? `/${initialData?.slug ?? ""}`
                : "Create a product to sell in your store."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {savedNotice && (
            <span className="flex items-center gap-1.5 rounded-full border border-chart-2/40 bg-chart-2/10 px-3 py-1 text-xs font-medium text-chart-2">
              <HugeiconsIcon icon={CheckIcon} size={14} />
              {savedNotice}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => run("draft")}
            disabled={isPending}
          >
            <HugeiconsIcon icon={SaveIcon} size={16} />
            {isPending ? "Saving\u2026" : "Save draft"}
          </Button>
          <Button
            type="button"
            onClick={() => run("publish")}
            disabled={isPending}
          >
            <HugeiconsIcon icon={Rocket01Icon} size={16} />
            {isPending ? "Saving\u2026" : isEdit ? "Save & publish" : "Publish"}
          </Button>
        </div>
      </div>

      {showErrorBanner && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <HugeiconsIcon icon={Warning} size={16} className="mt-0.5" />
          <div>
            {formErrors.length > 0 ? (
              formErrors.map((message) => <p key={message}>{message}</p>)
            ) : (
              <p>
                Could not save your product. Please check the highlighted
                fields.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6 *:border-none *:p-0">
          {/* ── 1. Category ── */}
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
              <CardDescription>
                Select a category to load suggested options and specifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2" data-field="category">
                <Label>Category</Label>
                <Select
                  value={category ?? ""}
                  onValueChange={(value) => {
                    setCategory((value as string) || null);
                    clearFieldError("category");
                  }}
                  items={categories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {"\u00A0\u00A0".repeat(cat.level)}
                        {cat.level > 0 ? "\u2514 " : ""}
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError("category") && (
                  <p className="text-xs text-destructive">
                    {fieldError("category")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── 2. Product Information ── */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>
                Basic information about this product.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2" data-field="name">
                <Label htmlFor="name">Name</Label>
                <InputGroup>
                  <InputGroupInput
                    id="name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      clearFieldError("name");
                    }}
                    placeholder="e.g. LED Downlight 10W"
                    aria-invalid={Boolean(fieldError("name"))}
                    maxLength={FIELD_LIMITS.name.medium}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>
                      {name.length}/{FIELD_LIMITS.name.medium}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldError("name") && (
                  <p className="text-xs text-destructive">
                    {fieldError("name")}
                  </p>
                )}
              </div>

              <div className="space-y-2" data-field="slug">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex gap-2">
                  <InputGroup className="flex-1">
                    <InputGroupAddon align="inline-start">
                      <InputGroupText>/products/</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="slug"
                      value={slug}
                      onChange={(event) => {
                        setIsSlugEdited(true);
                        setSlug(slugify(event.target.value));
                      }}
                      placeholder="auto-generated-from-name"
                      aria-invalid={Boolean(fieldError("slug"))}
                      className="font-mono text-sm"
                    />
                  </InputGroup>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => {
                      setSlug(slugify(name));
                      setIsSlugEdited(false);
                    }}
                    title="Regenerate slug from name"
                  >
                    <HugeiconsIcon icon={Refresh01Icon} size={16} />
                  </Button>
                </div>
                {fieldError("slug") ? (
                  <p className="text-xs text-destructive">
                    {fieldError("slug")}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    URL-friendly identifier. Auto-generated from name.
                  </p>
                )}
              </div>

              <div className="space-y-2" data-field="description">
                <Label htmlFor="description">Description</Label>
                <InputGroup className="min-h-[8rem]">
                  <InputGroupTextarea
                    id="description"
                    value={description}
                    onChange={(event) => {
                      setDescription(event.target.value);
                      clearFieldError("description");
                    }}
                    placeholder="Detailed product description..."
                    aria-invalid={Boolean(fieldError("description"))}
                  />
                </InputGroup>
                {fieldError("description") && (
                  <p className="text-xs text-destructive">
                    {fieldError("description")}
                  </p>
                )}
              </div>

              <div className="space-y-2" data-field="shortDescription">
                <Label htmlFor="short-description">Short description</Label>
                <InputGroup>
                  <InputGroupInput
                    id="short-description"
                    value={shortDescription}
                    onChange={(event) => {
                      setShortDescription(event.target.value);
                      clearFieldError("shortDescription");
                    }}
                    placeholder="Brief summary for listings..."
                    aria-invalid={Boolean(fieldError("shortDescription"))}
                    maxLength={FIELD_LIMITS.description.short}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>
                      {shortDescription.length}/{FIELD_LIMITS.description.short}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldError("shortDescription") && (
                  <p className="text-xs text-destructive">
                    {fieldError("shortDescription")}
                  </p>
                )}
              </div>

              <div className="space-y-2" data-field="images">
                <Label>Product images</Label>
                <ImageDropzone
                  value={images[0] ?? null}
                  onChange={(img) => {
                    if (img) {
                      setImages((previous) =>
                        previous.length > 0
                          ? [img, ...previous.slice(1)]
                          : [img],
                      );
                    } else {
                      setImages([]);
                    }
                    clearFieldError("images");
                  }}
                  upload={uploadShopImage}
                  deleteImage={deleteShopImage}
                  emptyLabel="Primary product image"
                />
                {fieldError("images") && (
                  <p className="text-xs text-destructive">
                    {fieldError("images")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── 3. Variant Options ── */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Variant Options</CardTitle>
                  <CardDescription>
                    Options determine the different variants of this product.
                    {isLoadingAttributes && (
                      <span className="ml-1 inline-flex items-center gap-1 text-xs">
                        <HugeiconsIcon
                          icon={Loading02Icon}
                          size={12}
                          className="animate-spin"
                        />
                        Loading...
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddOptionDialogOpen(true)}
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={14} />
                  Add option
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestedVariantAttrs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Suggested from category
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={addAllSuggestedOptions}
                    >
                      <HugeiconsIcon icon={PlusSignIcon} size={12} />
                      Add all
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedVariantAttrs.map((attr) => (
                      <button
                        key={attr.attributeId}
                        type="button"
                        onClick={() => addSuggestedOption(attr)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                      >
                        <HugeiconsIcon icon={PlusSignIcon} size={10} />
                        {attr.name}
                        <span className="text-[10px] opacity-60 capitalize">{attr.type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {options.length === 0 && suggestedVariantAttrs.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No options yet.{" "}
                    {category
                      ? "Add options to define product variants."
                      : "Select a category first, or add options manually."}
                  </p>
                </div>
              ) : options.length === 0 ? null : (
                options.map((option, index) => (
                  <div
                    key={`${option.name}-${index}`}
                    className="rounded-lg border border-border p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-medium text-sm">
                        {option.name}
                        {option.isColor && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            Color
                          </span>
                        )}
                        {option.type && !option.isColor && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
                            {option.type}
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setAddValueDialogIndex(index)}
                        >
                          <HugeiconsIcon icon={PlusSignIcon} size={14} />
                          Add value
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeOption(index)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={14} />
                        </Button>
                      </div>
                    </div>

                    {option.isColor ? (
                      <div className="space-y-3">
                        <ColorPicker
                          value=""
                          onChange={(hex) => {
                            if (hex && !option.values.includes(hex)) {
                              addValueToOption(index, hex);
                            }
                          }}
                        />
                        {option.values.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {option.values.map((value, vi) => (
                              <span
                                key={value}
                                className="inline-flex items-center gap-1.5 rounded-full border bg-muted pl-1 pr-2.5 py-0.5 text-xs"
                              >
                                <ColorSwatch color={value} size="xs" />
                                {value}
                                <button
                                  type="button"
                                  onClick={() => removeValueFromOption(index, vi)}
                                  className="ml-0.5 text-muted-foreground hover:text-destructive"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {option.values.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {option.values.map((value, vi) => (
                              <span
                                key={value}
                                className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs"
                              >
                                {value}
                                <button
                                  type="button"
                                  onClick={() => removeValueFromOption(index, vi)}
                                  className="ml-0.5 text-muted-foreground hover:text-destructive"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        <OptionValueInput
                          onAdd={(value) => addValueToOption(index, value)}
                          placeholder={`Add ${option.name.toLowerCase()} value`}
                        />
                      </>
                    )}
                  </div>
                ))
              )}

              {options.length > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div>
                    {generatedCombinations.length > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {generatedCombinations.length}
                        </span>{" "}
                        variant{generatedCombinations.length !== 1 ? "s" : ""}{" "}
                        will be generated.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Add values to options to define variants.
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={generateVariants}
                    disabled={generatedCombinations.length === 0}
                  >
                    <HugeiconsIcon icon={SparklesIcon} size={14} />
                    Generate variants
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── 4. Variants ── */}
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>
                {hasGeneratedVariants
                  ? "Edit SKU, price, stock and images for each variant."
                  : "Generate variants from options above to configure SKU, price and stock."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VariantTable
                variants={variants}
                optionKeys={optionKeys}
                optionLabels={optionLabels}
                optionValues={optionValues}
                colorOptions={colorOptions}
                onChange={setVariants}
                upload={uploadShopImage}
                deleteImage={deleteShopImage}
              />
            </CardContent>
          </Card>

          {/* ── 5. Specifications ── */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Specifications</CardTitle>
                  <CardDescription>
                    Describe product attributes that don't generate variants.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddSpecDialogOpen(true)}
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={14} />
                  Add specification
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {suggestedSpecAttrs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Suggested from category
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={addAllSuggestedSpecs}
                    >
                      <HugeiconsIcon icon={PlusSignIcon} size={12} />
                      Add all
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedSpecAttrs.map((attr) => (
                      <button
                        key={attr.attributeId}
                        type="button"
                        onClick={() => addSuggestedSpec(attr)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                      >
                        <HugeiconsIcon icon={PlusSignIcon} size={10} />
                        {attr.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <SpecsEditor
                value={specifications}
                onChange={setSpecifications}
                suggestedSpecs={categoryAttributes
                  .filter((a) => !a.isVariant)
                  .map((a) => ({ key: a.name, name: a.name, type: a.type }))}
              />

              <div className="space-y-2">
                <Label>Specifications Description</Label>
                <p className="text-xs text-muted-foreground">
                  Rich text description for the specifications section.
                </p>
                <RichTextEditor
                  value={specificationsDescription ? (() => {
                    try {
                      return JSON.parse(specificationsDescription);
                    } catch {
                      return specificationsDescription;
                    }
                  })() : undefined}
                  onChange={(json) => {
                    setSpecificationsDescription(JSON.stringify(json));
                  }}
                  placeholder="Add a detailed specifications description..."
                  editorClassName="max-h-60"
                />
              </div>
            </CardContent>
          </Card>

          {/* ── 6. Content ── */}
          <Card>
            <CardHeader>
              <CardTitle>Content (Optional)</CardTitle>
              <CardDescription>
                Product information displayed on the storefront.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2" data-field="content.materialsAndCare">
                <Label htmlFor="content-materials-care">
                  Materials &amp; Care
                </Label>
                <InputGroup className="min-h-[5rem]">
                  <InputGroupTextarea
                    id="content-materials-care"
                    value={contentMaterialsAndCare}
                    onChange={(event) => {
                      setContentMaterialsAndCare(event.target.value);
                      clearFieldError("content.materialsAndCare");
                    }}
                    placeholder="e.g. Solid brass construction. Wipe clean with a soft, dry cloth."
                    maxLength={FIELD_LIMITS.content.materialsAndCare}
                    aria-invalid={Boolean(
                      fieldError("content.materialsAndCare"),
                    )}
                  />
                  <InputGroupAddon
                    align="block-end"
                    className="border-t border-border"
                  >
                    <InputGroupText>
                      {contentMaterialsAndCare.length}/
                      {FIELD_LIMITS.content.materialsAndCare}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldError("content.materialsAndCare") && (
                  <p className="text-xs text-destructive">
                    {fieldError("content.materialsAndCare")}
                  </p>
                )}
              </div>

              <div
                className="space-y-2"
                data-field="content.shippingAndReturns"
              >
                <Label htmlFor="content-shipping-returns">
                  Shipping &amp; Returns
                </Label>
                <InputGroup className="min-h-[5rem]">
                  <InputGroupTextarea
                    id="content-shipping-returns"
                    value={contentShippingAndReturns}
                    onChange={(event) => {
                      setContentShippingAndReturns(event.target.value);
                      clearFieldError("content.shippingAndReturns");
                    }}
                    placeholder="e.g. Free shipping on orders over $50. Returns accepted within 30 days."
                    maxLength={FIELD_LIMITS.content.shippingAndReturns}
                    aria-invalid={Boolean(
                      fieldError("content.shippingAndReturns"),
                    )}
                  />
                  <InputGroupAddon
                    align="block-end"
                    className="border-t border-border"
                  >
                    <InputGroupText>
                      {contentShippingAndReturns.length}/
                      {FIELD_LIMITS.content.shippingAndReturns}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldError("content.shippingAndReturns") && (
                  <p className="text-xs text-destructive">
                    {fieldError("content.shippingAndReturns")}
                  </p>
                )}
              </div>

              <div className="space-y-2" data-field="content.payment">
                <Label htmlFor="content-payment">Payment</Label>
                <InputGroup className="min-h-[5rem]">
                  <InputGroupTextarea
                    id="content-payment"
                    value={contentPayment}
                    onChange={(event) => {
                      setContentPayment(event.target.value);
                      clearFieldError("content.payment");
                    }}
                    placeholder="e.g. We accept all major credit cards, PayPal, and bank transfers."
                    maxLength={FIELD_LIMITS.content.payment}
                    aria-invalid={Boolean(fieldError("content.payment"))}
                  />
                  <InputGroupAddon
                    align="block-end"
                    className="border-t border-border"
                  >
                    <InputGroupText>
                      {contentPayment.length}/{FIELD_LIMITS.content.payment}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldError("content.payment") && (
                  <p className="text-xs text-destructive">
                    {fieldError("content.payment")}
                  </p>
                )}
              </div>

              <div
                className="space-y-2"
                data-field="content.installationAndBulbs"
              >
                <Label htmlFor="content-installation-bulbs">
                  Installation &amp; Bulbs
                </Label>
                <InputGroup className="min-h-[5rem]">
                  <InputGroupTextarea
                    id="content-installation-bulbs"
                    value={contentInstallationAndBulbs}
                    onChange={(event) => {
                      setContentInstallationAndBulbs(event.target.value);
                      clearFieldError("content.installationAndBulbs");
                    }}
                    placeholder="e.g. Hardwire installation. Uses 1x E27 bulb (not included). Max 10W."
                    maxLength={FIELD_LIMITS.content.installationAndBulbs}
                    aria-invalid={Boolean(
                      fieldError("content.installationAndBulbs"),
                    )}
                  />
                  <InputGroupAddon
                    align="block-end"
                    className="border-t border-border"
                  >
                    <InputGroupText>
                      {contentInstallationAndBulbs.length}/
                      {FIELD_LIMITS.content.installationAndBulbs}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldError("content.installationAndBulbs") && (
                  <p className="text-xs text-destructive">
                    {fieldError("content.installationAndBulbs")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ── */}
        <div className="min-w-0 space-y-6 lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>Assign a brand.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2" data-field="brand">
                <Label>Brand</Label>
                <Select
                  value={brand ?? ""}
                  onValueChange={(value) => {
                    setBrand((value as string) || null);
                    clearFieldError("brand");
                  }}
                  items={brands.map((b) => ({
                    value: b.id,
                    label: b.name,
                  }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError("brand") && (
                  <p className="text-xs text-destructive">
                    {fieldError("brand")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>
                Visibility and display settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <div className="flex-1">
                  <Label className="cursor-pointer font-medium">Active</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Inactive products are hidden from the storefront.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                <div className="flex-1">
                  <Label className="cursor-pointer font-medium">Featured</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Featured products are highlighted on the storefront.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO (Optional)</CardTitle>
              <CardDescription>
                Override metadata for search engines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2" data-field="seo.metaTitle">
                <Label htmlFor="seo-meta-title">Meta Title</Label>
                <InputGroup>
                  <InputGroupInput
                    id="seo-meta-title"
                    value={seoMetaTitle}
                    onChange={(event) => {
                      setSeoMetaTitle(event.target.value);
                      clearFieldError("seo.metaTitle");
                    }}
                    placeholder={name || "Auto-generated from name"}
                    maxLength={FIELD_LIMITS.seo.metaTitle}
                    aria-invalid={Boolean(fieldError("seo.metaTitle"))}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>
                      {seoMetaTitle.length}/{FIELD_LIMITS.seo.metaTitle}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldError("seo.metaTitle") && (
                  <p className="text-xs text-destructive">
                    {fieldError("seo.metaTitle")}
                  </p>
                )}
              </div>

              <div className="space-y-2" data-field="seo.metaDescription">
                <Label htmlFor="seo-meta-description">
                  Meta Description
                </Label>
                <InputGroup className="min-h-[5rem]">
                  <InputGroupTextarea
                    id="seo-meta-description"
                    value={seoMetaDescription}
                    onChange={(event) => {
                      setSeoMetaDescription(event.target.value);
                      clearFieldError("seo.metaDescription");
                    }}
                    placeholder={
                      description.slice(0, 155) ||
                      "Auto-generated from description"
                    }
                    maxLength={FIELD_LIMITS.seo.metaDescription}
                    aria-invalid={Boolean(fieldError("seo.metaDescription"))}
                  />
                  <InputGroupAddon
                    align="block-end"
                    className="border-t border-border"
                  >
                    <InputGroupText>
                      {seoMetaDescription.length}/
                      {FIELD_LIMITS.seo.metaDescription}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldError("seo.metaDescription") && (
                  <p className="text-xs text-destructive">
                    {fieldError("seo.metaDescription")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Dialogs ── */}

      <AddAttributeDialog
        open={addOptionDialogOpen}
        onOpenChange={setAddOptionDialogOpen}
        title="Add option"
        existingNames={existingOptionNames}
        onAdd={addOptionFromLibrary}
        onCreateNew={addCustomOption}
      />

      <AddAttributeDialog
        open={addSpecDialogOpen}
        onOpenChange={setAddSpecDialogOpen}
        title="Add specification"
        existingNames={existingSpecNames}
        onAdd={addSpecFromLibrary}
        onCreateNew={addCustomSpec}
      />

      {addValueDialogIndex !== null && (
        <AddOptionValueDialog
          open={addValueDialogIndex !== null}
          onOpenChange={(open) => {
            if (!open) setAddValueDialogIndex(null);
          }}
          predefinedValues={
            options[addValueDialogIndex]
              ? (() => {
                  const catAttr = categoryAttributes.find(
                    (a) =>
                      a.name === options[addValueDialogIndex].name &&
                      a.isVariant,
                  );
                  return catAttr?.options ?? [];
                })()
              : []
          }
          existingValues={options[addValueDialogIndex]?.values ?? []}
          onAddValues={(values) => {
            if (addValueDialogIndex !== null) {
              const existing = options[addValueDialogIndex].values;
              const newValues = values.filter((v) => !existing.includes(v));
              updateOptionValues(addValueDialogIndex, values);
            }
          }}
        />
      )}

    </div>
  );
}
