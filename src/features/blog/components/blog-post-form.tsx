"use client";

import {
  ArrowLeft02Icon,
  Cancel01Icon,
  CheckIcon,
  CodeXmlIcon,
  Edit02Icon,
  EyeIcon,
  FileCodeIcon,
  Maximize02Icon,
  Rocket01Icon,
  SaveIcon,
  Warning,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { JSONContent } from "@tiptap/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ImageDropzone } from "@/components/shared/image-dropzone";
import { RichTextPreview } from "@/components/shared/rich-text-preview";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import type { BlogPostHeroImage } from "@/models/blog-post";
import {
  type BlogPostActionResult,
  type BlogPostDraftData,
  createBlogPost,
  deleteBlogImage,
  updateBlogPost,
  uploadBlogImage,
} from "../actions";
import { type BlogPostInput, blogPostInputSchema } from "../validation";
import { BlogHtmlPanel } from "./blog-html-panel";

const RichTextEditor = dynamic(
  () =>
    import("@/components/shared/rich-text-editor").then(
      (module) => module.RichTextEditor,
    ),
  {
    ssr: false,
    loading: () => <EditorLoading />,
  },
);

function EditorLoading() {
  return (
    <div className="overflow-hidden rounded-lg border border-input bg-background shadow-xs">
      <div className="h-9 animate-pulse border-b border-border bg-muted/40" />
      <div className="min-h-40 animate-pulse bg-muted/30" />
    </div>
  );
}

const EMPTY_DOC: JSONContent = { type: "doc", content: [] };

const LOCAL_DRAFT_KEY = "lighthouse:blog-post-draft";

type LocalDraft = {
  savedAt: number;
  title: string;
  summary: string;
  tags: string[];
  content: JSONContent | null;
  authorName: string;
  authorDesignation: string;
  authorBio: string;
  heroImage: BlogPostHeroImage | null;
};

const FIELD_ORDER = [
  "title",
  "summary",
  "tags",
  "content",
  "author.name",
  "author.designation",
  "author.bio",
] as const;

function loadLocalDraft(): LocalDraft | null {
  try {
    const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as LocalDraft;
    if (!draft || typeof draft.savedAt !== "number") return null;
    return draft;
  } catch {
    return null;
  }
}

function saveLocalDraft(draft: LocalDraft) {
  try {
    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage may be unavailable; a failed backup is not fatal.
  }
}

function clearLocalDraft() {
  try {
    localStorage.removeItem(LOCAL_DRAFT_KEY);
  } catch {
    // Ignore.
  }
}

function formatSavedAt(epochMs: number) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(epochMs));
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isEmptyContent(content: JSONContent | null | undefined) {
  if (!content) return true;
  return !Array.isArray(content.content) || content.content.length === 0;
}

function countContentWords(content: JSONContent | null | undefined) {
  if (!content) return 0;
  let count = 0;
  const walk = (node: JSONContent) => {
    if (node.text) {
      count += node.text.trim().split(/\s+/).filter(Boolean).length;
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) walk(child);
    }
  };
  walk(content);
  return count;
}

type BlogPostFieldFailure = Extract<BlogPostActionResult, { ok: false }>;

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

interface BlogPostFormProps {
  mode?: "create" | "edit";
  initialData?: BlogPostDraftData | null;
}

