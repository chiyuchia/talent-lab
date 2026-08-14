import { ExternalLink, PanelsTopLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ResizableDrawer } from "../ResizableDrawer";

type Props = {
  open: boolean;
  pdfUrl: string;
  resumeFilename: string;
  onClose: () => void;
};

export function OriginalResumeSidebar({
  open,
  pdfUrl,
  resumeFilename,
  onClose,
}: Props) {
  const { t } = useTranslation();
  return (
    <ResizableDrawer
      open={open}
      onClose={onClose}
      title={t("原始简历")}
      minWidth={420}
      maxWidth={960}
      defaultWidth={680}
    >
      <div className="flex min-h-full flex-col">
        <div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <PanelsTopLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium">{resumeFilename}</span>
          </div>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={t("在新窗口打开原始简历")}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <iframe
          title={t("原始 PDF")}
          src={pdfUrl}
          className="h-[calc(100dvh-7.5rem)] min-h-[28rem] w-full rounded-md border border-border bg-background"
        />
      </div>
    </ResizableDrawer>
  );
}
