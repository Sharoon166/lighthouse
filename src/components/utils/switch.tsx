import React from "react";
import type { ReactNode } from "react";

interface SwitchProps {
  fallback?: ReactNode;
  children: React.ReactElement<MatchProps> | React.ReactElement<MatchProps>[];
}

interface MatchProps {
  when: boolean;
  children: ReactNode | (() => ReactNode);
}

export const Match: React.FC<MatchProps> = ({ children }) => {
  return typeof children === 'function' ? <>{(children as () => ReactNode)()}</> : <>{children}</>;
};

export const Switch: React.FC<SwitchProps> = ({ children, fallback = null }) => {
  const matchArray = React.Children.toArray(children) as React.ReactElement<MatchProps>[];
  
  // Find the first Match child where 'when' is true
  const firstMatch = matchArray.find((child) => child.props.when);

  return firstMatch ? firstMatch : <>{fallback}</>;
};
