"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

interface VideoViewerContextType {
  open: (url: string, title?: string) => void;
  close: () => void;
}

const VideoViewerContext = createContext<VideoViewerContextType>({
  open: () => {},
  close: () => {},
});

export function useVideoViewer() {
  return useContext(VideoViewerContext);
}

export function VideoViewerProvider({ children }: { children: ReactNode }) {
  const [video, setVideo] = useState<{ url: string; title?: string } | null>(
    null,
  );

  const open = useCallback((url: string, title?: string) => {
    setVideo({ url, title });
  }, []);

  const close = useCallback(() => {
    setVideo(null);
  }, []);

  useEffect(() => {
    if (!video) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [video]);

  return (
    <VideoViewerContext.Provider value={{ open, close }}>
      {children}
      {video && (
        <VideoViewerPanel url={video.url} title={video.title} onClose={close} />
      )}
    </VideoViewerContext.Provider>
  );
}

function VideoViewerPanel({
  url,
  title,
  onClose,
}: {
  url: string;
  title?: string;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.play().catch(() => {});
    return () => {
      el.pause();
    };
  }, [url]);

  return createPortal(
    <div className="fixed inset-0 z-100 flex flex-col bg-black/92 backdrop-blur-md">
      <button
        type="button"
        aria-label="Close video viewer"
        className="absolute inset-0 z-0 cursor-default"
        onClick={onClose}
      />
      <div className="absolute top-0 w-full z-10 flex items-start justify-between gap-4 p-4 sm:p-5">
        <div className="min-w-0 pt-1">
          <p className="truncate text-sm font-medium text-white/90">
            {title || "Video"}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-white/80 backdrop-blur-xl transition-colors hover:bg-white/15 hover:text-white"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </button>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-8">
        <video
          ref={videoRef}
          src={url}
          controls
          playsInline
          className="w-full max-h-[80dvh] aspect-video rounded-lg bg-black"
        >
          <track kind="captions" />
        </video>
      </div>
    </div>,
    document.body,
  );
}
