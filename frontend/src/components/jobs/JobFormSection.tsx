import type { ReactNode } from "react";

type JobFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function JobFormSection({ title, description, children }: JobFormSectionProps) {
  return (
    <section className="space-y-4 border-t border-border pt-6 first:border-t-0 first:pt-0">
      <div>
        <h3 className="font-medium">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
