import type React from "react";
import type { ReactNode } from "react";

interface ShowProps {
  when: boolean;
  fallback?: ReactNode;
  children: ReactNode | (() => ReactNode);
}

export const Show: React.FC<ShowProps> = ({
  when,
  fallback = null,
  children,
}) => {
  if (!when) return <>{fallback}</>;
  return typeof children === "function" ? (
    <>{(children as () => ReactNode)()}</>
  ) : (
    <>{children}</>
  );
};
