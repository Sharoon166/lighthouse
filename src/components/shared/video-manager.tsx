"use client";

import {
  Delete02Icon,
  DragDropIcon,
  FileUploadIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ManagerVideo {
  url: string;
  publicId: string;
  title?: string;
  duration?: number;
}

interface VideoManagerProps {
  videos: ManagerVideo[];
  onChange: (videos: ManagerVideo[]) => void;
  upload: (
    formData: FormData,
  ) => Promise<{ ok: boolean; video?: ManagerVideo; message?: string }>;
  deleteVideo?: (publicId: string) => Promise<{ ok: boolean }>;
  maxVideos?: number;
  label?: string;
}

export function VideoManager({
  videos,
  onChange,
  upload,
  deleteVideo,
  maxVideos = 5,
  label = "Videos",
}: VideoManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      const videoFiles = files.filter((file) => file.type.startsWith("video/"));
      if (videoFiles.length === 0) return;

      const availableSlots = maxVideos - videos.length;
      if (availableSlots <= 0) {
        alert(`Maximum ${maxVideos} videos allowed`);
        return;
      }

      const filesToUpload = videoFiles.slice(0, availableSlots);
      if (videoFiles.length > availableSlots) {
        alert(
          `You can only add ${availableSlots} more video${availableSlots !== 1 ? "s" : ""}`,
        );
      }

      setIsUploading(true);
      let updatedVideos = [...videos];

      try {
        for (const file of filesToUpload) {
          const formData = new FormData();
          formData.append("file", file);

          const result = await upload(formData);

          if (result.ok && result.video) {
            updatedVideos = [...updatedVideos, result.video];
            onChange(updatedVideos);
          } else {
            alert(result.message || "Failed to upload video");
          }
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload video");
      } finally {
        setIsUploading(false);
      }
    },
    [videos, onChange, upload, maxVideos],
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
    const videoToRemove = videos[index];
    console.log("[VideoManager] removing video:", videoToRemove.publicId);

    // Optimistically update UI
    onChange(videos.filter((_, i) => i !== index));

    // Delete from Cloudinary if deleteVideo function is provided
    if (deleteVideo && videoToRemove.publicId) {
      try {
        const result = await deleteVideo(videoToRemove.publicId);
        console.log("[VideoManager] delete result:", result);
      } catch (error) {
        console.error("Failed to delete video from cloud:", error);
      }
    }
  };

  const handleTitleChange = (index: number, title: string) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], title };
    onChange(updated);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">
          {videos.length}/{maxVideos} videos
        </span>
      </div>

      {/* Upload Area */}
      <section
        aria-label="Upload videos"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-all duration-200",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
          (isUploading || videos.length >= maxVideos) &&
            "pointer-events-none opacity-50",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*"
          onChange={handleFileSelect}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={isUploading || videos.length >= maxVideos}
        />
        {isUploading ? (
          <div className="flex items-center gap-2">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm font-medium text-foreground">
              Uploading...
            </span>
          </div>
        ) : (
          <>
            <HugeiconsIcon
              icon={dragOver ? DragDropIcon : FileUploadIcon}
              size={24}
              className="text-muted-foreground"
            />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Click or drag videos to upload
              </p>
              <p className="text-xs text-muted-foreground">
                Up to {maxVideos} videos, max 50MB each
              </p>
            </div>
          </>
        )}
      </section>

      {/* Video Grid */}
      {videos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video, index) => (
            <div
              key={video.publicId}
              className="group relative space-y-2 rounded-lg border border-border p-2 transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                <video
                  src={video.url}
                  className="h-full w-full object-cover"
                  preload="metadata"
                  controls={false}
                >
                  <track kind="captions" />
                </video>
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
                <div className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                  #{index + 1}
                </div>
                {video.duration ? (
                  <div className="absolute bottom-2 right-2 rounded bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                    {formatDuration(video.duration)}
                  </div>
                ) : null}
                {/* Play indicator overlay */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex size-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm">
                    <svg
                      className="ml-0.5 size-4 text-foreground"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <Input
                placeholder="Add title (optional)"
                value={video.title || ""}
                onChange={(e) => handleTitleChange(index, e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
