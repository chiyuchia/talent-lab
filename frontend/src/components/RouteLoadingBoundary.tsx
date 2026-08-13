import { Suspense, type ReactNode } from "react";

interface RouteLoadingBoundaryProps {
  children: ReactNode;
  fullScreen?: boolean;
}

export function RouteLoadingBoundary({
  children,
  fullScreen = false,
}: RouteLoadingBoundaryProps) {
  return (
    <Suspense
      fallback={
        <div
          aria-label="Loading"
          className={`grid place-items-center ${fullScreen ? "min-h-dvh" : "min-h-[40vh]"}`}
          role="status"
        >
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
