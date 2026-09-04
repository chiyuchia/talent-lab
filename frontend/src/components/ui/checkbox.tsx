import { Check } from "lucide-react";
import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "../../lib/utils";

export const Checkbox = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, disabled, ...props }, ref) => (
  <label
    className={cn(
      "relative inline-flex h-4 w-4 shrink-0 items-center justify-center",
      disabled ? "cursor-not-allowed" : "cursor-pointer",
      className,
    )}
  >
    <input
      ref={ref}
      type="checkbox"
      disabled={disabled}
      className="peer sr-only"
      {...props}
    />
    <span className="absolute inset-0 rounded border border-control bg-background transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-disabled:opacity-40" />
    <Check
      aria-hidden="true"
      className="pointer-events-none relative h-3 w-3 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100"
      strokeWidth={3}
    />
  </label>
));

Checkbox.displayName = "Checkbox";