export function BlogPostForm({
  mode = "create",
  initialData = null,
}: BlogPostFormProps) {
  const isEdit = mode === "edit";
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [summary, setSummary] = useState(initialData?.summary ?? "");
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [content, setContent] = useState<JSONContent | null>(
    (initialData?.content as JSONContent | null) ?? null,
  );
  const [authorName, setAuthorName] = useState(initialData?.author.name ?? "");
  const [authorDesignation, setAuthorDesignation] = useState(
    initialData?.author.designation ?? "",
  );
  const [authorBio, setAuthorBio] = useState(initialData?.author.bio ?? "");
  const [heroImage, setHeroImage] = useState<BlogPostHeroImage | null>(
    initialData?.heroImage ?? null,
  );

  // SEO fields (optional overrides)
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

  const [view, setView] = useState<"edit" | "preview">("edit");
  const [showHtml, setShowHtml] = useState(isEdit);
  const [zenMode, setZenMode] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const [pendingDraft, setPendingDraft] = useState<LocalDraft | null>(() =>
    isEdit ? null : loadLocalDraft(),
  );
  const [localSavedAt, setLocalSavedAt] = useState<number | null>(null);

  const [isPending, startTransition] = useTransition();
  const lastIntentRef = useRef<"draft" | "publish">("draft");
  const savedNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!initialData) return;
    setTitle(initialData.title);
    setSummary(initialData.summary);
    setTags(initialData.tags);
    setContent((initialData.content as JSONContent | null) ?? null);
    setAuthorName(initialData.author.name);
    setAuthorDesignation(initialData.author.designation);
    setAuthorBio(initialData.author.bio);
    setHeroImage(initialData.heroImage);
    setSeoMetaTitle(initialData.seo?.metaTitle ?? "");
    setSeoMetaDescription(initialData.seo?.metaDescription ?? "");
    setSeoFocusKeyword(initialData.seo?.focusKeyword ?? "");
    setSeoNoIndex(initialData.seo?.noIndex ?? false);
  }, [initialData]);

  useEffect(() => {
    if (isEdit) return;
    const draft: LocalDraft = {
      savedAt: Date.now(),
      title,
      summary,
      tags,
      content,
      authorName,
      authorDesignation,
      authorBio,
      heroImage,
    };

    const timer = setTimeout(() => {
      if (
        !title &&
        !summary &&
        tags.length === 0 &&
        isEmptyContent(content) &&
        !authorName &&
        !authorDesignation &&
        !authorBio &&
        !heroImage
      ) {
        clearLocalDraft();
        setLocalSavedAt(null);
        return;
      }
      saveLocalDraft(draft);
      setLocalSavedAt(Date.now());
    }, 600);

    return () => clearTimeout(timer);
  }, [
    isEdit,
    title,
    summary,
    tags,
    content,
    authorName,
    authorDesignation,
    authorBio,
    heroImage,
  ]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (zenMode) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [zenMode]);

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

  const buildPayload = (intent: "draft" | "publish"): BlogPostInput => ({
    intent,
    title,
    summary,
    tags,
    content: content ?? EMPTY_DOC,
    heroImage,
    author: {
      name: authorName,
      designation: authorDesignation,
      bio: authorBio,
    },
    seo: {
      metaTitle: seoMetaTitle.trim(),
      metaDescription: seoMetaDescription.trim(),
      focusKeyword: seoFocusKeyword.trim(),
      noIndex: seoNoIndex,
    },
  });

  const applyFieldErrors = (result: BlogPostFieldFailure) => {
    setFieldErrors(result.fieldErrors);
    setFormErrors(result.formErrors);
    if (
      Object.keys(result.fieldErrors).length > 0 ||
      result.formErrors.length > 0
    ) {
      scrollToFirstError(result.fieldErrors);
    }
  };

  const validateField = (field: string) => {
    const result = blogPostInputSchema.safeParse(
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

    const result = blogPostInputSchema.safeParse(buildPayload(intent));
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
      const response: BlogPostActionResult = isEdit
        ? await updateBlogPost(initialData?.slug ?? "", payload)
        : await createBlogPost(payload);

      if (!response.ok) {
        applyFieldErrors(response);
        return;
      }

      setFieldErrors({});
      setFormErrors([]);

      if (intent === "publish") {
        setSavedNotice("Your post has been published.");
      } else {
        setSavedNotice("Draft saved.");
      }
      if (savedNoticeTimer.current) clearTimeout(savedNoticeTimer.current);
      savedNoticeTimer.current = setTimeout(() => setSavedNotice(null), 3000);

      if (!isEdit) {
        clearLocalDraft();
        setPendingDraft(null);
        setLocalSavedAt(null);
        router.replace(`/admin/blog/edit/${response.slug}`);
      } else if (response.slug !== initialData?.slug) {
        router.replace(`/admin/blog/edit/${response.slug}`);
      } else {
        router.refresh();
      }
    });
  };

  const zenWordCount = countContentWords(content);
  const zenReadingTime = Math.max(1, Math.ceil(zenWordCount / 200));

  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    if (!zenMode) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZenMode(false);
      } else if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        runRef.current("draft");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [zenMode]);

  const restoreDraft = (draft: LocalDraft) => {
    setTitle(draft.title);
    setSummary(draft.summary);
    setTags(draft.tags);
    setContent(draft.content);
    setAuthorName(draft.authorName);
    setAuthorDesignation(draft.authorDesignation);
    setAuthorBio(draft.authorBio);
    setHeroImage(draft.heroImage);
    setPendingDraft(null);
    setSavedNotice("Your local draft has been restored.");
  };

  const discardDraft = () => {
    clearLocalDraft();
    setPendingDraft(null);
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
            href="/admin/blog"
            aria-label="Back to blog posts"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl tracking-tight text-foreground md:text-3xl">
                {isEdit ? "Edit post" : "New post"}
              </h1>
              <StatusBadge status={initialData?.status ?? "draft"} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit
                ? `/${initialData?.slug ?? ""}`
                : "Write, preview and publish your story."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {localSavedAt && (
            <span className="text-xs text-muted-foreground">
              Saved locally at{" "}
              {new Date(localSavedAt).toLocaleTimeString("en", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {savedNotice && (
            <span className="flex items-center gap-1.5 rounded-full border border-chart-2/40 bg-chart-2/10 px-3 py-1 text-xs font-medium text-chart-2">
              <HugeiconsIcon icon={CheckIcon} size={14} />
              {savedNotice}
            </span>
          )}
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
                Could not save your post. Please check the highlighted fields.
              </p>
            )}
          </div>
        </div>
      )}

      {pendingDraft && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm">
          <div className="flex items-center gap-2.5 text-secondary">
            <HugeiconsIcon icon={SaveIcon} size={16} />
            <span>
              A draft saved locally on{" "}
              <strong className="font-medium text-foreground">
                {formatSavedAt(pendingDraft.savedAt)}
              </strong>{" "}
              is available. Restore it to keep writing.
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={discardDraft}
            >
              Discard
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => restoreDraft(pendingDraft)}
            >
              Restore
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="Compose view"
              className="inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={view === "edit"}
                onClick={() => setView("edit")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  view === "edit"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <HugeiconsIcon icon={Edit02Icon} size={14} />
                Edit
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === "preview"}
                onClick={() => setView("preview")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  view === "preview"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <HugeiconsIcon icon={EyeIcon} size={14} />
                Preview
              </button>
            </div>
          </div>

          {view === "edit" ? (
            <div className="min-w-0 space-y-8 *:border-none *:p-0">
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                  <CardDescription>
                    The story your readers will see.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2" data-field="heroImage">
                    <Label htmlFor="hero-image">Cover image</Label>
                    <ImageDropzone
                      value={heroImage}
                      onChange={(image) => {
                        setHeroImage(image);
                        clearFieldError("heroImage");
                      }}
                      upload={uploadBlogImage}
                      deleteImage={deleteBlogImage}
                      emptyLabel="Cover image"
                      />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
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
                        placeholder="An evening of golden light"
                        aria-invalid={Boolean(fieldError("title"))}
                      />
                      {fieldError("title") ? (
                        <p className="text-xs text-destructive">
                          {fieldError("title")}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {title.length}/200
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Generated slug: {slugify(title)}
                      </p>
                    </div>

                    <div className="space-y-2" data-field="tags">
                      <Label htmlFor="tags">Tags</Label>
                      <TaggedInput
                        id="tags"
                        value={tags}
                        onChange={(next) => {
                          setTags(next);
                          clearFieldError("tags");
                        }}
                        maxTags={8}
                        placeholder="Add tags — press Enter…"
                      />
                      {fieldError("tags") ? (
                        <p className="text-xs text-destructive">
                          {fieldError("tags")}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Press Enter or comma to add a tag. {tags.length}/8
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2" data-field="summary">
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea
                      id="summary"
                      rows={3}
                      value={summary}
                      onChange={(event) => {
                        setSummary(event.target.value);
                        clearFieldError("summary");
                      }}
                      onBlur={() => validateField("summary")}
                      placeholder="A short paragraph that appears in post cards, search and previews."
                      aria-invalid={Boolean(fieldError("summary"))}
                    />
                    {fieldError("summary") ? (
                      <p className="text-xs text-destructive">
                        {fieldError("summary")}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {summary.length}/1000
                      </p>
                    )}
                  </div>

                  <div className="space-y-2" data-field="content">
                    <div className="flex items-center justify-between gap-6 flex-wrap">
                      <Label>Content</Label>
                      {view === "edit" && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setZenMode(true)}
                        >
                          <HugeiconsIcon icon={Maximize02Icon} size={14} />
                          Zen mode
                        </Button>
                      )}
                    </div>
                    <RichTextEditor
                      value={content}
                      onChange={(next) => {
                        setContent(next);
                        clearFieldError("content");
                      }}
                      placeholder="Write your story…"
                    />
                    {fieldError("content") && (
                      <p className="text-xs text-destructive">
                        {fieldError("content")}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Author</CardTitle>
                  <CardDescription>
                    Who gets credit for this post.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2" data-field="author.name">
                      <Label htmlFor="author-name">Name</Label>
                      <Input
                        id="author-name"
                        value={authorName}
                        onChange={(event) => {
                          setAuthorName(event.target.value);
                          clearFieldError("author.name");
                        }}
                        onBlur={() => validateField("author.name")}
                        placeholder="e.g. Sara Ahmed"
                        aria-invalid={Boolean(fieldError("author.name"))}
                      />
                      {fieldError("author.name") && (
                        <p className="text-xs text-destructive">
                          {fieldError("author.name")}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2" data-field="author.designation">
                      <Label htmlFor="author-designation">Designation</Label>
                      <Input
                        id="author-designation"
                        value={authorDesignation}
                        onChange={(event) => {
                          setAuthorDesignation(event.target.value);
                          clearFieldError("author.designation");
                        }}
                        onBlur={() => validateField("author.designation")}
                        placeholder="e.g. Lead Product Designer"
                        aria-invalid={Boolean(fieldError("author.designation"))}
                      />
                      {fieldError("author.designation") && (
                        <p className="text-xs text-destructive">
                          {fieldError("author.designation")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2" data-field="author.bio">
                    <Label htmlFor="author-bio">Short bio</Label>
                    <Textarea
                      id="author-bio"
                      rows={3}
                      value={authorBio}
                      onChange={(event) => {
                        setAuthorBio(event.target.value);
                        clearFieldError("author.bio");
                      }}
                      onBlur={() => validateField("author.bio")}
                      placeholder="One or two sentences about the author."
                      aria-invalid={Boolean(fieldError("author.bio"))}
                    />
                    {fieldError("author.bio") && (
                      <p className="text-xs text-destructive">
                        {fieldError("author.bio")}
                      </p>
                    )}
                  </div>
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
                        {seoMetaTitle.length}/60 · Leave empty to use blog title. Recommended: 50-60 characters
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
                        summary.slice(0, 155) || "Auto-generated from summary"
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
                        {seoMetaDescription.length}/160 · Leave empty to use summary. Recommended: 150-160 characters
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
                      maxLength={100}
                      aria-invalid={Boolean(fieldError("seo.focusKeyword"))}
                    />
                    {fieldError("seo.focusKeyword") ? (
                      <p className="text-xs text-destructive">
                        {fieldError("seo.focusKeyword")}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Primary keyword you're targeting with this post
                      </p>
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="seo-no-index"
                      checked={seoNoIndex}
                      onChange={(event) => setSeoNoIndex(event.target.checked)}
                      className="mt-1 size-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="seo-no-index"
                        className="cursor-pointer font-medium"
                      >
                        Prevent search engine indexing
                      </Label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Check this to add a "noindex" meta tag. Useful for
                        private or draft content you don't want in search
                        results.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                {!title &&
                !summary &&
                !authorName &&
                isEmptyContent(content) ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                    <HugeiconsIcon
                      icon={EyeIcon}
                      size={24}
                      className="text-muted-foreground"
                    />
                    <p className="text-sm text-muted-foreground">
                      Start writing to see a live preview of your post.
                    </p>
                  </div>
                ) : (
                  <article className="space-y-8">
                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
                      {title || "Untitled post"}
                    </h1>

                    {/* Summary */}
                    {summary && (
                      <p className="text-lg leading-relaxed text-muted-foreground">
                        {summary}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                            {initials(authorName) || "LH"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {authorName || "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {authorDesignation || "Author"}
                          </p>
                        </div>
                      </div>

                      <span className="text-muted-foreground">•</span>

                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span>{zenWordCount} words</span>
                      </div>

                      <span className="text-muted-foreground">•</span>

                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span>{zenReadingTime} min read</span>
                      </div>
                    </div>

                    {/* Hero Image */}
                    {heroImage && (
                      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border border-border">
                        <Image
                          src={heroImage.url}
                          alt={title || "Cover image"}
                          fill
                          sizes="100vw"
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-lg prose-slate max-w-none dark:prose-invert">
                      {isEmptyContent(content) ? (
                        <p className="text-sm italic text-muted-foreground">
                          Your content will appear here…
                        </p>
                      ) : (
                        <RichTextPreview content={content} />
                      )}
                    </div>

                    {/* Author Bio */}
                    {authorName && (
                      <div className="mt-16 rounded-2xl border border-border bg-card p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="size-16 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
                              {initials(authorName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Written By
                            </p>
                            <h3 className="mt-1 text-xl font-bold text-foreground">
                              {authorName}
                            </h3>
                            {authorDesignation && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {authorDesignation}
                              </p>
                            )}
                            {authorBio && (
                              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                {authorBio}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="min-w-0 space-y-6 lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
              <CardDescription>
                {isEdit
                  ? "Save changes or publish this post."
                  : "Keep writing or publish your story."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={initialData?.status ?? "draft"} />
              </div>
              {initialData?.publishedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Published
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                    }).format(new Date(initialData.publishedAt))}
                  </span>
                </div>
              )}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => run("draft")}
                  disabled={isPending}
                >
                  <HugeiconsIcon icon={SaveIcon} size={16} />
                  {isPending ? "Saving…" : "Save draft"}
                </Button>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => run("publish")}
                  disabled={isPending}
                >
                  <HugeiconsIcon icon={Rocket01Icon} size={16} />
                  {isPending
                    ? "Saving…"
                    : initialData?.status === "published"
                      ? "Save & publish"
                      : "Publish"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Preview</CardTitle>
              <CardDescription>
                How your post will appear in search results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Meta Title ({(seoMetaTitle || title).length}/60)
                </div>
                <div className="text-sm font-medium text-blue-600">
                  {seoMetaTitle || title || "Untitled Post"}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Meta Description ({(seoMetaDescription || summary).length}/160)
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {seoMetaDescription || summary || "No description provided"}
                </div>
              </div>

              {(seoFocusKeyword || tags.length > 0) && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Keywords</div>
                  <div className="flex flex-wrap gap-1">
                    {seoFocusKeyword && (
                      <Badge variant="secondary" className="text-xs">
                        {seoFocusKeyword} (focus)
                      </Badge>
                    )}
                    {tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {seoNoIndex && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  <strong>Not indexed:</strong> This post won't appear in search
                  results
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">
                  Reading time
                </span>
                <span className="text-xs font-medium text-foreground">
                  {Math.max(1, Math.ceil(countContentWords(content) / 200))}{" "}
                  min
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={CodeXmlIcon} size={24} />
                Generated HTML
              </CardTitle>
              <CardDescription>
                The markup your editor produces.
              </CardDescription>
            </CardHeader>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-expanded={showHtml}
              onClick={() => setShowHtml((previous) => !previous)}
            >
              <HugeiconsIcon icon={FileCodeIcon} size={16} />
              {showHtml ? "Hide" : "Show"}
            </Button>

            {showHtml && (
              <CardContent className="relative space-y-2">
                <BlogHtmlPanel content={content} />
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {zenMode && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Zen mode editor"
          className="fixed inset-0 z-50"
        >
          <button
            type="button"
            aria-label="Exit zen mode"
            onClick={() => setZenMode(false)}
            className="absolute inset-0 animate-in fade-in-0 bg-background/80 backdrop-blur-md"
          />

          <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 mx-auto flex h-[calc(100dvh-1.5rem)] w-full max-w-5xl sm:h-[calc(100dvh-4rem)]">
            <div
              className="absolute -top-4 left-4 z-10 flex animate-glance-in items-center gap-1 rounded-full border border-border bg-card p-1 shadow-lg"
              style={{ animationDelay: "140ms" }}
            >
              <button
                type="button"
                aria-label="Exit zen mode"
                title="Exit zen mode (Esc)"
                onClick={() => setZenMode(false)}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
              <span className="h-4 w-px bg-border" aria-hidden="true" />
              <button
                type="button"
                aria-label="Save draft"
                title="Save draft (Ctrl+Enter)"
                onClick={() => run("draft")}
                disabled={isPending}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                <HugeiconsIcon icon={SaveIcon} size={16} />
              </button>
              <button
                type="button"
                aria-label={
                  initialData?.status === "published"
                    ? "Save and publish"
                    : "Publish post"
                }
                title="Publish"
                onClick={() => run("publish")}
                disabled={isPending}
                className="flex h-8 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
              >
                <HugeiconsIcon icon={Rocket01Icon} size={14} />
                Publish
              </button>
            </div>

            <div className="flex h-full w-full animate-glance-in flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl ring-1 ring-ring/20">
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-muted/40 px-5 py-3 sm:px-6">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </span>
                  Zen mode
                </span>
                <span className="text-xs text-muted-foreground">
                  {zenWordCount} words · {zenReadingTime} min read
                </span>
              </div>

              <div className="min-h-0 flex-1 p-4 sm:p-6">
                <RichTextEditor
                  value={content}
                  onChange={(next) => {
                    setContent(next);
                    clearFieldError("content");
                  }}
                  placeholder="Write your story…"
                  autoFocus
                  className="flex h-full flex-col"
                  editorClassName="max-h-none min-h-0 flex-1"
                />
              </div>

              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                    Esc
                  </kbd>
                  exit focus
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                    Ctrl
                  </kbd>
                  +
                  <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                    Enter
                  </kbd>
                  save draft
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
