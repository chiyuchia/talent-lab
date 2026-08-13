import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AnimatedPage } from "../components/AnimatedPage";
import { JobFormPanel, type JobForm } from "../components/jobs/JobFormPanel";
import { JobOpportunityCard } from "../components/jobs/JobOpportunityCard";
import { cloneJobForm, emptyJobForm, jobToForm } from "../components/jobs/job-form";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { candidateApi, jobsApi } from "../lib/api";
import { getErrorMessage } from "../lib/errors";
import { applicationStatusOptions } from "../lib/job-options";
import type { ApplicationStatus, JobOpportunity } from "../types/api";

export function JobsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const jobsQuery = useQuery({
    queryKey: ["jobs", { search, statusFilter, favoriteOnly }],
    queryFn: () => jobsApi.list({
      q: search || undefined,
      status: statusFilter || undefined,
      favorite: favoriteOnly ? "true" : undefined,
    }),
  });
  const resumesQuery = useQuery({
    queryKey: ["resume-versions", "jobs"],
    queryFn: () => candidateApi.list({ page: 1, page_size: 100, sort: "-uploaded_at" }),
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<JobForm>(() => cloneJobForm(emptyJobForm));
  const [initialForm, setInitialForm] = useState<JobForm>(() => cloneJobForm(emptyJobForm));
  const [recentlySavedId, setRecentlySavedId] = useState<number | null>(null);
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(cloneJobForm(emptyJobForm));
    setInitialForm(cloneJobForm(emptyJobForm));
  }

  const saveMutation = useMutation({
    mutationFn: () => editingId ? jobsApi.update(editingId, cloneJobForm(form)) : jobsApi.create(cloneJobForm(form)),
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
  const favoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: number; isFavorite: boolean }) =>
      jobsApi.update(id, { is_favorite: isFavorite }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });

  function createJob() {
    saveMutation.reset();
    const nextForm = cloneJobForm(emptyJobForm);
    setEditingId(null);
    setForm(nextForm);
    setInitialForm(cloneJobForm(nextForm));
    setShowForm(true);
  }

  function editJob(job: JobOpportunity) {
    saveMutation.reset();
    const nextForm = jobToForm(job);
    setEditingId(job.id);
    setForm(nextForm);
    setInitialForm(cloneJobForm(nextForm));
    setShowForm(true);
  }

  function returnToList() {
    if (isDirty && !window.confirm(t("当前填写的内容尚未保存，确定放弃并返回职位机会列表吗？"))) return;
    closeForm();
  }

  function deleteJob(job: JobOpportunity) {
    if (!window.confirm(t("确定删除 {{company}} 的 {{title}} 吗？", { company: job.company_name, title: job.title }))) return;
    deleteMutation.mutate(job.id);
  }

  function updatePersistedStatus(applicationStatus: ApplicationStatus) {
    setForm((current) => ({ ...current, application_status: applicationStatus }));
    setInitialForm((current) => ({ ...current, application_status: applicationStatus }));
  }

  useEffect(() => {
    if (!showForm || !isDirty) return undefined;
    const confirmPageExit = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", confirmPageExit);
    return () => window.removeEventListener("beforeunload", confirmPageExit);
  }, [isDirty, showForm]);

  useEffect(() => {
    if (!recentlySavedId) return undefined;
    const timer = window.setTimeout(() => setRecentlySavedId(null), 2400);
    return () => window.clearTimeout(timer);
  }, [recentlySavedId]);

  if (showForm) {
    return (
      <AnimatedPage>
        <JobFormPanel
          jobId={editingId}
          form={form}
          resumeVersions={resumesQuery.data?.items ?? []}
          saving={saveMutation.isPending}
          error={saveMutation.isError ? getErrorMessage(saveMutation.error) : null}
          onChange={setForm}
          onCancel={returnToList}
          onSubmit={() => saveMutation.mutate()}
          onPersistedStatusChange={updatePersistedStatus}
        />
      </AnimatedPage>
    );
  }

  const jobs = jobsQuery.data?.items ?? [];
  return (
    <AnimatedPage>
      <section className="space-y-6">
        <div className="flex items-start justify-between gap-4 animate-fade-in-down">
          <div>
            <h2 className="text-2xl font-semibold">{t("职位机会")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("集中保存职位描述、比较匹配度并跟踪求职进度")}</p>
          </div>
          <Button onClick={createJob}><Plus className="h-4 w-4" />{t("添加职位机会")}</Button>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 animate-fade-in-up animation-delay-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-medium">{t("我的职位机会")}</h3>
            <div className="flex flex-1 flex-wrap justify-end gap-2">
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full sm:w-56" placeholder={t("搜索公司或职位") } />
              <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-36">
                <option value="">{t("全部状态")}</option>
                {applicationStatusOptions.map(({ value, label }) => <option key={value} value={value}>{t(label)}</option>)}
              </Select>
              <label className="flex items-center gap-2 rounded-md border border-border px-3 text-sm">
                <input type="checkbox" checked={favoriteOnly} onChange={(event) => setFavoriteOnly(event.target.checked)} className="h-4 w-4 accent-primary" />
                {t("仅看收藏")}
              </label>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3 stagger-children">
            {jobsQuery.isLoading ? <div className="h-56 rounded-md bg-muted skeleton-shimmer" /> : null}
            {jobs.map((job) => (
              <JobOpportunityCard
                key={job.id}
                job={job}
                highlighted={recentlySavedId === job.id}
                deleting={deleteMutation.isPending}
                favoriting={favoriteMutation.isPending && favoriteMutation.variables?.id === job.id}
                onEdit={() => editJob(job)}
                onDelete={() => deleteJob(job)}
                onToggleFavorite={() => favoriteMutation.mutate({ id: job.id, isFavorite: !job.is_favorite })}
              />
            ))}
          </div>
          {!jobsQuery.isLoading && !jobs.length ? (
            <div className="py-12 text-center">
              <p className="font-medium">{t("还没有职位机会")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("粘贴一份职位描述，开始匹配简历并管理申请进度。")}</p>
              <Button className="mt-4" onClick={createJob}>{t("添加第一个职位机会")}</Button>
            </div>
          ) : null}
        </div>
      </section>
    </AnimatedPage>
  );
}
