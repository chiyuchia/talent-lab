import type { ReactNode } from "react";

import { cn } from "../lib/utils";
import { Badge, type BadgeVariant } from "./ui/badge";

type TagTone = "skill" | "muted";

const toneVariant: Record<TagTone, BadgeVariant> = {
  skill: "default",
  muted: "outline",
};

type TagProps = {
  children: ReactNode;
  className?: string;
  tone?: TagTone;
};

export function Tag({ children, className, tone = "skill" }: TagProps) {
  return (
    <Badge variant={toneVariant[tone]} className={className}>
      <span className="truncate">{children}</span>
    </Badge>
  );
}

type TagListProps = {
  items: string[];
  limit?: number;
  emptyText?: string;
  className?: string;
};

export function TagList({ items, limit, emptyText = "--", className }: TagListProps) {
  const visibleItems = limit ? items.slice(0, limit) : items;
  const hiddenCount = limit ? Math.max(items.length - limit, 0) : 0;

  if (!items.length) {
    return <span className="text-sm text-muted-foreground">{emptyText}</span>;
  }

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visibleItems.map((item, index) => (
        <Tag key={`${item}-${index}`}>{item}</Tag>
      ))}
      {hiddenCount > 0 ? <Tag tone="muted">+{hiddenCount}</Tag> : null}
    </div>
  );
}
