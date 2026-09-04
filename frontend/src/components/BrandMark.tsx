import { FlaskConical } from "lucide-react";

import { cn } from "../lib/utils";

interface BrandMarkProps {
  className?: string;
  iconClassName?: string;
}

export function BrandMark({ className, iconClassName }: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground",
        className,
      )}
    >
      <FlaskConical className={cn("h-[18px] w-[18px]", iconClassName)} />
    </span>
  );
}
