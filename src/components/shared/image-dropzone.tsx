"use client";

import {
  ArrowExpand01Icon,
  Delete02Icon,
  ImageUploadIcon,
  RefreshIcon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import {
  type DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageCropDialog } from "./image-crop-dialog";
import { ImageZoom } from "./image-zoom";

export type UploadedImage = { url: string; publicId: string };

export type UploadImageResult =
  | { ok: true; image: UploadedImage }
  | { ok: false; message: string };

interface ImageDropzoneProps {
  value?: UploadedImage | null;
  onChange: (image: UploadedImage | null) => void;
  upload: (formData: FormData) => Promise<UploadImageResult>;
  aspectRatio?: number;
  maxSizeMB?: number;
  emptyLabel?: string;
}

const MAX_SIZE_MB_DEFAULT = 10;

export function ImageDropzone({
  value,
  onChange,
  upload,
  aspectRatio = 16 / 9,
  maxSizeMB = MAX_SIZE_MB_DEFAULT,
  emptyLabel = "Cover image",
}: ImageDropzoneProps) {
  const [isUploading, startUpload] = useTransition();
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (pendingUrlRef.current) {
        URL.revokeObjectURL(pendingUrlRef.current);
      }
    };
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;

      setError(null);

      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(
          `Images must be ${maxSizeMB} MB or smaller. Choose a smaller file.`,
        );
        return;
      }

      if (pendingUrlRef.current) {
        URL.revokeObjectURL(pendingUrlRef.current);
      }
      const objectUrl = URL.createObjectURL(file);
      pendingUrlRef.current = objectUrl;
      setPendingUrl(objectUrl);
      setCropOpen(true);
    },
    [maxSizeMB],
  );

  const handleConfirmCrop = useCallback(
    (blob: Blob) => {
      setCropOpen(false);
      if (pendingUrlRef.current) {
        URL.revokeObjectURL(pendingUrlRef.current);
        pendingUrlRef.current = null;
      }
      setPendingUrl(null);

      const formData = new FormData();
      formData.append(
        "file",
        new File([blob], "cover-image.jpg", { type: "image/jpeg" }),
      );
      if (value?.publicId) {
        formData.append("previousPublicId", value.publicId);
      }

      startUpload(async () => {
        const result = await upload(formData);
        if (result.ok) {
          onChange(result.image);
        } else {
          setError(result.message);
        }
      });
    },
    [onChange, upload, value?.publicId],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setIsDragActive(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {value ? (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-background p-3">
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            title="View fullscreen"
            className="group relative aspect-[16/9] w-48 shrink-0 overflow-hidden rounded-lg border border-border outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Image
              src={value.url}
              alt={emptyLabel}
              fill
              sizes="192px"
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 text-transparent transition-colors group-hover:bg-foreground/30 group-hover:text-primary-foreground">
              <HugeiconsIcon icon={ArrowExpand01Icon} size={20} />
            </span>
          </button>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium text-foreground">{emptyLabel}</p>
            <p className="text-xs text-muted-foreground">
              Click the preview to view it fullscreen.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => inputRef.current?.click()}
              >
                <HugeiconsIcon icon={RefreshIcon} size={15} />
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isUploading}
                onClick={() => {
                  setError(null);
                  onChange(null);
                }}
              >
                <HugeiconsIcon icon={Delete02Icon} size={15} />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          aria-label={emptyLabel}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragActive(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            "w-full flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-background px-6 py-10 text-center outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
            isDragActive
              ? "border-chart-2 bg-chart-2/5"
              : "border-border hover:border-chart-2/60 hover:bg-muted/30",
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-chart-2/10 text-chart-2">
            <HugeiconsIcon icon={Upload04Icon} size={20} />
          </span>
          <p className="text-sm font-medium text-foreground">
            <span className=" underline underline-offset-4">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG or WebP · up to {maxSizeMB} MB
          </p>
        </button>
      )}

      {isUploading && (
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Uploading image…
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-destructive"
        >
          <HugeiconsIcon icon={ImageUploadIcon} size={14} />
          {error}
        </p>
      )}

      {cropOpen && pendingUrl && (
        <ImageCropDialog
          open
          imageUrl={pendingUrl}
          aspectRatio={aspectRatio}
          onCancel={() => {
            setCropOpen(false);
            if (pendingUrlRef.current) {
              URL.revokeObjectURL(pendingUrlRef.current);
              pendingUrlRef.current = null;
            }
            setPendingUrl(null);
          }}
          onConfirm={handleConfirmCrop}
        />
      )}

      {zoomOpen && value && (
        <ImageZoom
          open
          src={value.url}
          alt={emptyLabel}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </div>
  );
}
