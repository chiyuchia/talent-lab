import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadCloud } from "lucide-react";
import { useTranslation } from "react-i18next";

import { API_PREFIX, uploadApi } from "../../lib/api";
import type { CandidateDetail, CandidateSummary } from "../../types/api";
import { EmptyState } from "../EmptyState";
import { Button } from "../ui/button";
import { UploadQueueList } from "../upload/UploadQueueList";
import type { QueueItem } from "../upload/UploadQueueList";
import { UploadQueueSkeleton } from "../upload/UploadQueueSkeleton";

const MAX_UPLOAD_FILES = 5;

export function ResumeUploadPanel() {
  const { t } = useTranslation();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [error, setError] = useState("");
  const [streams, setStreams] = useState<Record<number, string>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const terminalCandidateIdsRef = useRef(new Set<number>());
  const candidateCountRef = useRef(0);
  const queryClient = useQueryClient();

  useEffect(() => () => eventSourceRef.current?.close(), []);

  const uploadMutation = useMutation({
    mutationFn: uploadApi.uploadResumes,
    onSuccess: (data) => {
      setStreams({});
      setQueue(data.candidates);
      candidateCountRef.current = data.candidates.length;
      terminalCandidateIdsRef.current.clear();
      subscribeToUpload(data.upload_id);
      void queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  function handleFiles(files: FileList | File[]) {
    const selected = Array.from(files).filter(
      (file) => file.type === "application/pdf" || file.name.endsWith(".pdf"),
    );
    setError("");
    if (!selected.length) {
      setError(t("请选择 PDF 文件。"));
      return;
    }
    if (selected.length > MAX_UPLOAD_FILES) {
      setError(t("单次最多上传 {{value}} 个 PDF 文件，请减少后重试。", { value: MAX_UPLOAD_FILES }));
      return;
    }
    uploadMutation.mutate(selected);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) handleFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  }

  function subscribeToUpload(uploadId: string) {
    eventSourceRef.current?.close();
    const source = new EventSource(`${API_PREFIX}/uploads/${uploadId}/events`, {
      withCredentials: true,
    });
    eventSourceRef.current = source;
    const updateCandidate = (candidate: CandidateSummary | CandidateDetail, message?: string) => {
      setQueue((current) =>
        current.map((item) => (item.id === candidate.id ? { ...item, ...candidate, message } : item)),
      );
      if (candidate.parse_status === "completed" || candidate.parse_status === "failed") {
        terminalCandidateIdsRef.current.add(candidate.id);
        void queryClient.invalidateQueries({ queryKey: ["candidates"] });
        if (terminalCandidateIdsRef.current.size >= candidateCountRef.current) source.close();
      }
    };

    ["uploaded", "parsing", "extracting", "partial_result", "completed"].forEach((eventName) => {
      source.addEventListener(eventName, (event) => {
        const payload = JSON.parse(event.data) as { candidate?: CandidateSummary | CandidateDetail };
        if (payload.candidate) updateCandidate(payload.candidate);
      });
    });
    source.addEventListener("extract_chunk", (event) => {
      const payload = JSON.parse(event.data) as { candidate_id: number; chunk: string };
      setStreams((current) => ({
        ...current,
        [payload.candidate_id]: (current[payload.candidate_id] || "") + payload.chunk,
      }));
    });
    source.addEventListener("error", (event) => {
      if ("data" in event && typeof event.data === "string" && event.data) {
        const payload = JSON.parse(event.data) as { candidate?: CandidateSummary; message?: string };
        if (payload.candidate) updateCandidate(payload.candidate, payload.message);
      }
    });
  }

  return (
    <section className="space-y-6" aria-label={t("添加简历")}>
      <div
        className="grid min-h-64 place-items-center rounded-lg border border-dashed border-border bg-card p-8 text-center transition-colors duration-200 hover:border-primary/40 hover:bg-muted/50"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div>
          <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-medium">{t("拖拽 PDF 到此处")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("支持批量上传，单次最多 {{value}} 份 PDF 简历", { value: MAX_UPLOAD_FILES })}</p>
          <input ref={inputRef} className="hidden" type="file" accept="application/pdf" multiple onChange={handleInputChange} />
          <Button onClick={() => inputRef.current?.click()} disabled={uploadMutation.isPending} className="mt-5">
            {t("选择文件")}
          </Button>
        </div>
      </div>
      {error ? <p className="animate-fade-in rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      <div aria-live="polite" aria-busy={uploadMutation.isPending}>
        {uploadMutation.isPending ? <UploadQueueSkeleton /> : queue.length ? (
          <UploadQueueList queue={queue} streams={streams} />
        ) : (
          <EmptyState title={t("暂无上传任务")} description={t("上传后会在这里展示每份简历的解析状态")} />
        )}
      </div>
    </section>
  );
}
