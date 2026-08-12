import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { CandidateSummary } from "../../types/api";
import { ResumeStreamViewer } from "../ResumeStreamViewer";
import { ParseStatusBadge } from "../StatusBadge";

export type QueueItem = CandidateSummary & {
  message?: string;
};

interface UploadQueueListProps {
  queue: QueueItem[];
  streams: Record<number, string>;
}

export function UploadQueueList({ queue, streams }: UploadQueueListProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border border-border bg-card animate-fade-in-up animation-delay-100">
      <div className="border-b border-border px-4 py-3 font-medium">{t("解析队列")}</div>
      <div className="divide-y divide-border stagger-children">
        {queue.map((item) => (
          <div
            key={item.id}
            className="p-4 flex flex-col"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <FileText className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{item.name || item.original_filename}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(item.message || item.error_message || item.email || "等待处理")}
                  </p>
                </div>
              </div>
              <ParseStatusBadge status={item.parse_status} />
            </div>
            {/* Real-time Streaming Area */}
            {(item.parse_status === "extracting" || streams[item.id]) && (
              <ResumeStreamViewer
                streamText={streams[item.id] || ""}
                isCompleted={item.parse_status === "completed"}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
