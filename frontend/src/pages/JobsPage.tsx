import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AnimatedPage } from "../components/AnimatedPage";
import { JobFormPanel, type JobForm } from "../components/jobs/JobFormPanel";
import { Button } from "../components/ui/button";
import { jobsApi } from "../lib/api";
import { getErrorMessage } from "../lib/errors";
import type { JobDescription } from "../types/api";

const emptyJobForm: JobForm = {
  title: "",
  description: "",
  required_skills: [],
  bonus_skills: [],
};

function copyJobForm(form: JobForm): JobForm {
  return {
    ...form,
    required_skills: [...form.required_skills],
    bonus_skills: [...form.bonus_skills],
  };
}

export function JobsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const jobsQuery = useQuery({ queryKey: ["jobs"], queryFn: jobsApi.list });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<JobForm>(() => copyJobForm(emptyJobForm));
  const [initialForm, setInitialForm] = useState<JobForm>(() => copyJobForm(emptyJobForm));
  const [recentlySavedId, setRecentlySavedId] = useState<number | null>(null);
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(copyJobForm(emptyJobForm));
    setInitialForm(copyJobForm(emptyJobForm));
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = copyJobForm(form);
      return editingId ? jobsApi.update(editingId, payload) : jobsApi.create(payload);
    },
    onSuccess: async (savedJob) => {
      setRecentlySavedId(savedJob.id);
      closeForm();
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: jobsApi.delete,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });

  function createJob() {
    saveMutation.reset();
    const nextForm = copyJobForm(emptyJobForm);
    setEditingId(null);
    setForm(nextForm);
    setInitialForm(copyJobForm(nextForm));
    setShowForm(true);
  }

  function editJob(job: JobDescription) {
    saveMutation.reset();
    const nextForm = {
      title: job.title,
      description: job.description,
      required_skills: [...job.required_skills],
      bonus_skills: [...job.bonus_skills],
    };
    setEditingId(job.id);
    setForm(nextForm);
    setInitialForm(copyJobForm(nextForm));
    setShowForm(true);
  }

  function returnToList() {
    if (isDirty && !window.confirm(t("当前填写的内容尚未保存，确定放弃并返回岗位列表吗？"))) return;
    closeForm();
  }

  useEffect(() => {
    if (!showForm || !isDirty) return undefined;
    function confirmPageExit(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", confirmPageExit);
    return () => window.removeEventListener("beforeunload", confirmPageExit);
  }, [isDirty, showForm]);

  useEffect(() => {
    if (!recentlySavedId) return undefined;
    const timer = window.setTimeout(() => setRecentlySavedId(null), 2400);
    return () => window.clearTimeout(timer);
  }, [recentlySavedId]);

  return (
    <AnimatedPage>
      {showForm ? (
        <JobFormPanel
          form={form}
          editing={editingId !== null}
          saving={saveMutation.isPending}
          error={saveMutation.isError ? getErrorMessage(saveMutation.error) : null}
          onChange={setForm}
          onCancel={returnToList}
          onSubmit={() => saveMutation.mutate()}
        />
      ) : (
        <section className="space-y-6">
          <div className="flex items-start justify-between gap-4 animate-fade-in-down">
            <div>
              <h2 className="text-2xl font-semibold">{t("岗位管理")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("管理用于候选人匹配评分的岗位")}</p>
            </div>
            <Button onClick={createJob}>
              <Plus className="h-4 w-4" />
              {t("创建岗位")}
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 animate-fade-in-up animation-delay-50">
            <h3 className="font-medium">{t("已有岗位")}</h3>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3 stagger-children">
              {jobsQuery.isLoading ? <div className="h-28 rounded-md bg-muted skeleton-shimmer" /> : null}
              {(jobsQuery.data?.items ?? []).map((job) => (
                <article
                  key={job.id}
                  className={`card-hover rounded-md border bg-background p-4 transition-colors ${
                    recentlySavedId === job.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border"
                  }`}
                >
                  <button type="button" onClick={() => editJob(job)} className="text-left font-medium transition-colors hover:text-primary">
                    {job.title}
                  </button>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{job.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t("{{value}} 项必备技能", { value: job.required_skills.length })}</span>
                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(job.id)}
                      aria-label={t("删除岗位 {{name}}", { name: job.title })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            {!jobsQuery.isLoading && !jobsQuery.data?.items.length ? (
              <div className="py-12 text-center">
                <p className="font-medium">{t("还没有岗位")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("创建岗位后，即可进行候选人匹配评分。")}</p>
                <Button className="mt-4" onClick={createJob}>{t("创建第一个岗位")}</Button>
              </div>
            ) : null}
          </div>
        </section>
      )}
    </AnimatedPage>
  );
}
