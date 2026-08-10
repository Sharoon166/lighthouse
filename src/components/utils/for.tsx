import React, { ReactNode } from 'react';

interface ForProps<T> {
  each: T[] | null | undefined;
  fallback?: ReactNode;
  // Allows you to pass a key string, a tracking function, or defaults to index
  by?: keyof T | ((item: T, index: number) => string | number);
  children: (item: T, index: number) => ReactNode;
}

export function For<T>({ each, fallback = null, by, children }: ForProps<T>) {
  // 1. Handle empty or null arrays immediately
  if (!each || each.length === 0) return <>{fallback}</>;

  return (
    <>
      {each.map((item, index) => {
        // 2. Resolve the unique key based on the 'by' prop configuration
        let itemKey: string | number = index;
        
        if (typeof by === 'function') {
          itemKey = by(item, index);
        } else if (by && item && typeof item === 'object' && by in item) {
          itemKey = String(item[by]);
        }

        // 3. Automatically inject the key into a React Fragment wrapper
        return (
          <React.Fragment key={itemKey}>
            {children(item, index)}
          </React.Fragment>
        );
      })}
    </>
  );
}
