"use client";

import {
  Cancel01Icon,
  CheckIcon,
  CropIcon,
  Rotate01Icon,
  Rotate02Icon,
  RotateCcw,
  RotateClockwiseIcon,
  ZoomInAreaIcon,
  ZoomOutAreaIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  IMAGE_OPTIMIZATION_PRESETS,
  type OptimizationConfig,
  optimizeImage,
} from "@/lib/image-optimizer";
import { cn } from "@/lib/utils";

/**
 * Performs the crop operation without compression.
 * Returns an uncompressed blob that will be passed to the shared optimizer.
 */
async function getCroppedBlob(
  imageSource: File | string,
  pixelCrop: Area,
  rotation: number,
): Promise<Blob> {
  try {
    let blob: Blob;
    if (imageSource instanceof File) {
      blob = imageSource;
    } else {
      const source = await fetch(imageSource);
      if (!source.ok) {
        throw new Error(`Failed to fetch image: ${source.status}`);
      }
      blob = await source.blob();
    }

    const bitmap = await createImageBitmap(blob, {
      imageOrientation: "from-image",
    });

    const rad = (rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const rotatedWidth = Math.round(bitmap.width * cos + bitmap.height * sin);
    const rotatedHeight = Math.round(bitmap.width * sin + bitmap.height * cos);

    const rotatedCanvas = document.createElement("canvas");
    rotatedCanvas.width = rotatedWidth;
    rotatedCanvas.height = rotatedHeight;
    const rotatedContext = rotatedCanvas.getContext("2d");
    if (!rotatedContext) {
      throw new Error("Canvas is not supported in this browser.");
    }
    rotatedContext.translate(rotatedWidth / 2, rotatedHeight / 2);
    rotatedContext.rotate(rad);
    rotatedContext.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
    rotatedContext.setTransform(1, 0, 0, 1, 0, 0);

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = pixelCrop.width;
    cropCanvas.height = pixelCrop.height;
    const cropContext = cropCanvas.getContext("2d");
    if (!cropContext) {
      throw new Error("Canvas is not supported in this browser.");
    }
    cropContext.imageSmoothingEnabled = true;
    cropContext.imageSmoothingQuality = "high";
    cropContext.drawImage(
      rotatedCanvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    bitmap.close();

    return new Promise((resolve, reject) => {
      cropCanvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create the cropped image."));
        },
        "image/png",
        1.0,
      );
    });
  } catch (error) {
    console.error("Error in getCroppedBlob:", error);
    throw error;
  }
}

interface ImageCropDialogProps {
  open: boolean;
  imageFile?: File;
  imageUrl?: string;
  aspectRatio?: number;
  lockAspect?: boolean;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
  isProcessing?: boolean;
  queueInfo?: string;
  allowAspectChange?: boolean;
  /** Optimization preset to apply after cropping. If not provided, no optimization is applied. */
  optimizationPreset?: keyof typeof IMAGE_OPTIMIZATION_PRESETS;
}

const ASPECT_RATIOS = [
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "3:2", value: 3 / 2 },
  { label: "21:9", value: 21 / 9 },
];

