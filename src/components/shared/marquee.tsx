import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
  direction?: 'left' | 'right';
  duration?: string; // e.g., "10s", "30s"
  pauseOnHover?: boolean;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({
  children,
  direction = 'left',
  duration = '20s',
  pauseOnHover = true,
  className = '',
}) => {
  // Set inline dynamic CSS variable for duration
  const style = { '--duration': duration } as React.CSSProperties;

  return (
    <div 
      className={cn(`overflow-hidden flex w-full select-none`, pauseOnHover && "pause-on-hover", className)}
      style={style}
    >
      <div 
        className={`flex min-w-full shrink-0 gap-8 justify-around items-center animate-marquee ${
          direction === 'right' ? 'direction-reverse' : ''
        }`}
      >
        {/* Original Content */}
        {children}
        {/* Cloned Content for Seamless Loop */}
        {children}
      </div>
    </div>
  );
};
