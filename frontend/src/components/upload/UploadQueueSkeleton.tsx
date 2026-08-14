import { Skeleton } from "../Skeleton";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";

export function UploadQueueSkeleton() {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border border-border" role="status" aria-live="polite" aria-label={t("正在创建解析队列")}>
      <span className="sr-only">{t("正在创建解析队列")}</span>
      <div className="border-b border-border px-4 py-3">
        <Skeleton className="h-5 w-24 skeleton-shimmer" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Skeleton className="mt-1 h-5 w-5 rounded skeleton-shimmer" />
                <div className="space-y-2">
                  <Skeleton className={cn("h-4 skeleton-shimmer", index === 0 ? "w-48" : "w-40")} />
                  <Skeleton className="h-3 w-56 max-w-full skeleton-shimmer" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full skeleton-shimmer" />
            </div>
            <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-muted/50 p-4 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-7">
                <Skeleton className="h-10 w-full rounded-lg skeleton-shimmer" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Skeleton className="h-16 w-full rounded-lg skeleton-shimmer" />
                  <Skeleton className="h-16 w-full rounded-lg skeleton-shimmer" />
                </div>
                <Skeleton className="h-20 w-full rounded-lg skeleton-shimmer" />
              </div>
              <div className="terminal-surface space-y-2 rounded-lg p-4 lg:col-span-5">
                <Skeleton className="terminal-line-bg h-3 w-4/5 rounded-sm" />
                <Skeleton className="terminal-line-bg h-3 w-11/12 rounded-sm" />
                <Skeleton className="terminal-line-bg h-3 w-2/3 rounded-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
