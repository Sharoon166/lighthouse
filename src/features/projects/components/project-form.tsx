"use client";

import {
  ArrowLeft02Icon,
  Cancel01Icon,
  CheckIcon,
  Rocket01Icon,
  SaveIcon,
  Warning,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  ChallengesEditor,
  FeaturesEditor,
} from "@/components/shared/bullet-point-editor";
import { GalleryManager } from "@/components/shared/gallery-manager";
import { ImageDropzone } from "@/components/shared/image-dropzone";
import { SeoPreview } from "@/components/shared/seo-preview";
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
import { Label } from "@/components/ui/label";
import { TaggedInput } from "@/components/ui/tagged-input";
import { Textarea } from "@/components/ui/textarea";
import { cn, slugify } from "@/lib/utils";
import type { ProjectImage } from "@/models/project";
import {
  type ProjectActionResult,
  type ProjectDraftData,
  createProject,
  deleteProjectImage,
  updateProject,
  uploadProjectImage,
} from "../actions";
import { type ProjectInput, projectInputSchema } from "../validation";

const FIELD_ORDER = [
  "title",
  "subtitle",
  "description",
  "client",
  "location",
  "heroImage",
] as const;

function scrollToFirstError(fieldErrors: Record<string, string[]>) {
  const first = FIELD_ORDER.find((field) => fieldErrors[field]?.length);
  if (!first) return;
  const node = document.querySelector<HTMLElement>(`[data-field="${first}"]`);
  if (!node) return;
  node.scrollIntoView({ behavior: "smooth", block: "center" });
  node
    .querySelector<HTMLElement>("input, textarea, button")
    ?.focus({ preventScroll: true });
}

interface ProjectFormProps {
  mode?: "create" | "edit";
  initialData?: ProjectDraftData | null;
}

