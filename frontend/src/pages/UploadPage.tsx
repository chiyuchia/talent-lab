import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadCloud } from "lucide-react";

import { AnimatedPage } from "../components/AnimatedPage";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/button";
import { UploadQueueList } from "../components/upload/UploadQueueList";
import type { QueueItem } from "../components/upload/UploadQueueList";
import { UploadQueueSkeleton } from "../components/upload/UploadQueueSkeleton";
import { API_PREFIX, uploadApi } from "../lib/api";
import type { CandidateDetail, CandidateSummary } from "../types/api";

const MAX_UPLOAD_FILES = 5;

export function UploadPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [error, setError] = useState("");
  const [streams, setStreams] = useState<Record<number, string>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: uploadApi.uploadResumes,
    onSuccess: (data) => {
      setStreams({});
      setQueue(data.candidates);
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
      setError("请选择 PDF 文件。");
      return;
    }
    if (selected.length > MAX_UPLOAD_FILES) {
      setError(`单次最多上传 ${MAX_UPLOAD_FILES} 个 PDF 文件，请减少后重试。`);
      return;
    }
    uploadMutation.mutate(selected);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) handleFiles(event.target.files);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  }

  function subscribeToUpload(uploadId: string) {
    const source = new EventSource(`${API_PREFIX}/uploads/${uploadId}/events`, { withCredentials: true });
    const updateCandidate = (candidate: CandidateSummary | CandidateDetail, message?: string) => {
      setQueue((current) =>
        current.map((item) => (item.id === candidate.id ? { ...item, ...candidate, message } : item)),
      );
      void queryClient.invalidateQueries({ queryKey: ["candidates"] });
    };

    ["uploaded", "parsing", "extracting", "partial_result", "completed"].forEach((eventName) => {
      source.addEventListener(eventName, (event) => {
        const payload = JSON.parse(event.data) as { candidate?: CandidateSummary | CandidateDetail };
        if (payload.candidate) updateCandidate(payload.candidate);
      });
    });

    source.addEventListener("extract_chunk", (event) => {
      const payload = JSON.parse(event.data) as {
        candidate_id: number;
        chunk: string;
      };
      setStreams((current) => {
        const prev = current[payload.candidate_id] || "";
        return {
          ...current,
          [payload.candidate_id]: prev + payload.chunk,
        };
      });
    });

    source.addEventListener("error", (event) => {
      if ("data" in event && typeof event.data === "string" && event.data) {
        const payload = JSON.parse(event.data) as { candidate?: CandidateSummary; message?: string };
        if (payload.candidate) updateCandidate(payload.candidate, payload.message);
      }
      if (queue.every((item) => item.parse_status === "completed" || item.parse_status === "failed")) {
        source.close();
      }
    });
  }

  return (
    <AnimatedPage>
      <section className="space-y-6">
        <div className="animate-fade-in-down">
          <h2 className="text-2xl font-semibold">上传简历</h2>
          <p className="mt-1 text-sm text-muted-foreground">PDF 批量上传与解析队列</p>
        </div>
        <div
          className="grid min-h-72 place-items-center rounded-lg border border-dashed border-border bg-card p-8 text-center transition-colors duration-300 hover:bg-muted/50 hover:border-primary/40 animate-fade-in-up animation-delay-50"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <div>
            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 font-medium">拖拽 PDF 到此处</p>
            <p className="mt-2 text-sm text-muted-foreground">支持批量上传，单次最多 5 份 PDF 简历</p>
            <input
              ref={inputRef}
              className="hidden"
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleInputChange}
            />
            <Button
              onClick={() => inputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="mt-5"
            >
              选择文件
            </Button>
          </div>
        </div>
        {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">{error}</p> : null}
        {uploadMutation.isPending ? (
          <UploadQueueSkeleton />
        ) : queue.length ? (
          <UploadQueueList queue={queue} streams={streams} />
        ) : (
          <EmptyState title="暂无上传任务" description="上传后会在这里展示每份简历的解析状态" />
        )}
      </section>
    </AnimatedPage>
  );
}
