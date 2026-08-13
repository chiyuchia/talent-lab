import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { jobsApi } from "../../lib/api";
import { getErrorMessage } from "../../lib/errors";
import { applicationStatusOptions } from "../../lib/job-options";
import type { ApplicationEventDraft, ApplicationStatus } from "../../types/api";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";
import { Select } from "../ui/select";

type Props = { jobId: number; onStatusChange: (status: ApplicationStatus) => void };

function initialDraft(): ApplicationEventDraft {
  const local = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000);
  return { type: "note", title: "", notes: "", occurred_at: local.toISOString().slice(0, 16), status: null };
}

export function JobTimeline({ jobId, onStatusChange }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(initialDraft);
  const eventsQuery = useQuery({ queryKey: ["jobs", jobId, "events"], queryFn: () => jobsApi.listEvents(jobId) });
  const eventMutation = useMutation({
    mutationFn: () => jobsApi.createEvent(jobId, draft),
    onSuccess: async (event) => {
      if (event.status) onStatusChange(event.status);
      setDraft(initialDraft());
      await queryClient.invalidateQueries({ queryKey: ["jobs", jobId, "events"] });
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-5">
      <div>
        <h3 className="font-medium">{t("申请时间线")}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{t("补录面试、测评、Offer、备注或待办事项。")}</p>
      </div>
      <div className="grid gap-3 rounded-md border border-border bg-background p-3 md:grid-cols-2">
        <Select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as ApplicationEventDraft["type"] })}>
          <option value="note">{t("备注")}</option>
          <option value="task">{t("待办")}</option>
          <option value="assessment">{t("笔试或测评")}</option>
          <option value="interview">{t("面试")}</option>
          <option value="offer">{t("Offer")}</option>
          <option value="status_change">{t("状态变更")}</option>
        </Select>
        <Input type="datetime-local" value={draft.occurred_at} onChange={(e) => setDraft({ ...draft, occurred_at: e.target.value })} />
        {draft.type === "status_change" ? (
          <Select value={draft.status ?? ""} onChange={(e) => setDraft({ ...draft, status: e.target.value as ApplicationStatus })}>
            <option value="">{t("选择申请状态")}</option>
            {applicationStatusOptions.map(({ value, label }) => (
              <option key={value} value={value}>{t(label)}</option>
            ))}
          </Select>
        ) : null}
        <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder={t("事件标题（可选）") } />
        <Textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder={t("补充记录") } className="md:col-span-2" />
        <div className="flex items-center justify-between gap-3 md:col-span-2">
          <span className="text-xs text-destructive">{eventMutation.isError ? getErrorMessage(eventMutation.error) : ""}</span>
          <Button size="sm" disabled={eventMutation.isPending || (draft.type === "status_change" && !draft.status)} onClick={() => eventMutation.mutate()}><Plus className="h-4 w-4" /> {t("添加事件")}</Button>
        </div>
      </div>
      <div className="relative space-y-4 border-l border-border pl-5">
        {(eventsQuery.data?.items ?? []).map((event) => (
          <article key={event.id} className="relative">
            <span className="absolute -left-[1.63rem] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-card" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{event.title}</p>
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3 w-3" />{new Date(event.occurred_at).toLocaleString()}</span>
            </div>
            {event.notes ? <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-muted-foreground">{event.notes}</p> : null}
          </article>
        ))}
        {!eventsQuery.isLoading && !eventsQuery.data?.items.length ? <p className="text-sm text-muted-foreground">{t("暂无申请事件")}</p> : null}
      </div>
    </section>
  );
}