export function ProjectForm({
  mode = "create",
  initialData = null,
}: ProjectFormProps) {
  const isEdit = mode === "edit";
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [client, setClient] = useState(initialData?.client ?? "");
  const [duration, setDuration] = useState(initialData?.duration ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [categories, setCategories] = useState<string[]>(
    initialData?.categories ?? [],
  );
  const [materials, setMaterials] = useState(initialData?.materials ?? "");
  const [lightControl, setLightControl] = useState(
    initialData?.lightControl ?? "",
  );
  const [budgetRange, setBudgetRange] = useState(
    initialData?.budgetRange ?? "",
  );
  const [installationDetails, setInstallationDetails] = useState(
    initialData?.installationDetails ?? "",
  );
  const [aboutProject, setAboutProject] = useState(
    initialData?.aboutProject ?? "",
  );
  const [challenges, setChallenges] = useState(
    initialData?.challenges ?? [],
  );
  const [features, setFeatures] = useState(initialData?.features ?? []);
  const [heroImage, setHeroImage] = useState<ProjectImage | null>(
    initialData?.heroImage ?? null,
  );
  const [gallery, setGallery] = useState<ProjectImage[]>(
    initialData?.gallery ?? [],
  );
  const [projectStatus, setProjectStatus] = useState<"ongoing" | "completed">(
    initialData?.projectStatus ?? "ongoing",
  );
  const [testimonial, setTestimonial] = useState<{
    quote: string;
    author: string;
    role: string;
  } | null>(initialData?.testimonial ?? null);

  // SEO fields
  const [seoMetaTitle, setSeoMetaTitle] = useState(
    initialData?.seo?.metaTitle ?? "",
  );
  const [seoMetaDescription, setSeoMetaDescription] = useState(
    initialData?.seo?.metaDescription ?? "",
  );
  const [seoFocusKeyword, setSeoFocusKeyword] = useState(
    initialData?.seo?.focusKeyword ?? "",
  );
  const [seoNoIndex, setSeoNoIndex] = useState(
    initialData?.seo?.noIndex ?? false,
  );

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const lastIntentRef = useRef<"draft" | "publish">("draft");
  const savedNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!initialData) return;
    setTitle(initialData.title);
    setSubtitle(initialData.subtitle);
    setDescription(initialData.description);
    setClient(initialData.client);
    setDuration(initialData.duration);
    setLocation(initialData.location);
    setCategories(initialData.categories);
    setMaterials(initialData.materials);
    setLightControl(initialData.lightControl);
    setBudgetRange(initialData.budgetRange);
    setInstallationDetails(initialData.installationDetails);
    setAboutProject(initialData.aboutProject);
    setChallenges(initialData.challenges);
    setFeatures(initialData.features);
    setHeroImage(initialData.heroImage);
    setGallery(initialData.gallery);
    setProjectStatus(initialData.projectStatus);
    setTestimonial(initialData.testimonial);
    setSeoMetaTitle(initialData.seo?.metaTitle ?? "");
    setSeoMetaDescription(initialData.seo?.metaDescription ?? "");
    setSeoFocusKeyword(initialData.seo?.focusKeyword ?? "");
    setSeoNoIndex(initialData.seo?.noIndex ?? false);
  }, [initialData]);

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

  const buildPayload = (intent: "draft" | "publish"): ProjectInput => ({
    intent,
    title,
    subtitle,
    description,
    client,
    duration,
    location,
    categories,
    materials,
    lightControl,
    budgetRange,
    installationDetails,
    aboutProject,
    challenges,
    features,
    heroImage,
    gallery,
    projectStatus,
    testimonial,
    seo: {
      metaTitle: seoMetaTitle.trim(),
      metaDescription: seoMetaDescription.trim(),
      focusKeyword: seoFocusKeyword.trim(),
      noIndex: seoNoIndex,
    },
  });

  const validateField = (field: string) => {
    const result = projectInputSchema.safeParse(
      buildPayload(lastIntentRef.current),
    );
    if (result.success) {
      clearFieldError(field);
      return;
    }
    const errors = (
      result.error.flatten().fieldErrors as Record<string, string[]>
    )[field];
    if (errors) {
      setFieldErrors((previous) => ({ ...previous, [field]: errors }));
    } else {
      clearFieldError(field);
    }
  };

  const run = (intent: "draft" | "publish") => {
    lastIntentRef.current = intent;

    const result = projectInputSchema.safeParse(buildPayload(intent));
    if (!result.success) {
      const flattened = result.error.flatten();
      setFieldErrors(flattened.fieldErrors);
      setFormErrors(flattened.formErrors);
      scrollToFirstError(flattened.fieldErrors);
      return;
    }

    startTransition(async () => {
      const payload = JSON.parse(
        JSON.stringify(buildPayload(intent)),
      ) as unknown;
      const response: ProjectActionResult = isEdit
        ? await updateProject(initialData?.slug ?? "", payload)
        : await createProject(payload);

      if (!response.ok) {
        setFieldErrors(response.fieldErrors);
        setFormErrors(response.formErrors);
        if (
          Object.keys(response.fieldErrors).length > 0 ||
          response.formErrors.length > 0
        ) {
          scrollToFirstError(response.fieldErrors);
        }
        return;
      }

      setFieldErrors({});
      setFormErrors([]);

      if (intent === "publish") {
        setSavedNotice("Your project has been published.");
      } else {
        setSavedNotice("Draft saved.");
      }
      if (savedNoticeTimer.current) clearTimeout(savedNoticeTimer.current);
      savedNoticeTimer.current = setTimeout(() => setSavedNotice(null), 3000);

      if (!isEdit) {
        router.replace(`/admin/projects/edit/${response.slug}`);
      } else if (response.slug !== initialData?.slug) {
        router.replace(`/admin/projects/edit/${response.slug}`);
      } else {
        router.refresh();
      }
    });
  };

  const hasFieldErrors = Object.values(fieldErrors).some(
    (errors) => errors.length > 0,
  );
  const showErrorBanner = formErrors.length > 0 || hasFieldErrors;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/projects"
            aria-label="Back to projects"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl tracking-tight text-foreground md:text-3xl">
                {isEdit ? "Edit project" : "New project"}
              </h1>
              <StatusBadge status={initialData?.status ?? "draft"} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit
                ? `/${initialData?.slug ?? ""}`
                : "Create and publish your project showcase."}
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
            disabled={isPending}
            onClick={() => run("draft")}
          >
            <HugeiconsIcon icon={SaveIcon} size={16} />
            Save draft
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => run("publish")}
          >
            <HugeiconsIcon icon={Rocket01Icon} size={16} />
            {isEdit && initialData?.status === "published"
              ? "Update"
              : "Publish"}
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
                Could not save your project. Please check the highlighted
                fields.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-8 *:border-none *:p-0">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Core details about the project.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2" data-field="heroImage">
              <Label htmlFor="hero-image">Hero Image</Label>
              <ImageDropzone
                value={heroImage}
                onChange={(image) => {
                  setHeroImage(image);
                  clearFieldError("heroImage");
                }}
                upload={uploadProjectImage}
                deleteImage={deleteProjectImage}
                emptyLabel="Hero image"
              />
              {fieldError("heroImage") && (
                <p className="text-xs text-destructive">
                  {fieldError("heroImage")}
                </p>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2" data-field="title">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    clearFieldError("title");
                  }}
                  onBlur={() => validateField("title")}
                  placeholder="e.g. Aurora Penthouse"
                  aria-invalid={Boolean(fieldError("title"))}
                />
                {fieldError("title") ? (
                  <p className="text-xs text-destructive">
                    {fieldError("title")}
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {title.length}/200
                    </p>
                    {title && (
                      <p className="text-sm text-muted-foreground">
                        Generated slug: {slugify(title)}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2" data-field="subtitle">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(event) => {
                    setSubtitle(event.target.value);
                    clearFieldError("subtitle");
                  }}
                  placeholder="e.g. Modern Minimalist Design"
                  aria-invalid={Boolean(fieldError("subtitle"))}
                />
                {fieldError("subtitle") ? (
                  <p className="text-xs text-destructive">
                    {fieldError("subtitle")}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {subtitle.length}/300
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2" data-field="description">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  clearFieldError("description");
                }}
                onBlur={() => validateField("description")}
                placeholder="A brief overview of the project..."
                aria-invalid={Boolean(fieldError("description"))}
              />
              {fieldError("description") && (
                <p className="text-xs text-destructive">
                  {fieldError("description")}
                </p>
              )}
            </div>

            <div className="space-y-2" data-field="categories">
              <Label htmlFor="categories">Categories</Label>
              <TaggedInput
                id="categories"
                value={categories}
                onChange={(next) => {
                  setCategories(next);
                  clearFieldError("categories");
                }}
                maxTags={8}
                placeholder="Add categories — press Enter…"
              />
              {fieldError("categories") ? (
                <p className="text-xs text-destructive">
                  {fieldError("categories")}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Press Enter or comma to add. {categories.length}/8
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Client information and project specifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2" data-field="client">
                <Label htmlFor="client">Client</Label>
                <Input
                  id="client"
                  value={client}
                  onChange={(event) => {
                    setClient(event.target.value);
                    clearFieldError("client");
                  }}
                  onBlur={() => validateField("client")}
                  placeholder="e.g. John Doe"
                  aria-invalid={Boolean(fieldError("client"))}
                />
                {fieldError("client") && (
                  <p className="text-xs text-destructive">
                    {fieldError("client")}
                  </p>
                )}
              </div>

              <div className="space-y-2" data-field="location">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(event) => {
                    setLocation(event.target.value);
                    clearFieldError("location");
                  }}
                  onBlur={() => validateField("location")}
                  placeholder="e.g. New York, USA"
                  aria-invalid={Boolean(fieldError("location"))}
                />
                {fieldError("location") && (
                  <p className="text-xs text-destructive">
                    {fieldError("location")}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  placeholder="e.g. 3 months"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget-range">Budget Range</Label>
                <Input
                  id="budget-range"
                  value={budgetRange}
                  onChange={(event) => setBudgetRange(event.target.value)}
                  placeholder="e.g. $50,000 - $100,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="materials">Materials</Label>
              <Input
                id="materials"
                value={materials}
                onChange={(event) => setMaterials(event.target.value)}
                placeholder="e.g. Oak, Steel, Glass"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="light-control">Light Control</Label>
              <Input
                id="light-control"
                value={lightControl}
                onChange={(event) => setLightControl(event.target.value)}
                placeholder="e.g. Smart Dimming, Voice Control"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installation-details">Installation Details</Label>
              <Textarea
                id="installation-details"
                rows={3}
                value={installationDetails}
                onChange={(event) =>
                  setInstallationDetails(event.target.value)
                }
                placeholder="Describe the installation process..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="about-project">About Project</Label>
              <Textarea
                id="about-project"
                rows={4}
                value={aboutProject}
                onChange={(event) => setAboutProject(event.target.value)}
                placeholder="Tell the story of this project..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Challenges & Features</CardTitle>
            <CardDescription>
              Highlight what made this project unique.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ChallengesEditor
              challenges={challenges}
              onChange={setChallenges}
              errors={fieldErrors}
            />
            <FeaturesEditor
              features={features}
              onChange={setFeatures}
              errors={fieldErrors}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gallery</CardTitle>
            <CardDescription>
              Showcase multiple images from the project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GalleryManager
              images={gallery}
              onChange={setGallery}
              upload={uploadProjectImage}
              deleteImage={async (publicId) => {
                await deleteProjectImage(publicId);
                return { ok: true };
              }}
              maxImages={12}
              label="Project Gallery"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Testimonial (Optional)</CardTitle>
            <CardDescription>
              Add a testimonial from your client.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {testimonial === null ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setTestimonial({ quote: "", author: "", role: "" })
                }
              >
                Add Testimonial
              </Button>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="testimonial-quote">Quote</Label>
                  <Textarea
                    id="testimonial-quote"
                    rows={3}
                    value={testimonial.quote}
                    onChange={(event) =>
                      setTestimonial({ ...testimonial, quote: event.target.value })
                    }
                    placeholder="What did the client say?"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="testimonial-author">Author</Label>
                    <Input
                      id="testimonial-author"
                      value={testimonial.author}
                      onChange={(event) =>
                        setTestimonial({
                          ...testimonial,
                          author: event.target.value,
                        })
                      }
                      placeholder="e.g. Jane Smith"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testimonial-role">Role</Label>
                    <Input
                      id="testimonial-role"
                      value={testimonial.role}
                      onChange={(event) =>
                        setTestimonial({
                          ...testimonial,
                          role: event.target.value,
                        })
                      }
                      placeholder="e.g. CEO, Company Name"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTestimonial(null)}
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={16} />
                  Remove Testimonial
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO Settings (Optional)</CardTitle>
            <CardDescription>
              Override metadata for search engines and social sharing. Leave
              empty to auto-generate from your content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2" data-field="seo.metaTitle">
              <Label htmlFor="seo-meta-title">Meta Title</Label>
              <Input
                id="seo-meta-title"
                value={seoMetaTitle}
                onChange={(event) => {
                  setSeoMetaTitle(event.target.value);
                  clearFieldError("seo.metaTitle");
                }}
                placeholder={title || "Auto-generated from title"}
                maxLength={60}
                aria-invalid={Boolean(fieldError("seo.metaTitle"))}
              />
              {fieldError("seo.metaTitle") ? (
                <p className="text-xs text-destructive">
                  {fieldError("seo.metaTitle")}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {seoMetaTitle.length}/60 · Leave empty to use project title.
                  Recommended: 50-60 characters
                </p>
              )}
            </div>

            <div className="space-y-2" data-field="seo.metaDescription">
              <Label htmlFor="seo-meta-description">Meta Description</Label>
              <Textarea
                id="seo-meta-description"
                rows={3}
                value={seoMetaDescription}
                onChange={(event) => {
                  setSeoMetaDescription(event.target.value);
                  clearFieldError("seo.metaDescription");
                }}
                placeholder={
                  description.slice(0, 155) ||
                  "Auto-generated from description"
                }
                maxLength={160}
                aria-invalid={Boolean(fieldError("seo.metaDescription"))}
              />
              {fieldError("seo.metaDescription") ? (
                <p className="text-xs text-destructive">
                  {fieldError("seo.metaDescription")}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {seoMetaDescription.length}/160 · Leave empty to use
                  description. Recommended: 150-160 characters
                </p>
              )}
            </div>

            <div className="space-y-2" data-field="seo.focusKeyword">
              <Label htmlFor="seo-focus-keyword">Focus Keyword</Label>
              <Input
                id="seo-focus-keyword"
                value={seoFocusKeyword}
                onChange={(event) => {
                  setSeoFocusKeyword(event.target.value);
                  clearFieldError("seo.focusKeyword");
                }}
                placeholder="e.g. modern lighting design"
                aria-invalid={Boolean(fieldError("seo.focusKeyword"))}
              />
              {fieldError("seo.focusKeyword") ? (
                <p className="text-xs text-destructive">
                  {fieldError("seo.focusKeyword")}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  The main keyword you want this project to rank for
                </p>
              )}
            </div>

            <div className="flex items-center gap-2" data-field="seo.noIndex">
              <input
                type="checkbox"
                id="seo-no-index"
                checked={seoNoIndex}
                onChange={(e) => setSeoNoIndex(e.target.checked)}
                className="size-4 rounded border-input accent-primary"
              />
              <Label
                htmlFor="seo-no-index"
                className="cursor-pointer font-normal"
              >
                Hide from search engines (noindex)
              </Label>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SeoPreview
          metaTitle={seoMetaTitle}
          metaDescription={seoMetaDescription}
          focusKeyword={seoFocusKeyword}
          keywords={categories}
          noIndex={seoNoIndex}
          fallbackTitle={title || "Untitled Project"}
          fallbackDescription={
            description || subtitle || "No description provided"
          }
        />
      </div>
      </div>
    </div>
  );
}
