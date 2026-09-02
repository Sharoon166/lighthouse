"use client";

import {
  ArrowLeft02Icon,
  CheckIcon,
  Delete02Icon,
  PlusSignIcon,
  SaveIcon,
  Warning,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
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
import { createAttributeDefinition } from "../actions/attribute-definition-actions";
import {
  type Category,
  type CategoryActionResult,
  createCategory,
  updateCategory,
} from "../actions/category-actions";
import { deleteShopImage, uploadShopImage } from "../actions/image-actions";
import {
  type CategoryInput,
  categoryInputSchema,
} from "../validation/category";
import {
  AddAttributeDialog,
  type AttributeLibraryItem,
} from "./add-attribute-dialog";

interface CategoryAttributeAssignmentUI {
  attributeId: string;
  required: boolean;
  isVariant: boolean;
  sortOrder: number;
}

interface CategoryFormProps {
  mode?: "create" | "edit";
  id?: string;
  initialData?: Category | null;
  allCategories?: Array<{
    id: string;
    name: string;
    slug: string;
    level: number;
    parent: string | null;
  }>;
  allAttributes?: Array<{
    id: string;
    key: string;
    name: string;
    type: string;
    options: string[];
    isActive?: boolean;
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

export function CategoryForm({
  mode = "create",
  id,
  initialData = null,
  allCategories = [],
  allAttributes = [],
}: CategoryFormProps) {
  const isEdit = mode === "edit";
  const router = useRouter();

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [isSlugEdited, setIsSlugEdited] = useState(isEdit);
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [image, setImage] = useState<{
    url: string;
    publicId: string;
  } | null>(
    initialData?.image
      ? { url: initialData.image, publicId: initialData.image }
      : null,
  );
  const [parent, setParent] = useState<string | null>(
    initialData?.parent ? String(initialData.parent) : null,
  );
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [categoryAttributes, setCategoryAttributes] = useState<
    CategoryAttributeAssignmentUI[]
  >(
    (initialData?.attributes ?? []).map((a) => ({
      attributeId: String(a.attributeId),
      required: a.required,
      isVariant: a.isVariant,
      sortOrder: a.sortOrder,
    })),
  );

  const [seoMetaTitle, setSeoMetaTitle] = useState(
    initialData?.seo?.metaTitle ?? "",
  );
  const [seoMetaDescription, setSeoMetaDescription] = useState(
    initialData?.seo?.metaDescription ?? "",
  );
  const [showParentChangeWarning, setShowParentChangeWarning] = useState(false);

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

  const excludedIds =
    isEdit && initialData
      ? [editId, ...(initialData.ancestors?.map(String) ?? [])]
      : [];

  const parentOptions = allCategories.filter(
    (c) => !excludedIds.includes(c.id),
  );

  const [addAttrDialogOpen, setAddAttrDialogOpen] = useState(false);

  const existingAttrNames = new Set(
    categoryAttributes.map((a) => {
      const def = allAttributes.find((d) => d.id === a.attributeId);
      return def?.name ?? "";
    }),
  );

  const handleAddAttrFromLibrary = (attr: AttributeLibraryItem) => {
    setCategoryAttributes((prev) => [
      ...prev,
      {
        attributeId: attr.id,
        required: false,
        isVariant: false,
        sortOrder: prev.length,
      },
    ]);
  };

  const handleCreateNewAttr = async (name: string) => {
    const result = await createAttributeDefinition({
      name,
      type: "text",
      isActive: true,
      options: [],
      sortOrder: 0,
    });
    if (result.ok) {
      setCategoryAttributes((prev) => [
        ...prev,
        {
          attributeId: result.id,
          required: false,
          isVariant: false,
          sortOrder: prev.length,
        },
      ]);
    }
  };

  const removeAttribute = (index: number) => {
    setCategoryAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAttribute = (
    index: number,
    patch: Partial<CategoryAttributeAssignmentUI>,
  ) => {
    setCategoryAttributes((prev) =>
      prev.map((a, i) => (i === index ? { ...a, ...patch } : a)),
    );
  };

  const buildPayload = (): CategoryInput => ({
    name,
    slug,
    description,
    image: image?.url ?? "",
    parent: parent || null,
    sortOrder,
    isActive,
    attributes: categoryAttributes.map((a) => ({
      attributeId: a.attributeId,
      required: a.required,
      isVariant: a.isVariant,
      sortOrder: a.sortOrder,
    })),
    seo: {
      metaTitle: seoMetaTitle.trim() || undefined,
      metaDescription: seoMetaDescription.trim() || undefined,
    },
  });

  const run = () => {
    const result = categoryInputSchema.safeParse(buildPayload());
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
      const payload = JSON.parse(JSON.stringify(buildPayload())) as unknown;
      const response: CategoryActionResult = isEdit
        ? await updateCategory(editId, payload)
        : await createCategory(payload);

      if (!response.ok) {
        setFieldErrors(response.fieldErrors);
        setFormErrors(response.formErrors);
        scrollToFirstError(response.fieldErrors);
        return;
      }

      setFieldErrors({});
      setFormErrors([]);

      setSavedNotice("Category saved.");
      if (savedNoticeTimer.current) clearTimeout(savedNoticeTimer.current);
      savedNoticeTimer.current = setTimeout(() => setSavedNotice(null), 3000);

      if (!isEdit) {
        router.replace("/admin/categories");
      } else {
        router.refresh();
      }
    });
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
            href="/admin/categories"
            aria-label="Back to categories"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl tracking-tight text-foreground md:text-3xl">
                {isEdit ? "Edit category" : "New category"}
              </h1>
              {isEdit && initialData && (
                <StatusBadge
                  status={initialData.isActive ? "active" : "archived"}
                />
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit
                ? `/${initialData?.slug ?? ""}`
                : "Create a category to organize your products."}
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
          <Button type="button" disabled={isPending} onClick={run}>
            <HugeiconsIcon icon={SaveIcon} size={16} />
            {isPending ? "Saving\u2026" : "Save"}
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
              <ul className="list-disc pl-4">
                {Object.entries(fieldErrors)
                  .filter(([, errors]) => errors && errors.length > 0)
                  .map(([field, errors]) =>
                    errors!.map((message) => (
                      <li key={`${field}-${message}`}>{message}</li>
                    )),
                  )}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>
                Basic information about this category.
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
                    placeholder="e.g. Lighting"
                    aria-invalid={Boolean(fieldError("name"))}
                    maxLength={FIELD_LIMITS.name.short}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>
                      {name.length}/{FIELD_LIMITS.name.short}
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
                    <InputGroupText>/categories/</InputGroupText>
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
                <InputGroup className="min-h-[5rem]">
                  <InputGroupTextarea
                    id="description"
                    value={description}
                    onChange={(event) => {
                      setDescription(event.target.value);
                      clearFieldError("description");
                    }}
                    placeholder="A short description of this category."
                    aria-invalid={Boolean(fieldError("description"))}
                    maxLength={FIELD_LIMITS.description.medium}
                  />
                  <InputGroupAddon
                    align="block-end"
                    className="border-t border-border"
                  >
                    <InputGroupText>
                      {description.length}/{FIELD_LIMITS.description.medium}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldError("description") && (
                  <p className="text-xs text-destructive">
                    {fieldError("description")}
                  </p>
                )}
              </div>

              <div className="space-y-2" data-field="image">
                <Label>Image</Label>
                <ImageDropzone
                  value={image}
                  onChange={(img) => {
                    setImage(img);
                    clearFieldError("image");
                  }}
                  upload={uploadShopImage}
                  deleteImage={deleteShopImage}
                  emptyLabel="Category image"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>
                Control where this category sits in the hierarchy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2" data-field="parent">
                  <Label>Parent category</Label>
                  <Select
                    value={parent ?? ""}
                    onValueChange={(value) => {
                      const newParent = (value as string) || null;
                      if (isEdit && newParent !== parent) {
                        setShowParentChangeWarning(true);
                      } else {
                        setShowParentChangeWarning(false);
                      }
                      setParent(newParent);
                      clearFieldError("parent");
                    }}
                    items={[
                      { value: "", label: "None (top-level)" },
                      ...parentOptions.map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                      })),
                    ]}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="None (top-level)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (top-level)</SelectItem>
                      {parentOptions.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {"\u00A0\u00A0".repeat(cat.level)}
                          {cat.level > 0 ? "\u2514 " : ""}
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError("parent") && (
                    <p className="text-xs text-destructive">
                      {fieldError("parent")}
                    </p>
                  )}
                  {showParentChangeWarning && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
                      <HugeiconsIcon
                        icon={Warning}
                        size={14}
                        className="mt-0.5 shrink-0"
                      />
                      <p>
                        Changing the parent will move this category and all its
                        children in the hierarchy. Ancestor paths will be
                        updated.
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Leave empty for a top-level category.
                  </p>
                </div>

                <div className="space-y-2" data-field="sortOrder">
                  <Label htmlFor="sort-order">Sort order</Label>
                  <Input
                    id="sort-order"
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(event) =>
                      setSortOrder(Number(event.target.value))
                    }
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                <Switch
                  id="is-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="is-active"
                    className="cursor-pointer font-medium"
                  >
                    Active
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Inactive categories are hidden from the storefront.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {allAttributes.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Attributes</CardTitle>
                    <CardDescription>
                      Assign product attributes. Mark as variant to use for SKU
                      generation.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddAttrDialogOpen(true)}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={14} />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {categoryAttributes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No attributes assigned. Click &ldquo;Add&rdquo; to assign
                    product attributes to this category.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {categoryAttributes.map((catAttr, index) => {
                      const attrDef = allAttributes.find(
                        (a) => a.id === catAttr.attributeId,
                      );
                      return (
                        <div
                          key={`${catAttr.attributeId}-${index}`}
                          className="flex items-center gap-3 not-last:border-b pb-2"
                        >
                          <div className="min-w-0 flex-1">
                            <Select
                              value={catAttr.attributeId}
                              onValueChange={(value) =>
                                updateAttribute(index, {
                                  attributeId: value as string,
                                })
                              }
                              items={allAttributes.map((a) => ({
                                value: a.id,
                                label: `${a.name} (${a.type})${a.isActive === false ? " — Inactive" : ""}`,
                              }))}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select attribute" />
                              </SelectTrigger>
                              <SelectContent>
                                {allAttributes.map((a) => (
                                  <SelectItem key={a.id} value={a.id}>
                                    {a.name} ({a.type})
                                    {a.isActive === false && (
                                      <span className="ml-1.5 text-xs text-muted-foreground">
                                        — Inactive
                                      </span>
                                    )}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Switch
                              checked={catAttr.required}
                              onCheckedChange={(checked) =>
                                updateAttribute(index, { required: checked })
                              }
                            />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              Required
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Switch
                              checked={catAttr.isVariant}
                              onCheckedChange={(checked) =>
                                updateAttribute(index, { isVariant: checked })
                              }
                            />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              Variant
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeAttribute(index)}
                            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Remove ${attrDef?.name ?? "attribute"}`}
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="min-w-0 space-y-6 lg:sticky lg:top-8 lg:self-start">
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

      <AddAttributeDialog
        open={addAttrDialogOpen}
        onOpenChange={setAddAttrDialogOpen}
        title="Add attribute"
        existingNames={existingAttrNames}
        onAdd={handleAddAttrFromLibrary}
        onCreateNew={handleCreateNewAttr}
      />
    </div>
  );
}
