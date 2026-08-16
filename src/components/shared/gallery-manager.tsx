"use client";

import {
  Delete02Icon,
  DragDropIcon,
  ImageUploadIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { ImageCropDialog } from "@/components/shared/image-crop-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  url: string;
  publicId: string;
  caption?: string;
}

interface GalleryManagerProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  upload: (formData: FormData) => Promise<{ ok: boolean; image?: GalleryImage; message?: string }>;
  deleteImage?: (publicId: string) => Promise<{ ok: boolean }>;
  maxImages?: number;
  label?: string;
  aspectRatio?: number;
}

interface QueueItem {
  file: File;
}

export function GalleryManager({
  images,
  onChange,
  upload,
  deleteImage,
  maxImages = 12,
  label = "Gallery",
  aspectRatio = 4 / 3,
}: GalleryManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [cropQueue, setCropQueue] = useState<QueueItem[]>([]);
  const [currentCrop, setCurrentCrop] = useState<File | null>(null);

  const handleCroppedImage = useCallback(
    async (blob: Blob) => {
      if (!currentCrop) return;

      setIsUploading(true);
      
      try {
        // Create a File from the blob with the original filename
        const file = new File([blob], currentCrop.name, {
          type: "image/jpeg",
        });

        const formData = new FormData();
        formData.append("file", file);

        const result = await upload(formData);

        if (result.ok && result.image) {
          onChange([...images, result.image]);
        } else {
          alert(result.message || "Failed to upload image");
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload image");
      } finally {
        setIsUploading(false);
        
        // Process next file in queue
        setCropQueue(prev => {
          if (prev.length > 0) {
            const [nextItem, ...rest] = prev;
            setCurrentCrop(nextItem.file);
            return rest;
          } else {
            setCurrentCrop(null);
            return [];
          }
        });
      }
    },
    [currentCrop, images, onChange, upload],
  );

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      if (images.length >= maxImages) {
        alert(`Maximum ${maxImages} images allowed`);
        return;
      }

      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      const availableSlots = maxImages - images.length;
      const filesToProcess = imageFiles.slice(0, availableSlots);

      if (filesToProcess.length === 0) return;

      if (imageFiles.length > availableSlots) {
        alert(
          `You can only add ${availableSlots} more image${availableSlots !== 1 ? "s" : ""}`,
        );
      }

      // Store files directly without creating object URLs yet
      const fileItems = filesToProcess.map(file => ({ file }));

      // Start cropping the first file, queue the rest
      const [firstItem, ...restItems] = fileItems;
      setCurrentCrop(firstItem.file);
      setCropQueue(restItems);
    },
    [images.length, maxImages],
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    handleFilesSelected(Array.from(files));
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    handleFilesSelected(files);
  };

  const handleRemove = async (index: number) => {
    const imageToRemove = images[index];
    
    // Optimistically update UI
    onChange(images.filter((_, i) => i !== index));
    
    // Delete from Cloudinary if deleteImage function is provided
    if (deleteImage && imageToRemove.publicId) {
      try {
        await deleteImage(imageToRemove.publicId);
      } catch (error) {
        console.error("Failed to delete image from cloud:", error);
        // Image is already removed from UI, so we don't revert
      }
    }
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const updated = [...images];
    updated[index] = { ...updated[index], caption };
    onChange(updated);
  };

  const handleCancelCrop = () => {
    setCurrentCrop(null);
    setCropQueue([]);
  };

  const totalInQueue = cropQueue.length + (currentCrop ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">
          {images.length}/{maxImages} images
          {totalInQueue > 0 && ` (${totalInQueue} pending)`}
        </span>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
          (isUploading || currentCrop || images.length >= maxImages) &&
            "pointer-events-none opacity-50",
        )}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={isUploading || currentCrop !== null || images.length >= maxImages}
        />
        <HugeiconsIcon
          icon={dragOver ? DragDropIcon : ImageUploadIcon}
          size={32}
          className="text-muted-foreground"
        />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {isUploading
              ? "Uploading..."
              : currentCrop
                ? "Cropping..."
                : "Click or drag images to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            Up to {maxImages} images, max 10MB each
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.publicId}
              className="group relative space-y-2 rounded-lg border border-border p-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
                <Image
                  src={image.url}
                  alt={image.caption || `Gallery image ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => void handleRemove(index)}
                    className="size-8 p-0"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} />
                  </Button>
                </div>
                <div className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 text-xs font-medium">
                  #{index + 1}
                </div>
              </div>
              <Input
                placeholder="Add caption (optional)"
                value={image.caption || ""}
                onChange={(e) => handleCaptionChange(index, e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          ))}
        </div>
      )}

      {/* Crop Dialog */}
      {currentCrop && (
        <ImageCropDialog
          open={true}
          imageFile={currentCrop}
          aspectRatio={aspectRatio}
          optimizationPreset="gallery"
          onConfirm={handleCroppedImage}
          onCancel={handleCancelCrop}
          isProcessing={isUploading}
          queueInfo={
            totalInQueue > 1
              ? `Cropping ${images.length + 1} of ${images.length + totalInQueue}`
              : undefined
          }
        />
      )}
    </div>
  );
}
