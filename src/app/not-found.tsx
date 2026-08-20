"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Home01Icon,
  ArrowLeft02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const leftPupilRef = useRef<HTMLDivElement>(null);
  const rightPupilRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Move pupils to track cursor
  useEffect(() => {
    const movePupil = (
      pupil: HTMLDivElement,
      eye: HTMLDivElement,
    ) => {
      const eyeRect = eye.getBoundingClientRect();
      const eyeCenterX = eyeRect.left + eyeRect.width / 2;
      const eyeCenterY = eyeRect.top + eyeRect.height / 2;

      const dx = mousePos.x - eyeCenterX;
      const dy = mousePos.y - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(
        Math.sqrt(dx * dx + dy * dy) * 0.12,
        22,
      );

      const px = Math.cos(angle) * distance;
      const py = Math.sin(angle) * distance;

      pupil.style.transform = `translate(${px}px, ${py}px)`;
    };

    if (leftPupilRef.current && leftEyeRef.current)
      movePupil(leftPupilRef.current, leftEyeRef.current);
    if (rightPupilRef.current && rightEyeRef.current)
      movePupil(rightPupilRef.current, rightEyeRef.current);
  }, [mousePos]);

  // Blinking
  const blink = useCallback(() => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 150);
  }, []);

  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 4000;
      return setTimeout(() => {
        blink();
        timerId = scheduleBlink();
      }, delay);
    };
    let timerId = scheduleBlink();
    return () => clearTimeout(timerId);
  }, [blink]);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6 py-24 text-center">
      {/* eyes */}
      <div className="mb-10 flex items-center gap-6 sm:gap-10">
        {/* left eye */}
        <div
          ref={leftEyeRef}
          className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-border bg-background shadow-inner sm:h-24 sm:w-24"
        >
          <div
            ref={leftPupilRef}
            className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground sm:h-10 sm:w-10"
          >
            <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-background sm:right-2 sm:top-2 sm:h-2.5 sm:w-2.5" />
          </div>
          {/* eyelid */}
          <div
            className="absolute inset-0 rounded-full bg-muted-foreground/40"
            style={{
              transform: isBlinking ? "scaleY(1)" : "scaleY(0)",
              transformOrigin: "50% 0%",
              transition: "transform 0.08s ease",
            }}
          />
        </div>
        {/* right eye */}
        <div
          ref={rightEyeRef}
          className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-border bg-background shadow-inner sm:h-24 sm:w-24"
        >
          <div
            ref={rightPupilRef}
            className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground sm:h-10 sm:w-10"
          >
            <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-background sm:right-2 sm:top-2 sm:h-2.5 sm:w-2.5" />
          </div>
          {/* eyelid */}
          <div
            className="absolute inset-0 rounded-full bg-muted-foreground/40"
            style={{
              transform: isBlinking ? "scaleY(1)" : "scaleY(0)",
              transformOrigin: "50% 0%",
              transition: "transform 0.08s ease",
            }}
          />
        </div>
      </div>

      <h1 className="font-heading text-[8rem] font-bold leading-none tracking-tighter text-secondary sm:text-[12rem]">
        404
      </h1>
      <p className="mb-8 mt-4 text-lg text-muted-foreground">
        This page doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          <HugeiconsIcon icon={Home01Icon} size={18} />
          Go home
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} size={18} />
          Go back
        </button>
      </div>
    </main>
  );
}
