// import type React from "react";
// import type { ReactNode } from "react";
// import { cn } from "@/lib/utils";

// interface MarqueeProps {
//   children: ReactNode;
//   direction?: "left" | "right";
//   duration?: string; // e.g., "10s", "30s"
//   pauseOnHover?: boolean;
//   className?: string;
// }

// export const Marquee: React.FC<MarqueeProps> = ({
//   children,
//   direction = "left",
//   duration = "20s",
//   pauseOnHover = true,
//   className = "",
// }) => {
//   // Set inline dynamic CSS variable for duration
//   const style = { "--duration": duration } as React.CSSProperties;

//   return (
//     <div
//       className={cn(
//         `overflow-hidden flex w-full select-none`,
//         pauseOnHover && "pause-on-hover",
//         className,
//       )}
//       style={style}
//     >
//       <div
//         className={`flex min-w-full shrink-0 gap-8 justify-around items-center animate-marquee ${
//           direction === "right" ? "direction-reverse" : ""
//         }`}
//       >
//         {/* Original Content */}
//         {children}
//         {/* Cloned Content for Seamless Loop */}
//         {children}
//       </div>
//     </div>
//   );
// };

import type React from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  /**
   * Direction of marquee scrolling
   * @default "left"
   */
  direction?: "left" | "right";
  /**
   * Animation duration (e.g., "10s", "30s")
   * @default "20s"
   */
  duration?: string;
  /**
   * Pause animation on hover
   * @default true
   */
  pauseOnHover?: boolean;
  /**
   * Gap between repeated content
   * @default "1rem"
   */
  gap?: string;
  /**
   * Custom className
   */
  className?: string;
}

/**
 * Marquee Component
 *
 * Creates a seamless, looping horizontal scrolling animation.
 * The key to seamless repetition: content is duplicated exactly twice,
 * and animation translates by exactly 50% (moving one full copy).
 *
 * @example
 * ```tsx
 * <Marquee duration="15s" direction="left">
 *   <div>Your scrolling content here</div>
 * </Marquee>
 * ```
 */
export const Marquee: React.FC<MarqueeProps> = ({
  children,
  direction = "left",
  duration = "20s",
  pauseOnHover = true,
  gap = "4rem",
  className = "",
}) => {
  const isReverse = direction === "right";

  // CSS variables for animations
  const style = {
    "--marquee-duration": duration,
    "--marquee-gap": gap,
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        // Outer container - clips the content
        "w-full overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          // Inner wrapper - the animated element
          // CRITICAL: flex with no wrapping, and width set to 50% of parent
          // This ensures seamless looping when content duplicates
          "flex gap-[var(--marquee-gap)]",
          "w-fit", // Content natural width
          isReverse ? "animate-marquee-reverse" : "animate-marquee",
          pauseOnHover && "hover:pause-animation",
        )}
        style={style}
      >
        {/* First copy of content */}
        <div className="flex shrink-0 gap-[var(--marquee-gap)]">{children}</div>

        {/* Second copy of content - creates seamless loop */}
        <div className="flex shrink-0 gap-[var(--marquee-gap)]">{children}</div>
      </div>
    </div>
  );
};

export default Marquee;
