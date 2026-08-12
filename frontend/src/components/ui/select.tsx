import { ChevronDown } from "lucide-react";
import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

import { cn } from "../../lib/utils";

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  containerClassName?: string;
  controlSize?: "sm" | "md";
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      children,
      className,
      containerClassName,
      controlSize = "md",
      disabled,
      ...props
    },
    ref,
  ) => (
    <span className={cn("relative inline-block", containerClassName)}>
      <select
        ref={ref}
        className={cn(
          "w-full cursor-pointer appearance-none rounded-md border border-border bg-background py-0 pl-3 pr-9 text-sm text-foreground outline-none transition-colors hover:border-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          controlSize === "sm" ? "h-9" : "h-10",
          className,
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
          disabled && "opacity-50",
        )}
      />
    </span>
  ),
);

Select.displayName = "Select";
