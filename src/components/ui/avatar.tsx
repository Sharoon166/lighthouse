import type * as React from "react";
import { cn } from "@/lib/utils";

function Avatar({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar"
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full bg-secondary text-secondary-foreground ring-1 ring-border",
        className,
      )}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full font-heading text-sm font-semibold",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback };
