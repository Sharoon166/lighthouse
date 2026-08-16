"use client";

import {
  Cancel01Icon,
  CropIcon,
  RotateLeft01Icon,
  RotateRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  optimizeImage,
  IMAGE_OPTIMIZATION_PRESETS,
  type OptimizationConfig,
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
    // Get blob from File or URL
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

    // Return PNG at max quality to avoid double compression
    // The shared optimizer will handle final compression and format
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

    // Cleanup function
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
      // Use File directly if available, otherwise use URL
      const imageSource = imageFile || imageUrl;
      
      // Step 1: Crop (uncompressed)
      const croppedBlob = await getCroppedBlob(imageSource, croppedAreaPixels, rotation);
      
      // Step 2: Optimize (if preset provided)
      let finalBlob = croppedBlob;
      if (optimizationPreset) {
        const config = IMAGE_OPTIMIZATION_PRESETS[optimizationPreset];
        finalBlob = await optimizeImage(croppedBlob, config);
      }
      
      onConfirm(finalBlob);
    } catch (error) {
      console.error("Crop/optimization error:", error);
      const message = error instanceof Error ? error.message : "Failed to process image";
      alert(`${message}. Please try again.`);
    } finally {
      setIsProcessingCrop(false);
    }
  }, [imageFile, imageUrl, croppedAreaPixels, rotation, optimizationPreset, onConfirm, isProcessingCrop]);

  if (!open || !imageUrl) return null;

  const rotate = (direction: 1 | -1) =>
    setRotation((current) => (current + direction * 90) % 360);

  const isBusy = isProcessingCrop || isProcessing;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close crop dialog"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={isBusy ? undefined : onCancel}
        disabled={isBusy}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-crop-dialog-title"
        className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <HugeiconsIcon icon={CropIcon} size={18} className="text-muted-foreground" />
            <div>
              <h2
                id="image-crop-dialog-title"
                className="text-sm font-semibold text-foreground"
              >
                Crop Image
              </h2>
              {queueInfo && (
                <p className="text-xs text-muted-foreground">{queueInfo}</p>
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
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </Button>
        </div>

        {/* Cropper Area */}
        <div className="relative h-[500px] bg-muted/30">
          {isBusy && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2.5">
                <div className="size-10 animate-spin rounded-full border-3 border-muted border-t-foreground" />
                <p className="text-sm font-medium text-foreground">
                  {isProcessing ? "Uploading..." : "Processing..."}
                </p>
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
        <div className="space-y-4 border-t border-border px-5 py-4">
          {/* Aspect Ratio */}
          {allowAspectChange && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
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
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      aspectRatio === ratio.value
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      isBusy && "opacity-50",
                    )}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          
          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
          {/* Zoom */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="crop-zoom"
                className="text-xs font-medium text-muted-foreground"
              >
                Zoom
              </label>
              <span className="text-xs text-muted-foreground">
                {Math.round((zoom - 1) * 100)}%
              </span>
            </div>
            <input
              id="crop-zoom"
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={isBusy}
              className="w-full accent-foreground disabled:opacity-50"
            />
          </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Rotate left"
                onClick={() => rotate(-1)}
                disabled={isBusy}
              >
                <HugeiconsIcon icon={RotateLeft01Icon} size={14} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Rotate right"
                onClick={() => rotate(1)}
                disabled={isBusy}
              >
                <HugeiconsIcon icon={RotateRight01Icon} size={14} />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void handleConfirm()}
                disabled={!croppedAreaPixels || isBusy}
              >
                {isProcessingCrop ? "Processing..." : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
