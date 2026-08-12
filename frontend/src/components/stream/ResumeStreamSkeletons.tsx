import { Cpu } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Skeleton } from "../Skeleton";

export function FieldValueSkeleton({ className = "w-28" }: { className?: string }) {
  return <Skeleton className={`mt-1.5 h-4 ${className}`} />;
}

export function SkillListSkeleton() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-1.5" role="status" aria-label={t("正在加载技能标签")}>
      <span className="sr-only">{t("正在加载技能标签")}</span>
      {["w-12", "w-16", "w-10", "w-20", "w-14"].map((width, index) => (
        <Skeleton key={index} className={`h-6 ${width}`} />
      ))}
    </div>
  );
}

export function TimelineSkeleton({
  count = 2,
  variant,
}: {
  count?: number;
  variant: "education" | "experience";
}) {
  const { t } = useTranslation();
  const lineClass = "border-primary/25";
  const dotClass = "bg-primary/40";

  return (
    <div className={`relative ml-3 space-y-5 border-l-2 border-dashed pl-6 ${lineClass}`} role="status" aria-label={t("正在加载时间线")}>
      <span className="sr-only">{t("正在加载时间线")}</span>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="relative">
          <span className={`absolute -left-[32px] top-1.5 h-4 w-4 rounded-full border-2 border-card shadow-sm ${dotClass}`} />
          <div className="rounded-lg border border-border/60 bg-muted/40 p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-2">
                <Skeleton className="mt-0.5 h-4 w-4 rounded" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className={`h-4 ${index === 0 ? "w-40" : "w-32"}`} />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 shrink-0" />
            </div>
            {variant === "experience" && (
              <div className="mt-3 space-y-2 border-t border-border pt-2.5">
                <Skeleton className="h-3 w-11/12" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectSkeleton() {
  const { t } = useTranslation();
  return (
    <div className="space-y-3.5" role="status" aria-label={t("正在加载项目经历")}>
      <span className="sr-only">{t("正在加载项目经历")}</span>
      {["w-44", "w-36"].map((titleWidth, index) => (
        <div key={index} className="rounded-lg border border-border/60 bg-muted/40 p-4">
          <div className="flex items-start gap-2">
            <Skeleton className="mt-0.5 h-4 w-4 rounded" />
            <Skeleton className={`h-4 ${titleWidth}`} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-12 rounded" />
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-10 rounded" />
          </div>
          <div className="mt-3.5 space-y-2 border-t border-border pt-2.5">
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TerminalSkeleton() {
  const { t } = useTranslation();
  return (
    <div className="space-y-2" role="status" aria-label={t("等待大模型提取接口响应")}>
      <span className="sr-only">{t("等待大模型提取接口响应")}</span>
      {["w-4/5", "w-11/12", "w-2/3", "w-5/6", "w-3/5", "w-10/12", "w-7/12"].map((width, index) => (
        <Skeleton key={index} className={`terminal-line-bg h-3 rounded-sm ${width}`} />
      ))}
      <div className="terminal-dim flex items-center gap-2 pt-3">
        <Cpu className="terminal-accent h-5 w-5 animate-pulse opacity-50" />
        <span className="animate-pulse">{t("正在建立解析流...")}</span>
      </div>
    </div>
  );
}
