import { GripVertical } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "../../lib/utils";
import { Button, type ButtonProps } from "../ui/button";

export function DragHandle({ className, ...props }: ButtonProps) {
  const { t } = useTranslation();
  const label = t("拖动调整顺序，或使用上下方向键");
  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        "h-9 w-7 shrink-0 cursor-grab text-muted-foreground opacity-45 hover:opacity-100 active:cursor-grabbing active:scale-100 focus-visible:opacity-100",
        className,
      )}
      aria-label={label}
      aria-keyshortcuts="ArrowUp ArrowDown"
      title={label}
      {...props}
    >
      <GripVertical className="h-4 w-4" />
    </Button>
  );
}