export function ImageCropDialog({
  open,
  imageFile,
  imageUrl: externalImageUrl,
  aspectRatio: defaultAspectRatio = 16 / 9,
  lockAspect = false,
  onCancel,
  onConfirm,
  isProcessing = false,
  queueInfo,
  allowAspectChange = true,
  optimizationPreset,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(defaultAspectRatio);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessingCrop, setIsProcessingCrop] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Trigger entrance animation after mount
  useEffect(() => {
    if (open) {
      // Small delay to ensure the DOM is ready before animating in
      const raf = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(raf);
    }
    setMounted(false);
  }, [open]);

  // Create object URL from File when component mounts/updates
  useEffect(() => {
    if (!open) return;

    let url = "";
    if (imageFile) {
      url = URL.createObjectURL(imageFile);
      setImageUrl(url);
    } else if (externalImageUrl) {
      setImageUrl(externalImageUrl);
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [open, imageFile, externalImageUrl]);

  useEffect(() => {
    if (!open) return;

    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspectRatio(defaultAspectRatio);
    setCroppedAreaPixels(null);
  }, [open, defaultAspectRatio]);

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels || isProcessingCrop) return;

    setIsProcessingCrop(true);
    try {
      const imageSource = imageFile || imageUrl;

      const croppedBlob = await getCroppedBlob(
        imageSource,
        croppedAreaPixels,
        rotation,
      );

      let finalBlob = croppedBlob;
      if (optimizationPreset) {
        const config = IMAGE_OPTIMIZATION_PRESETS[optimizationPreset];
        finalBlob = await optimizeImage(croppedBlob, config);
      }

      onConfirm(finalBlob);
    } catch (error) {
      console.error("Crop/optimization error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to process image";
      alert(`${message}. Please try again.`);
    } finally {
      setIsProcessingCrop(false);
    }
  }, [
    imageFile,
    imageUrl,
    croppedAreaPixels,
    rotation,
    optimizationPreset,
    onConfirm,
    isProcessingCrop,
  ]);

  if (!open || !imageUrl) return null;

  const rotate = (direction: 1 | -1) =>
    setRotation((current) => (current + direction * 90) % 360);

  const isBusy = isProcessingCrop || isProcessing;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close crop dialog"
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300",
          mounted ? "opacity-100" : "opacity-0",
        )}
        onClick={isBusy ? undefined : onCancel}
        disabled={isBusy}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-crop-dialog-title"
        className={cn(
          "relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl max-h-[90vh]",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          mounted
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-4 opacity-0 scale-[0.97]",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/6">
              <HugeiconsIcon
                icon={CropIcon}
                size={16}
              />
            </div>
            <div>
              <h2
                id="image-crop-dialog-title"
                className="text-sm font-semibold text-foreground"
              >
                Crop Image
              </h2>
              {queueInfo && (
                <p className="text-[11px] text-muted-foreground">{queueInfo}</p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close"
            onClick={onCancel}
            disabled={isBusy}
            className="rounded-lg"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </Button>
        </div>

        {/* Cropper Area */}
        <div className="relative h-[500px] bg-black/[0.02]">
          {/* Processing overlay */}
          {isBusy && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="relative size-10">
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-muted" />
                  {/* Spinning arc */}
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-foreground [animation-duration:0.8s]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    {isProcessing ? "Uploading..." : "Processing..."}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Please wait
                  </p>
                </div>
              </div>
            </div>
          )}
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            showGrid={!isBusy}
            zoomWithScroll
            minZoom={1}
            maxZoom={4}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={(_croppedArea, pixels) =>
              setCroppedAreaPixels(pixels)
            }
          />
        </div>

        {/* Controls */}
        <div className="space-y-4 border-t border-border/60 px-5 py-4">
          {/* Aspect Ratio */}
          {allowAspectChange && !lockAspect && (
            <div className="space-y-2">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Aspect Ratio
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.label}
                    type="button"
                    onClick={() => setAspectRatio(ratio.value)}
                    disabled={isBusy}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                      aspectRatio === ratio.value
                        ? "bg-foreground text-background shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                      isBusy && "pointer-events-none opacity-50",
                    )}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions row */}
          <div className="flex items-center flex-wrap justify-center sm:justify-between gap-3">
            {/* Zoom + Aspect badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
                  disabled={isBusy || zoom <= 1}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                  aria-label="Zoom out"
                >
                  <HugeiconsIcon icon={ZoomOutAreaIcon} size={14} />
                </button>
                <input
                  id="crop-zoom"
                  type="range"
                  min={1}
                  max={4}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  disabled={isBusy}
                  className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-muted accent-foreground [::-webkit-slider-thumb]:size-3.5 [::-webkit-slider-thumb]:appearance-none [::-webkit-slider-thumb]:rounded-full [::-webkit-slider-thumb]:bg-foreground [::-webkit-slider-thumb]:shadow-sm [::-webkit-slider-thumb]:transition-transform [::-webkit-slider-thumb]:duration-150 [::-webkit-slider-thumb]:hover:scale-125 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
                  disabled={isBusy || zoom >= 4}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                  aria-label="Zoom in"
                >
                  <HugeiconsIcon icon={ZoomInAreaIcon} size={14} />
                </button>
              </div>
              <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                {Math.round((zoom - 1) * 100)}%
              </span>
              <div className="h-4 w-px bg-border" />
              <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {ASPECT_RATIOS.find(
                  (r) => Math.abs(r.value - aspectRatio) < 0.01,
                )?.label ?? `${Math.round(aspectRatio)}:1`}
              </span>
            </div>

            {/* Rotate + Actions */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Rotate left"
                onClick={() => rotate(-1)}
                disabled={isBusy}
                className="rounded-lg"
              >
                <HugeiconsIcon icon={RotateClockwiseIcon} size={14} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Rotate right"
                onClick={() => rotate(1)}
                disabled={isBusy}
                className="rounded-lg"
              >
                <HugeiconsIcon icon={Rotate02Icon} size={14} />
              </Button>
              <div className="h-4 w-px bg-border" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isBusy}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void handleConfirm()}
                disabled={!croppedAreaPixels || isBusy}
                className="rounded-lg gap-1.5"
              >
                {isProcessingCrop ? (
                  "Processing..."
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckIcon} size={14} />
                    Crop
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
