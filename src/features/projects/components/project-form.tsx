"use client";

import {
  ArrowLeft02Icon,
  Cancel01Icon,
  CancelCircleIcon,
  CheckIcon,
  CheckmarkCircle02Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loading02Icon,
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
import { DateTimePicker } from "@/components/shared/date-time-picker";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { TaggedInput } from "@/components/ui/tagged-input";
import { Textarea } from "@/components/ui/textarea";
import { useSlugValidation } from "@/hooks/use-slug-validation";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import { FIELD_LIMITS } from "@/lib/field-limits";
import { cn, slugify } from "@/lib/utils";
import type { ProjectImage } from "@/models/project";
import {
  createProject,
  deleteProjectImage,
  type ProjectActionResult,
  type ProjectDraftData,
  updateProject,
  uploadProjectImage,
} from "../actions";
import { type ProjectInput, projectInputSchema } from "../validation";

const STEPS = [
  { id: "content", label: "Content" },
  { id: "details", label: "Details" },
  { id: "challenges", label: "Challenges" },
  { id: "gallery", label: "Gallery" },
  { id: "testimonial", label: "Testimonial" },
  { id: "seo", label: "SEO & Publish" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const STEP_FIELDS: Record<StepId, string[]> = {
  content: ["title", "heroImage", "description"],
  details: ["client", "location"],
  challenges: [],
  gallery: [],
  testimonial: [],
  seo: [],
};

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

  const [currentStep, setCurrentStep] = useState<StepId>("content");

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
  const [challenges, setChallenges] = useState(initialData?.challenges ?? []);
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

  const {
    slug,
    error: slugError,
    handleSlugChange,
    handleBlur: handleSlugBlur,
    isAvailable: isSlugAvailable,
    isChecking: isSlugChecking,
    isTaken: isSlugTaken,
  } = useSlugValidation({
    title,
    initialSlug: initialData?.slug,
    collection: "project",
    excludeSlug: isEdit ? initialData?.slug : undefined,
  });

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

  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [publishedAt, setPublishedAt] = useState<string>(() => {
    if (initialData?.publishedAt) {
      const d = new Date(initialData.publishedAt);
      return d.toISOString().slice(0, 16);
    }
    return "";
  });

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
    setFeatured(initialData.featured);
    if (initialData.publishedAt) {
      const d = new Date(initialData.publishedAt);
      setPublishedAt(d.toISOString().slice(0, 16));
    }
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
    slug,
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
    featured,
    publishedAt: publishedAt || null,
    seo: {
      metaTitle: seoMetaTitle.trim(),
      metaDescription: seoMetaDescription.trim(),
      focusKeyword: seoFocusKeyword.trim(),
      noIndex: seoNoIndex,
    },
  });

  const validateCurrentStep = (): boolean => {
    const fieldsToValidate = STEP_FIELDS[currentStep];
    if (fieldsToValidate.length === 0) return true;

    const result = projectInputSchema.safeParse(
      buildPayload(lastIntentRef.current),
    );
    if (result.success) {
      setFieldErrors({});
      return true;
    }

    const flattened = result.error.flatten();
    const stepErrors: Record<string, string[]> = {};
    let hasStepError = false;
    for (const field of fieldsToValidate) {
      const errors = (flattened.fieldErrors as Record<string, string[]>)[field];
      if (errors?.length) {
        stepErrors[field] = errors;
        hasStepError = true;
      }
    }
    setFieldErrors(stepErrors);
    return !hasStepError;
  };

  const goToNextStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      if (validateCurrentStep()) {
        setFieldErrors({});
        setCurrentStep(STEPS[currentIndex + 1].id);
      }
    }
  };

  const goToPrevStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setFieldErrors({});
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const run = (intent: "draft" | "publish") => {
    lastIntentRef.current = intent;

    const result = projectInputSchema.safeParse(buildPayload(intent));
    if (!result.success) {
      const flattened = result.error.flatten();
      setFieldErrors(flattened.fieldErrors);
      setFormErrors(flattened.formErrors);

      const errorFields = Object.keys(flattened.fieldErrors);
      if (errorFields.length > 0) {
        for (const step of STEPS) {
          const stepFields = STEP_FIELDS[step.id];
          if (stepFields.some((f) => errorFields.includes(f))) {
            setCurrentStep(step.id);
            break;
          }
        }
      }
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
        if (Object.keys(response.fieldErrors).length > 0) {
          for (const step of STEPS) {
            const stepFields = STEP_FIELDS[step.id];
            if (stepFields.some((f) => response.fieldErrors[f]?.length)) {
              setCurrentStep(step.id);
              break;
            }
          }
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

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

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
            disabled={isPending || isSlugTaken}
            onClick={() => run("draft")}
          >
            <HugeiconsIcon icon={SaveIcon} size={16} />
            Save draft
          </Button>
          <Button
            type="button"
            disabled={isPending || isSlugTaken}
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
          {/* Step Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1.5">
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  setFieldErrors({});
                  setCurrentStep(step.id);
                }}
                className={cn(
                  "flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  currentStep === step.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="mr-1.5 inline-flex size-5 items-center justify-center rounded-full border text-[10px] font-bold">
                  {index + 1}
                </span>
                {step.label}
              </button>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === "content" && (
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>
                  The hero image, title, and overview for your project.
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
                    <InputGroup>
                      <InputGroupInput
                        id="title"
                        value={title}
                        onChange={(event) => {
                          setTitle(event.target.value);
                          clearFieldError("title");
                        }}
                        placeholder="e.g. Aurora Penthouse"
                        maxLength={FIELD_LIMITS.name.medium}
                        aria-invalid={Boolean(fieldError("title"))}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>
                          {title.length}/{FIELD_LIMITS.name.medium}
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldError("title") && (
                      <p className="text-xs text-destructive">
                        {fieldError("title")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2" data-field="subtitle">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <InputGroup>
                      <InputGroupInput
                        id="subtitle"
                        value={subtitle}
                        onChange={(event) => {
                          setSubtitle(event.target.value);
                          clearFieldError("subtitle");
                        }}
                        placeholder="e.g. Modern Minimalist Design"
                        maxLength={FIELD_LIMITS.name.long}
                        aria-invalid={Boolean(fieldError("subtitle"))}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>
                          {subtitle.length}/{FIELD_LIMITS.name.long}
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldError("subtitle") && (
                      <p className="text-xs text-destructive">
                        {fieldError("subtitle")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2" data-field="slug">
                  <Label htmlFor="slug">Slug</Label>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-sm text-muted-foreground">
                      /projects/
                    </span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(event) => {
                        handleSlugChange(slugify(event.target.value));
                      }}
                      onBlur={handleSlugBlur}
                      placeholder="auto-generated-from-title"
                      aria-invalid={Boolean(fieldError("slug")) || isSlugTaken}
                      className="flex-1 font-mono text-sm"
                    />
                    <span className="flex size-5 shrink-0 items-center justify-center">
                      {isSlugChecking && (
                        <HugeiconsIcon
                          icon={Loading02Icon}
                          size={16}
                          className="animate-spin text-muted-foreground"
                        />
                      )}
                      {!isSlugChecking && isSlugTaken && (
                        <HugeiconsIcon
                          icon={CancelCircleIcon}
                          size={16}
                          className="text-destructive"
                        />
                      )}
                      {!isSlugChecking && isSlugAvailable && slug && (
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          size={16}
                          className="text-chart-2"
                        />
                      )}
                    </span>
                  </div>
                  {fieldError("slug") || slugError ? (
                    <p className="text-xs text-destructive">
                      {fieldError("slug") || slugError}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      URL-friendly identifier. Auto-generated from title.
                    </p>
                  )}
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
                    suggestions={PROJECT_CATEGORIES}
                  />
                  {fieldError("categories") ? (
                    <p className="text-xs text-destructive">
                      {fieldError("categories")}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Press Enter or comma to add. {categories.length}/
                      {FIELD_LIMITS.tag.maxCount}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "details" && (
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
                  <Label htmlFor="installation-details">
                    Installation Details
                  </Label>
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
          )}

          {currentStep === "challenges" && (
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
          )}

          {currentStep === "gallery" && (
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
          )}

          {currentStep === "testimonial" && (
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
                          setTestimonial({
                            ...testimonial,
                            quote: event.target.value,
                          })
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
          )}

          {currentStep === "seo" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Publish Settings</CardTitle>
                  <CardDescription>
                    Configure publish date and featured status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="project-status">Project Status</Label>
                    <select
                      id="project-status"
                      value={projectStatus}
                      onChange={(event) =>
                        setProjectStatus(
                          event.target.value as "ongoing" | "completed",
                        )
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <DateTimePicker
                      id="published-at"
                      label="Publish date"
                      value={publishedAt}
                      onChange={setPublishedAt}
                      description="Leave empty to use current date when publishing."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={featured}
                      onChange={(event) => setFeatured(event.target.checked)}
                      className="size-4 rounded border-input accent-primary"
                    />
                    <Label
                      htmlFor="featured"
                      className="cursor-pointer font-normal"
                    >
                      Featured
                    </Label>
                  </div>
                  {fieldError("featured") && (
                    <p className="text-xs text-destructive">
                      {fieldError("featured")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {featured
                      ? "This project is featured."
                      : "Up to 3 projects can be featured."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings (Optional)</CardTitle>
                  <CardDescription>
                    Override metadata for search engines and social sharing.
                    Leave empty to auto-generate from your content.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                        placeholder={title || "Auto-generated from title"}
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
                        aria-invalid={Boolean(
                          fieldError("seo.metaDescription"),
                        )}
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

                  <div className="space-y-2" data-field="seo.focusKeyword">
                    <Label htmlFor="seo-focus-keyword">Focus Keyword</Label>
                    <InputGroup>
                      <InputGroupInput
                        id="seo-focus-keyword"
                        value={seoFocusKeyword}
                        onChange={(event) => {
                          setSeoFocusKeyword(event.target.value);
                          clearFieldError("seo.focusKeyword");
                        }}
                        placeholder="e.g. modern lighting design"
                        maxLength={FIELD_LIMITS.seo.focusKeyword}
                        aria-invalid={Boolean(fieldError("seo.focusKeyword"))}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>
                          {seoFocusKeyword.length}/
                          {FIELD_LIMITS.seo.focusKeyword}
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
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

                  <div
                    className="flex items-center gap-2"
                    data-field="seo.noIndex"
                  >
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
            </>
          )}

          {/* Step Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={goToPrevStep}
              disabled={currentStepIndex === 0}
            >
              <HugeiconsIcon icon={ChevronLeftIcon} size={16} />
              Previous
            </Button>
            {currentStepIndex < STEPS.length - 1 ? (
              <Button type="button" onClick={goToNextStep}>
                Next
                <HugeiconsIcon icon={ChevronRightIcon} size={16} />
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
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
