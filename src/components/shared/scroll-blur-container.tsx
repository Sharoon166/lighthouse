import React, { useRef, useState, useEffect } from 'react';

interface ScrollBlurContainerProps {
  children: React.ReactNode;
  /** Custom width for the blur fade zone (default: 48px / w-12) */
  blurWidth?: string;
  /** Optional class to pass to the outermost container wrapper */
  className?: string;
  /** Background color variable or utility to match your layout (default: from-background) */
  backgroundClass?: string;
}

export const ScrollBlurContainer: React.FC<ScrollBlurContainerProps> = ({
  children,
  blurWidth = '3rem', // 48px
  className = '',
  backgroundClass = 'from-background via-background/70 to-transparent',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    // Use a small 2px buffer to absorb browser rounding discrepancies
    setShowLeft(scrollLeft > 2);
    setShowRight(scrollWidth - scrollLeft - clientWidth > 2);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();

    // Re-calculate if items scale inside, window resizes, or content updates dynamically
    const observer = new ResizeObserver(() => checkScroll());
    observer.observe(container);
    
    // Also monitor deeply nested child changes if content loads asynchronously
    const mutationObserver = new MutationObserver(() => checkScroll());
    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [children]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Left Progressive Blur Indicator */}
      <div
        className={`absolute left-0 top-0 bottom-0 z-20 pointer-events-none transition-opacity duration-300 bg-linear-to-r ${backgroundClass} backdrop-blur-[2px] [mask-image:linear-gradient(to_right,rgba(0,0,0,1),transparent)] ${
          showLeft ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ width: blurWidth }}
      />

      {/* Interactive Horizontal Scroll Track */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="w-full overflow-x-auto scroll-smooth py-1"
        style={{
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}
      >
        {/* Universal layout helper to enforce horizontal behavior */}
        <div className="w-max max-w-none flex flex-nowrap items-center">
          {children}
        </div>
      </div>

      {/* Right Progressive Blur Indicator */}
      <div
        className={`absolute right-0 top-0 bottom-0 z-20 pointer-events-none transition-opacity duration-300 bg-linear-to-l ${backgroundClass} backdrop-blur-[2px] [mask-image:linear-gradient(to_left,rgba(0,0,0,1),transparent)] ${
          showRight ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ width: blurWidth }}
      />
    </div>
  );
};
