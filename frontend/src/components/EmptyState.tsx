import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
};

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-border bg-card p-6 text-center">
      <div>
        {icon ? <div className="mb-3 flex justify-center text-muted-foreground">{icon}</div> : null}
        <p className="font-medium">{title}</p>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}
