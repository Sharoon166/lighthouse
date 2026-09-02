"use client";

import {
  ArrowLeft02Icon,
  CheckIcon,
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
import { Switch } from "@/components/ui/switch";
import { FIELD_LIMITS } from "@/lib/field-limits";
import {
  type Brand,
  type BrandActionResult,
  createBrand,
  updateBrand,
} from "../actions/brand-actions";
import { deleteShopImage, uploadShopImage } from "../actions/image-actions";
import { type BrandInput, brandInputSchema } from "../validation/brand";

interface BrandFormProps {
  mode?: "create" | "edit";
  id?: string;
  initialData?: Brand | null;
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
    .querySelector<HTMLElement>("input, textarea, select")
    ?.focus({ preventScroll: true });
}

export function BrandForm({
  mode = "create",
  id,
  initialData = null,
}: BrandFormProps) {
  const isEdit = mode === "edit";
  const router = useRouter();

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [isSlugEdited, setIsSlugEdited] = useState(isEdit);
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [logo, setLogo] = useState<{
    url: string;
    publicId: string;
  } | null>(
    initialData?.logo
      ? { url: initialData.logo, publicId: initialData.logo }
      : null,
  );
  const [website, setWebsite] = useState(initialData?.website ?? "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [seoMetaTitle, setSeoMetaTitle] = useState(
    initialData?.seo?.metaTitle ?? "",
  );
  const [seoMetaDescription, setSeoMetaDescription] = useState(
    initialData?.seo?.metaDescription ?? "",
  );

  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string[] | undefined;
  }>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const savedNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isSlugEdited) {
      const generated = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
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

  const buildPayload = (): BrandInput => ({
    name,
    slug,
    description,
    logo: logo?.url ?? "",
    website: website || "",
    isActive,
    seo: {
      metaTitle: seoMetaTitle.trim() || undefined,
      metaDescription: seoMetaDescription.trim() || undefined,
    },
  });

  const run = () => {
    const result = brandInputSchema.safeParse(buildPayload());
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
      const response: BrandActionResult = isEdit
        ? await updateBrand(editId, payload)
        : await createBrand(payload);

      if (!response.ok) {
        setFieldErrors(response.fieldErrors);
        setFormErrors(response.formErrors);
        scrollToFirstError(response.fieldErrors);
        return;
      }

      setFieldErrors({});
      setFormErrors([]);

      setSavedNotice("Brand saved.");
      if (savedNoticeTimer.current) clearTimeout(savedNoticeTimer.current);
      savedNoticeTimer.current = setTimeout(() => setSavedNotice(null), 3000);

      if (!isEdit) {
        router.replace("/admin/brands");
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
            href="/admin/brands"
            aria-label="Back to brands"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl tracking-tight text-foreground md:text-3xl">
                {isEdit ? "Edit brand" : "New brand"}
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
                : "Add a brand to group your products."}
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
                Basic information about this brand.
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
                    placeholder="e.g. Acme Lighting"
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
                    <InputGroupText>/brands/</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="slug"
                    value={slug}
                    onChange={(event) => {
                      setIsSlugEdited(true);
                      setSlug(
                        event.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, ""),
                      );
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
                    placeholder="A short description of this brand."
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

              <div className="space-y-2" data-field="logo">
                <Label>Logo</Label>
                <ImageDropzone
                  value={logo}
                  onChange={(img) => {
                    setLogo(img);
                    clearFieldError("logo");
                  }}
                  upload={uploadShopImage}
                  deleteImage={deleteShopImage}
                  emptyLabel="Brand logo"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Additional brand configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2" data-field="website">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(event) => {
                    setWebsite(event.target.value);
                    clearFieldError("website");
                  }}
                  placeholder="https://example.com"
                  aria-invalid={Boolean(fieldError("website"))}
                />
                {fieldError("website") ? (
                  <p className="text-xs text-destructive">
                    {fieldError("website")}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Optional. Public website for this brand.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
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
                    Inactive brands are hidden from the storefront.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}
