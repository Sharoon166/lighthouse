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

async function getCroppedBlob(
  imageUrl: string,
  pixelCrop: Area,
  rotation: number,
): Promise<Blob> {
  const source = await fetch(imageUrl);
  const bitmap = await createImageBitmap(await source.blob(), {
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
      "image/jpeg",
      0.92,
    );
  });
}

interface ImageCropDialogProps {
  open: boolean;
  imageUrl: string;
  aspectRatio?: number;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}

export function ImageCropDialog({
  open,
  imageUrl,
  aspectRatio = 16 / 9,
  onCancel,
  onConfirm,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    if (!open) return;

    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  }, [open]);

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels) return;
    try {
      const blob = await getCroppedBlob(imageUrl, croppedAreaPixels, rotation);
      onConfirm(blob);
    } catch {
      // Ignored: the dropzone surfaces upload failures; crop failure keeps
      // the dialog open so the user can try again.
    }
  }, [imageUrl, croppedAreaPixels, rotation, onConfirm]);

  if (!open) return null;

  const rotate = (direction: 1 | -1) =>
    setRotation((current) => (current + direction * 90) % 360);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close crop dialog"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-crop-dialog-title"
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-chart-2/10 text-chart-2">
              <HugeiconsIcon icon={CropIcon} size={16} />
            </span>
            <h2
              id="image-crop-dialog-title"
              className="font-heading text-base font-semibold tracking-tight text-foreground"
            >
              Crop image
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close"
            onClick={onCancel}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </Button>
        </div>

        <div className="relative h-[380px] bg-muted/40">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            showGrid
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

        <div className="space-y-4 border-t border-border px-5 py-4">
          <div className="space-y-2">
            <label
              htmlFor="crop-zoom"
              className="text-xs font-medium text-muted-foreground"
            >
              Zoom
            </label>
            <input
              id="crop-zoom"
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full accent-chart-2"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Rotate
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Rotate counter-clockwise"
                onClick={() => rotate(-1)}
              >
                <HugeiconsIcon icon={RotateLeft01Icon} size={15} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Rotate clockwise"
                onClick={() => rotate(1)}
              >
                <HugeiconsIcon icon={RotateRight01Icon} size={15} />
              </Button>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={!croppedAreaPixels}
              >
                <HugeiconsIcon icon={CropIcon} size={16} />
                Apply crop
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
