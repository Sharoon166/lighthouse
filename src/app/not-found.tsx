"use client";

import { useEffect, useRef } from "react";
import {
  Home01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  delay: number;
  seed: number;
  size: number;
}

function useEmberParticles(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  targetRef: React.RefObject<HTMLElement>,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const target = targetRef.current;
    if (!canvas || !target) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let particles: Particle[] = [];
    let rafId = 0;
    let resizeTimer: ReturnType<typeof setTimeout>;

    const pointer = { x: 0, y: 0, active: false, radius: 0 };

    function buildTargets(w: number, h: number) {
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const octx = off.getContext("2d");
      if (!octx || !target) return [] as { x: number; y: number }[];

      const rect = target.getBoundingClientRect();
      const cs = getComputedStyle(target);
      const fontSize = parseFloat(cs.fontSize) * dpr;
      const fontWeight = cs.fontWeight || "700";
      const fontFamily = cs.fontFamily || "sans-serif";

      const cx = (rect.left + rect.width / 2) * dpr;
      const cy = (rect.top + rect.height / 2) * dpr;

      octx.fillStyle = "#fff";
      octx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillText("404", cx, cy);

      const data = octx.getImageData(0, 0, w, h).data;
      const pts: { x: number; y: number }[] = [];
      const step = Math.max(3, Math.floor(Math.min(w, h) / 240));
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          if (data[(y * w + x) * 4 + 3] > 140) pts.push({ x, y });
        }
      }
      for (let i = pts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pts[i], pts[j]] = [pts[j], pts[i]];
      }
      return pts;
    }

    function init() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width = window.innerWidth * dpr;
      H = canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      pointer.radius = 90 * dpr;

      const targets = buildTargets(W, H);
      const maxParticles = Math.min(
        targets.length,
        window.innerWidth < 640 ? 800 : 1600,
      );
      const chosen = targets.slice(0, maxParticles);

      particles = chosen.map((t) => {
        const startX = Math.random() * W;
        const startY = H + Math.random() * H * 0.6;
        return {
          x: reduceMotion ? t.x : startX,
          y: reduceMotion ? t.y : startY,
          vx: 0,
          vy: 0,
          tx: t.x,
          ty: t.y,
          delay: reduceMotion ? 0 : Math.random() * 1.6,
          seed: Math.random() * 1000,
          size: (0.8 + Math.random() * 1.6) * dpr,
        };
      });
    }

    function frame(now: number) {
      if (!ctx) return;
      const t = now * 0.001;

      ctx.fillStyle = "rgba(6,6,10,0.22)";
      ctx.globalCompositeOperation = "source-over";
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";

      for (const p of particles) {
        const springK = t > p.delay ? 0.028 : 0.0;
        let ax = (p.tx - p.x) * springK;
        let ay = (p.ty - p.y) * springK;

        ax += Math.sin(t * 0.6 + p.seed) * 0.015;
        ay += Math.cos(t * 0.5 + p.seed * 1.3) * 0.015;

        if (t <= p.delay) ay -= 0.05;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          if (dist < pointer.radius) {
            const f = (1 - dist / pointer.radius) * 2.4;
            ax += (dx / dist) * f;
            ay += (dy / dist) * f;
          }
        }

        p.vx = (p.vx + ax) * 0.9;
        p.vy = (p.vy + ay) * 0.9;
        p.x += p.vx;
        p.y += p.vy;

        const flicker = 0.55 + 0.45 * Math.sin(t * 2.2 + p.seed * 3.0);
        const r = p.size * (0.8 + 0.5 * flicker);
        const alpha = 0.35 + 0.5 * flicker;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        grad.addColorStop(0, `rgba(255, 224, 158, ${alpha})`);
        grad.addColorStop(0.4, `rgba(232, 178, 74, ${alpha * 0.5})`);
        grad.addColorStop(1, "rgba(232, 178, 74, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      rafId = requestAnimationFrame(frame);
    }

    function setPointer(clientX: number, clientY: number) {
      pointer.x = clientX * dpr;
      pointer.y = clientY * dpr;
      pointer.active = true;
    }

    const onPointerMove = (e: PointerEvent) => setPointer(e.clientX, e.clientY);
    const onPointerLeave = () => (pointer.active = false);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => (pointer.active = false);
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 200);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("resize", onResize);

    document.fonts.ready.then(() => {
      init();
      rafId = requestAnimationFrame(frame);
    });

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
    };
  }, [canvasRef, targetRef]);
}

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  useEmberParticles(canvasRef, numberRef);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      />
      <div className="animate-glance-in relative z-10 space-y-8">
        <div className="relative">
          <span
            ref={numberRef}
            className="block font-heading text-[8rem] font-bold leading-none tracking-tighter text-muted/60 select-none sm:text-[12rem] text-transparent"
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-4xl font-bold text-gold sm:text-5xl">
              Lost in the dark?
            </span>
          </div>
        </div>
        <p className="mx-auto max-w-md text-lg text-muted-foreground">
          This page doesn&apos;t exist or has been moved. Let&apos;s get you back to something bright.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            <HugeiconsIcon icon={Home01Icon} size={18} />
            Back to home
          </Link>
          <Link
            href="/blog"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <HugeiconsIcon icon={Search01Icon} size={18} />
            Browse the blog
          </Link>
        </div>
      </div>
    </main>
  );
}