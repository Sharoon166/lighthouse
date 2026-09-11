"use client";

import { PauseIcon, PlayIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";
import { useVideoViewer } from "@/components/shared/video-viewer";
import type { ProjectVideo } from "@/models/project";

interface ProjectVideoPlayerProps {
  video: ProjectVideo;
}

export function ProjectVideoPlayer({ video }: ProjectVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { open } = useVideoViewer();

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;

    if (el.paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg bg-muted">
      <video
        ref={videoRef}
        src={video.url}
        className="aspect-video w-full cursor-pointer object-contain bg-black"
        preload="metadata"
        playsInline
        controls={false}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      >
        <track kind="captions" />
      </video>

      {/* Play overlay — shown when paused */}
      {!isPlaying && (
        <button
          type="button"
          onClick={() => open(video.url, video.title)}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30"
          aria-label={`Play ${video.title || "video"}`}
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-background/90 shadow-lg transition-transform group-hover:scale-110">
            <HugeiconsIcon
              icon={PlayIcon}
              size={28}
              className="ml-1"
              aria-hidden="true"
            />
          </div>
        </button>
      )}

      {/* Pause button — shown when playing, visible on hover */}
      {isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute bottom-4 right-4 z-50 flex size-10 items-center justify-center rounded-full bg-background/80 opacity-0 transition-opacity hover:bg-background group-hover:opacity-100"
          aria-label="Pause video"
        >
          <HugeiconsIcon icon={PauseIcon} size={18} />
        </button>
      )}

      {/* Video title */}
      {video.title && (
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4">
          <p className="text-sm font-medium text-white">{video.title}</p>
        </div>
      )}
    </div>
  );
}
