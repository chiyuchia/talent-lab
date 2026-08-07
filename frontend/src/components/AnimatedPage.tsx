import type { ReactNode } from "react";

import { cn } from "../lib/utils";

type AnimatedPageProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Wrapper that applies a fade-in-up page entrance animation.
 * Wrap each page's root element with this for consistent page transitions.
 */
export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <div className={cn("page-enter", className)}>
      {children}
    </div>
  );
}
