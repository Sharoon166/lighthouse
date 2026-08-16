import type * as React from "react";
import { cn } from "@/lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: shadcn separator renders a div with a separator role
    // biome-ignore lint/a11y/useFocusableInteractive: decorative separator, not focusable by design
    <div
      data-slot="separator"
      // biome-ignore lint/a11y/useAriaPropsForRole: decorative separator omits aria-valuenow by design
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
