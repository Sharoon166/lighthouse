"use client";

import {
  ArrowLeft02Icon,
  CheckIcon,
  Delete02Icon,
  Loading02Icon,
  PlusSignIcon,
  Rocket01Icon,
  SaveIcon,
  Warning,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
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
import {
  createProduct,
  type Product,
  type ProductActionResult,
  updateProduct,
} from "../actions/product-actions";
import { type ProductInput, productInputSchema } from "../validation/product";

interface ProductAttribute {
  name: string;
  values: string[];
  isColor: boolean;
}

interface ProductVariant {
  _id?: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  images: Array<{ url: string; publicId: string }>;
  isActive: boolean;
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

function scrollToFirstError(fieldErrors: {
  [key: string]: string[] | undefined;
}) {
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

function EmptyVariant(): ProductVariant {
  return {
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
}

function validateVariant(
  variant: ProductVariant,
  attributes: ProductAttribute[],
): string[] {
  const errors: string[] = [];
  if (!variant.sku.trim()) errors.push("SKU is required");
  if (!variant.name.trim()) errors.push("Variant name is required");
  if (variant.price < 0) errors.push("Price must be 0 or greater");
  for (const attr of attributes) {
    if (!variant.attributes[attr.name]) {
      errors.push(`${attr.name} is required`);
    }
  }
  return errors;
}

const PRESET_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#FFC0CB",
  "#A52A2A",
  "#808080",
  "#FFD700",
  "#4B0082",
];

export function ProductForm({
  mode = "create",
  id,
  initialData = null,
  categories = [],
  brands = [],
}: ProductFormProps) {
  const isEdit = mode === "edit";
  const router = useRouter();

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [isSlugEdited, setIsSlugEdited] = useState(isEdit);
  const [description, setDescription] = useState(
    initialData?.description ?? "",
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
  const [isFeatured, setIsFeatured] = useState(false);
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
  const [specifications, setSpecifications] = useState<
    Array<{ key: string; value: string }>
  >(
    initialData?.specifications?.map((s) => ({
      key: s.key,
      value: s.value,
    })) ?? [],
  );

  const [attributes, setAttributes] = useState<ProductAttribute[]>(
    initialData?.variantAttributes?.length
      ? initialData.variantAttributes.map((attrName) => {
          const baseVal = initialData.baseAttributes?.get?.(attrName) ?? "";
          return {
            name: String(attrName),
            values: baseVal ? baseVal.split(",").map((v) => v.trim()) : [],
            isColor: /color|colour|farb/i.test(String(attrName)),
          };
        })
      : [],
  );
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrValue, setNewAttrValue] = useState("");
  const [editingAttrIndex, setEditingAttrIndex] = useState<number | null>(null);

  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants?.map((v) => ({
      _id: v._id ? String(v._id) : undefined,
      sku: v.sku,
      name: v.title ?? "",
      attributes: Object.fromEntries(
        v.attributes instanceof Map
          ? v.attributes.entries()
          : typeof v.attributes === "object" && v.attributes !== null
            ? Object.entries(v.attributes as Record<string, string>)
            : [],
      ),
      price: v.price,
      salePrice: v.salePrice ?? undefined,
      costPrice: undefined,
      stock: v.stock,
      images: (v.images ?? []).map((img) => ({
        url: img,
        publicId: img,
      })),
      isActive: v.isActive ?? true,
    })) ?? [EmptyVariant()],
  );
  const [variantIndex, setVariantIndex] = useState(0);

  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string[] | undefined;
  }>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const savedNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isSlugEdited) {
      setSlug(slugify(name));
    }
  }, [name, isSlugEdited]);

  useEffect(() => {
    return () => {
      if (savedNoticeTimer.current) clearTimeout(savedNoticeTimer.current);
    };
  }, []);

  const clearFieldError = (field: string) => {
    setFieldErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const fieldError = (field: string) => fieldErrors[field]?.[0];

  const editId = id ?? "";

  const currentVariantErrors = useMemo(
    () =>
      variants[variantIndex]
        ? validateVariant(variants[variantIndex], attributes)
        : [],
    [variantIndex, variants, attributes],
  );

  const canAddVariant =
    currentVariantErrors.length === 0 && variants[variantIndex];

  const addAttribute = () => {
    if (!newAttrName.trim()) return;
    if (attributes.some((a) => a.name === newAttrName.trim())) return;
    setAttributes((prev) => [
      ...prev,
      {
        name: newAttrName.trim(),
        values: [],
        isColor: /color|colour|farb/i.test(newAttrName),
      },
    ]);
    setNewAttrName("");
    setEditingAttrIndex(attributes.length);
  };

  const addValueToAttribute = (attrIndex: number) => {
    if (!newAttrValue.trim()) return;
    setAttributes((prev) =>
      prev.map((attr, i) =>
        i === attrIndex && !attr.values.includes(newAttrValue.trim())
          ? { ...attr, values: [...attr.values, newAttrValue.trim()] }
          : attr,
      ),
    );
    setNewAttrValue("");
  };

  const removeAttribute = (attrIndex: number) => {
    const attrName = attributes[attrIndex]?.name;
    setAttributes((prev) => prev.filter((_, i) => i !== attrIndex));
    setVariants((prev) =>
      prev.map((v) => {
        const next = { ...v.attributes };
        delete next[attrName];
        return { ...v, attributes: next };
      }),
    );
    if (editingAttrIndex === attrIndex) setEditingAttrIndex(null);
  };

  const removeValueFromAttribute = (attrIndex: number, valueIndex: number) => {
    setAttributes((prev) =>
      prev.map((attr, i) =>
        i === attrIndex
          ? {
              ...attr,
              values: attr.values.filter((_, vi) => vi !== valueIndex),
            }
          : attr,
      ),
    );
  };

  const buildPayload = (
    intent: "draft" | "publish" = "publish",
  ): ProductInput => ({
    intent,
    name,
    slug,
    description,
    shortDescription: undefined,
    category: category || "",
    brand: brand || "",
    images: images.map((img) => img.url),
    attributes: attributes.map((a) => ({
      name: a.name,
      values: a.values,
      isColor: a.isColor,
    })),
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
      installationAndBulbs:
        contentInstallationAndBulbs.trim() || undefined,
    },
    specifications: specifications.filter(
      (s) => s.key.trim() && s.value.trim(),
    ),
  });

  const run = (intent: "draft" | "publish" = "publish") => {
    const result = productInputSchema.safeParse(buildPayload(intent));
    if (!result.success) {
      const flattened = result.error.flatten();
      setFieldErrors(
        flattened.fieldErrors as { [key: string]: string[] | undefined },
      );
      setFormErrors(flattened.formErrors);
      scrollToFirstError(
        flattened.fieldErrors as { [key: string]: string[] | undefined },
      );
      return;
    }

    startTransition(async () => {
      const payload = JSON.parse(
        JSON.stringify(buildPayload(intent)),
      ) as unknown;
      const response: ProductActionResult = isEdit
        ? await updateProduct(editId, payload)
        : await createProduct(payload);

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

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value:
      | string
      | number
      | boolean
      | Record<string, string>
      | Array<{ url: string; publicId: string }>
      | undefined,
  ) => {
    setVariants((previous) =>
      previous.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const setVariantAttribute = (
    variantIdx: number,
    attrName: string,
    value: string,
  ) => {
    setVariants((previous) =>
      previous.map((variant, i) =>
        i === variantIdx
          ? {
              ...variant,
              attributes: { ...variant.attributes, [attrName]: value },
            }
          : variant,
      ),
    );
  };

  const addVariant = () => {
    if (!canAddVariant) return;
    setVariants((previous) => [...previous, EmptyVariant()]);
    setVariantIndex(variants.length);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants((previous) => previous.filter((_, i) => i !== index));
    setVariantIndex(Math.max(0, index - 1));
  };

  const hasFieldErrors = Object.values(fieldErrors).some(
    (errors) => errors && errors.length > 0,
  );
  const showErrorBanner = formErrors.length > 0 || hasFieldErrors;

  return (
    <div className="space-y-8">
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
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
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
                <InputGroup>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>
                Upload product images. The first image is the primary fallback
                for variants without their own images.
              </CardDescription>
            </CardHeader>
            <CardContent>
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

          <Card>
            <CardHeader>
              <CardTitle>Attributes</CardTitle>
              <CardDescription>
                Define product attributes like Color, Wattage, etc. These
                determine the variant combinations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {attributes.map((attr, attrIndex) => (
                <div
                  key={attr.name}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {attr.isColor && (
                        <span className="size-4 rounded-full border bg-gray-200" />
                      )}
                      <span className="font-medium text-sm">{attr.name}</span>
                      {attr.isColor && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          Color
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditingAttrIndex(
                            editingAttrIndex === attrIndex ? null : attrIndex,
                          )
                        }
                      >
                        {editingAttrIndex === attrIndex
                          ? "Done"
                          : "Edit values"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeAttribute(attrIndex)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={14} />
                      </Button>
                    </div>
                  </div>

                  {editingAttrIndex === attrIndex ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {attr.values.map((value, vi) => (
                          <span
                            key={value}
                            className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs"
                          >
                            {attr.isColor && (
                              <span
                                className="size-3 rounded-full border"
                                style={{ backgroundColor: value }}
                              />
                            )}
                            {value}
                            <button
                              type="button"
                              onClick={() =>
                                removeValueFromAttribute(attrIndex, vi)
                              }
                              className="ml-0.5 text-muted-foreground hover:text-destructive"
                            >
                              x
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newAttrValue}
                          onChange={(event) =>
                            setNewAttrValue(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              addValueToAttribute(attrIndex);
                            }
                          }}
                          placeholder={
                            attr.isColor
                              ? "Enter color name or hex"
                              : `Add value to ${attr.name}`
                          }
                          className="h-8 text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addValueToAttribute(attrIndex)}
                        >
                          Add
                        </Button>
                      </div>
                      {attr.isColor && (
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              title={color}
                              onClick={() => {
                                setAttributes((prev) =>
                                  prev.map((a, i) =>
                                    i === attrIndex && !a.values.includes(color)
                                      ? { ...a, values: [...a.values, color] }
                                      : a,
                                  ),
                                );
                              }}
                              className="size-6 rounded-full border-2 border-border hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {attr.values.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          No values defined. Click edit to add.
                        </span>
                      ) : (
                        attr.values.map((value) => (
                          <span
                            key={value}
                            className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-xs"
                          >
                            {attr.isColor && (
                              <span
                                className="size-2.5 rounded-full border"
                                style={{ backgroundColor: value }}
                              />
                            )}
                            {value}
                          </span>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  value={newAttrName}
                  onChange={(event) => setNewAttrName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addAttribute();
                    }
                  }}
                  placeholder="New attribute name (e.g. Color)"
                  className="h-9 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAttribute}
                  disabled={!newAttrName.trim()}
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={14} />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>
                Define variations of this product. Fill in all attributes, SKU,
                price and stock for each variant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {variants.map((variant, index) => {
                  const errors = validateVariant(variant, attributes);
                  return (
                    <button
                      key={`variant-${index}`}
                      type="button"
                      onClick={() => setVariantIndex(index)}
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                        index === variantIndex
                          ? "border-primary bg-primary text-primary-foreground"
                          : errors.length > 0
                            ? "border-destructive/50 bg-destructive/5 text-foreground"
                            : "border-border bg-background hover:bg-muted"
                      }`}
                    >
                      {variant.name || `Variant ${index + 1}`}
                      {errors.length > 0 && (
                        <span className="size-1.5 rounded-full bg-destructive" />
                      )}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={addVariant}
                  disabled={!canAddVariant}
                  className="flex items-center gap-1 rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={14} />
                  Add
                </button>
              </div>

              {!canAddVariant && variants.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  Complete the current variant before adding another.
                </p>
              )}

              {variants[variantIndex] && (
                <div className="rounded-lg border p-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div
                      className="space-y-2"
                      data-field={`variants.${variantIndex}.name`}
                    >
                      <Label>Variant name</Label>
                      <Input
                        value={variants[variantIndex].name}
                        onChange={(event) =>
                          updateVariant(
                            variantIndex,
                            "name",
                            event.target.value,
                          )
                        }
                        placeholder="e.g. Cool White 10W"
                      />
                    </div>

                    <div
                      className="space-y-2"
                      data-field={`variants.${variantIndex}.sku`}
                    >
                      <Label>SKU</Label>
                      <Input
                        value={variants[variantIndex].sku}
                        onChange={(event) =>
                          updateVariant(variantIndex, "sku", event.target.value)
                        }
                        placeholder="e.g. LED-10W-CW"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>

                  {attributes.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">
                        Attributes
                      </Label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {attributes.map((attr) => (
                          <div key={attr.name} className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              {attr.name}
                              {attr.isColor && " (Color)"}
                            </Label>
                            {attr.isColor ? (
                              <div className="flex flex-wrap gap-1.5">
                                {attr.values.map((value) => (
                                  <button
                                    key={value}
                                    type="button"
                                    title={value}
                                    onClick={() =>
                                      setVariantAttribute(
                                        variantIndex,
                                        attr.name,
                                        value,
                                      )
                                    }
                                    className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${
                                      variants[variantIndex].attributes[
                                        attr.name
                                      ] === value
                                        ? "border-primary ring-2 ring-primary/30 scale-110"
                                        : "border-border"
                                    }`}
                                    style={{ backgroundColor: value }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <Select
                                value={
                                  variants[variantIndex].attributes[
                                    attr.name
                                  ] ?? ""
                                }
                                onValueChange={(value) =>
                                  setVariantAttribute(
                                    variantIndex,
                                    attr.name,
                                    value as string,
                                  )
                                }
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue
                                    placeholder={`Select ${attr.name}`}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {attr.values.map((value) => (
                                    <SelectItem key={value} value={value}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div
                      className="space-y-2"
                      data-field={`variants.${variantIndex}.price`}
                    >
                      <Label>Price</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={variants[variantIndex].price}
                        onChange={(event) =>
                          updateVariant(
                            variantIndex,
                            "price",
                            Number(event.target.value),
                          )
                        }
                      />
                    </div>

                    <div
                      className="space-y-2"
                      data-field={`variants.${variantIndex}.salePrice`}
                    >
                      <Label>Sale price</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={variants[variantIndex].salePrice ?? ""}
                        onChange={(event) =>
                          updateVariant(
                            variantIndex,
                            "salePrice",
                            event.target.value
                              ? Number(event.target.value)
                              : undefined,
                          )
                        }
                        placeholder="Optional"
                      />
                    </div>

                    <div
                      className="space-y-2"
                      data-field={`variants.${variantIndex}.stock`}
                    >
                      <Label>Stock</Label>
                      <Input
                        type="number"
                        min={0}
                        value={variants[variantIndex].stock}
                        onChange={(event) =>
                          updateVariant(
                            variantIndex,
                            "stock",
                            Number(event.target.value),
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Variant images (optional)</Label>
                    <p className="text-xs text-muted-foreground">
                      Falls back to the primary product image if empty.
                    </p>
                    <ImageDropzone
                      value={variants[variantIndex].images[0] ?? null}
                      onChange={(img) => {
                        if (img) {
                          updateVariant(variantIndex, "images", [
                            img,
                            ...variants[variantIndex].images.slice(1),
                          ]);
                        } else {
                          updateVariant(variantIndex, "images", []);
                        }
                      }}
                      upload={uploadShopImage}
                      deleteImage={deleteShopImage}
                      emptyLabel="Variant image"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={variants[variantIndex].isActive}
                      onCheckedChange={(checked) =>
                        updateVariant(variantIndex, "isActive", checked)
                      }
                    />
                    <Label className="cursor-pointer">Active</Label>
                  </div>
                </div>
              )}

              {variants.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeVariant(variantIndex)}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={16} />
                  Remove variant
                </Button>
              )}
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Specifications (Optional)</CardTitle>
                  <CardDescription>
                    Technical details displayed as a key-value table.
                  </CardDescription>
                </div>
                <span className="text-xs text-muted-foreground">
                  {specifications.length}/{FIELD_LIMITS.specification.maxCount}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {fieldError("specifications") && (
                <p className="text-xs text-destructive">
                  {fieldError("specifications")}
                </p>
              )}

              {specifications.map((spec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="grid flex-1 grid-cols-2 gap-2">
                    <InputGroup>
                      <InputGroupInput
                        value={spec.key}
                        onChange={(event) => {
                          const value = event.target.value;
                          setSpecifications((prev) =>
                            prev.map((s, i) =>
                              i === index ? { ...s, key: value } : s,
                            ),
                          );
                        }}
                        placeholder="Name (e.g. Material)"
                        maxLength={FIELD_LIMITS.specification.key}
                      />
                    </InputGroup>
                    <InputGroup>
                      <InputGroupInput
                        value={spec.value}
                        onChange={(event) => {
                          const value = event.target.value;
                          setSpecifications((prev) =>
                            prev.map((s, i) =>
                              i === index ? { ...s, value: value } : s,
                            ),
                          );
                        }}
                        placeholder="Value (e.g. Solid brass)"
                        maxLength={FIELD_LIMITS.specification.value}
                      />
                    </InputGroup>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setSpecifications((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                  </Button>
                </div>
              ))}

              {specifications.length < FIELD_LIMITS.specification.maxCount && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    setSpecifications((prev) => [...prev, { key: "", value: "" }])
                  }
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={14} className="me-1.5" />
                  Add specification
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-6 lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>Assign categories and brands.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label htmlFor="seo-meta-description">Meta Description</Label>
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
    </div>
  );
}
