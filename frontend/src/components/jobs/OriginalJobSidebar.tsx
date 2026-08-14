import { ExternalLink, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { JobOpportunity } from "../../types/api";
import { ResizableDrawer } from "../ResizableDrawer";

type Props = {
  open: boolean;
  job: JobOpportunity;
  onClose: () => void;
};

export function OriginalJobSidebar({ open, job, onClose }: Props) {
  const { t } = useTranslation();
  return (
    <ResizableDrawer
      open={open}
      onClose={onClose}
      title={t("原始职位信息")}
      minWidth={420}
      maxWidth={900}
      defaultWidth={640}
    >
      <div className="rounded-md border border-border bg-card">
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{job.title}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{job.company_name}</p>
            </div>
          </div>
          {job.source_url ? (
            <a
              href={job.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {t("打开职位来源")}<ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
        <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto whitespace-pre-wrap px-4 py-4 text-sm leading-6 text-foreground">
          {job.raw_jd || t("尚未添加职位描述")}
        </div>
      </div>
    </ResizableDrawer>
  );
}
