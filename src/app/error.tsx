"use client";

import { ArrowLeft02Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthExpression, setMouthExpression] = useState<
    "angry" | "irritated" | "furious" | "grumpy"
  >("angry");

  const leftPupilRef = useRef<HTMLDivElement>(null);
  const rightPupilRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.error("Application error trapped:", error);
  }, [error]);

  // Cycle angry/irritated expressions
  useEffect(() => {
    const expressions: Array<"angry" | "irritated" | "furious" | "grumpy"> = [
      "angry",
      "irritated",
      "furious",
      "grumpy",
    ];
    const scheduleExpression = () => {
      const delay = 2000 + Math.random() * 2500;
      return setTimeout(() => {
        setMouthExpression((prev) => {
          let next = prev;
          while (next === prev) {
            next = expressions[Math.floor(Math.random() * expressions.length)];
          }
          return next;
        });
        timerId = scheduleExpression();
      }, delay);
    };
    let timerId = scheduleExpression();
    return () => clearTimeout(timerId);
  }, []);

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
    const movePupil = (pupil: HTMLDivElement, eye: HTMLDivElement) => {
      const eyeRect = eye.getBoundingClientRect();
      const eyeCenterX = eyeRect.left + eyeRect.width / 2;
      const eyeCenterY = eyeRect.top + eyeRect.height / 2;

      const dx = mousePos.x - eyeCenterX;
      const dy = mousePos.y - eyeCenterY;
      const angle = Math.atan2(dy, dx);

      const distance = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.12, 18);

      const px = Math.cos(angle) * distance;
      const py = Math.sin(angle) * distance;

      pupil.style.transform = `translate(${px}px, ${py}px)`;
    };

    if (leftPupilRef.current && leftEyeRef.current)
      movePupil(leftPupilRef.current, leftEyeRef.current);
    if (rightPupilRef.current && rightEyeRef.current)
      movePupil(rightPupilRef.current, rightEyeRef.current);
  }, [mousePos]);

  const blink = useCallback(() => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 120);
  }, []);

  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 3000;
      return setTimeout(() => {
        blink();
        timerId = scheduleBlink();
      }, delay);
    };
    let timerId = scheduleBlink();
    return () => clearTimeout(timerId);
  }, [blink]);

  // Helper to determine eyebrow rotation classes dynamically
  const getEyebrowClass = (side: "left" | "right") => {
    if (mouthExpression === "furious") {
      return side === "left"
        ? "rotate-[20deg] translate-y-1"
        : "-rotate-[20deg] translate-y-1";
    }
    if (mouthExpression === "angry") {
      return side === "left" ? "rotate-[15deg]" : "-rotate-[15deg]";
    }
    if (mouthExpression === "irritated") {
      return side === "left"
        ? "rotate-[8deg] -translate-y-0.5"
        : "-rotate-[5deg] translate-y-0.5";
    }
    // grumpy
    return side === "left" ? "rotate-[5deg] translate-y-1" : "-rotate-[12deg]";
  };

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6 py-24 text-center">
      {/* Eyes + Eyebrows Container */}
      <div className="mb-10 flex items-center gap-6 sm:gap-10">
        {/* Left Eye Segment */}
        <div className="flex flex-col items-center">
          {/* Left Eyebrow */}
          <div
            className={`z-10 h-2 w-14 rounded-full bg-destructive transition-transform duration-300 origin-right ${getEyebrowClass("left")} sm:w-20 sm:h-3`}
          />
          {/* Left Eye Ball */}
          <div
            ref={leftEyeRef}
            className="relative mt-2 h-16 w-16 overflow-hidden rounded-full border-2 border-destructive/40 bg-background shadow-inner sm:h-24 sm:w-24"
          >
            <div
              ref={leftPupilRef}
              className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive sm:h-10 sm:w-10"
            >
              <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-background sm:right-2 sm:top-2 sm:h-2.5 sm:w-2.5" />
            </div>
            {/* Eyelid */}
            <div
              className="absolute inset-0 rounded-full bg-destructive/10"
              style={{
                transform: isBlinking ? "scaleY(1)" : "scaleY(0)",
                transformOrigin: "50% 0%",
                transition: "transform 0.08s ease",
              }}
            />
          </div>
        </div>

        {/* Right Eye Segment */}
        <div className="flex flex-col items-center">
          {/* Right Eyebrow */}
          <div
            className={`z-10 h-2 w-14 rounded-full bg-destructive transition-transform duration-300 origin-left ${getEyebrowClass("right")} sm:w-20 sm:h-3`}
          />
          {/* Right Eye Ball */}
          <div
            ref={rightEyeRef}
            className="relative mt-2 h-16 w-16 overflow-hidden rounded-full border-2 border-destructive/40 bg-background shadow-inner sm:h-24 sm:w-24"
          >
            <div
              ref={rightPupilRef}
              className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive sm:h-10 sm:w-10"
            >
              <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-background sm:right-2 sm:top-2 sm:h-2.5 sm:w-2.5" />
            </div>
            {/* Eyelid */}
            <div
              className="absolute inset-0 rounded-full bg-destructive/10"
              style={{
                transform: isBlinking ? "scaleY(1)" : "scaleY(0)",
                transformOrigin: "50% 0%",
                transition: "transform 0.08s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Irritated Mouth Expressions (Stretched horizontally) */}
      <div className="mb-6 flex justify-center">
        <svg
          width="80"
          height="32"
          viewBox="0 0 80 32"
          className="sm:scale-150"
          aria-hidden="true"
          key={mouthExpression}
        >
          {mouthExpression === "angry" && (
            <path
              d="M10 24 C 20 14, 60 14, 70 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="text-destructive"
            />
          )}
          {mouthExpression === "irritated" && (
            <path
              d="M12 20 Q 24 15, 40 22 T 68 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="text-destructive"
            />
          )}
          {mouthExpression === "furious" && (
            <rect
              x="12"
              y="14"
              width="56"
              height="10"
              rx="4"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-destructive"
            />
          )}
          {mouthExpression === "grumpy" && (
            <line
              x1="12"
              y1="21"
              x2="68"
              y2="17"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="text-destructive"
            />
          )}
        </svg>
      </div>

      <h1 className="font-heading text-[5rem] font-bold leading-none tracking-tighter text-destructive sm:text-[7rem]">
        Grrr!
      </h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground">
        Something is breaking behind the scenes. We are looking into this error.
      </p>

      <span className="mb-8 mt-2 rounded bg-muted px-2.5 py-1 font-mono text-xs text-destructive">
        {error.message || "ERR_SIGN_IN_FAILURE"}
      </span>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className={buttonVariants({ variant: "default", size: "lg" })}
        >
          <HugeiconsIcon icon={RefreshIcon} size={18} />
          Try again
        </button>
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
