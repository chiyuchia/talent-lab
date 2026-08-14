import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { AnimatedPage } from "../components/AnimatedPage";
import { JobFormPanel, type JobForm } from "../components/jobs/JobFormPanel";
import { JobsList } from "../components/jobs/JobsList";
import { JobWorkspaceView } from "../components/jobs/JobWorkspaceView";
import { cloneJobForm, emptyJobForm, jobToForm } from "../components/jobs/job-form";
import { candidateApi, jobsApi } from "../lib/api";
import { getErrorMessage } from "../lib/errors";
import type { ApplicationStatus, JobOpportunity } from "../types/api";

export function JobsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<JobForm>(() => cloneJobForm(emptyJobForm));
  const [initialForm, setInitialForm] = useState<JobForm>(() => cloneJobForm(emptyJobForm));
  const [recentlySavedId, setRecentlySavedId] = useState<number | null>(null);
  const listScrollRef = useRef(0);
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  const jobsQuery = useQuery({
    queryKey: ["jobs", { search, statusFilter, favoriteOnly }],
    queryFn: () => jobsApi.list({
      q: search || undefined,
      status: statusFilter || undefined,
      favorite: favoriteOnly ? "true" : undefined,
    }),
    placeholderData: (previousData) => previousData,
  });
  const resumesQuery = useQuery({
    queryKey: ["resume-versions", "jobs"],
    queryFn: () => candidateApi.list({ page: 1, page_size: 100, sort: "-uploaded_at" }),
  });

  function resetEditor() {
    setShowForm(false);
    setEditingId(null);
    setForm(cloneJobForm(emptyJobForm));
    setInitialForm(cloneJobForm(emptyJobForm));
  }

  const saveMutation = useMutation({
    mutationFn: () => editingId
      ? jobsApi.update(editingId, cloneJobForm(form))
      : jobsApi.create(cloneJobForm(form)),
    onSuccess: async (savedJob) => {
      setSelectedJob(savedJob);
      setRecentlySavedId(savedJob.id);
      resetEditor();
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
    onSuccess: async (updatedJob) => {
      setSelectedJob((current) => current?.id === updatedJob.id ? updatedJob : current);
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  function createJob() {
    saveMutation.reset();
    setSelectedJob(null);
    const nextForm = cloneJobForm(emptyJobForm);
    setEditingId(null);
    setForm(nextForm);
    setInitialForm(cloneJobForm(nextForm));
    setShowForm(true);
    window.scrollTo({ top: 0 });
  }

  function openJob(job: JobOpportunity) {
    listScrollRef.current = window.scrollY;
    setSelectedJob(job);
    window.scrollTo({ top: 0 });
  }

  function editJob(job: JobOpportunity) {
    saveMutation.reset();
    const nextForm = jobToForm(job);
    setSelectedJob(job);
    setEditingId(job.id);
    setForm(nextForm);
    setInitialForm(cloneJobForm(nextForm));
    setShowForm(true);
    window.scrollTo({ top: 0 });
  }

  function returnFromEditor() {
    if (isDirty && !window.confirm(t("当前填写的内容尚未保存，确定放弃并返回职位机会列表吗？"))) return;
    resetEditor();
    window.scrollTo({ top: 0 });
  }

  function returnToList() {
    setSelectedJob(null);
    window.requestAnimationFrame(() => window.scrollTo({ top: listScrollRef.current }));
  }

  function deleteJob(job: JobOpportunity) {
    if (!window.confirm(t("确定删除 {{company}} 的 {{title}} 吗？", { company: job.company_name, title: job.title }))) return;
    deleteMutation.mutate(job.id);
  }

  function updatePersistedStatus(applicationStatus: ApplicationStatus) {
    setSelectedJob((current) => current ? { ...current, application_status: applicationStatus } : current);
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
          onCancel={returnFromEditor}
          onSubmit={() => saveMutation.mutate()}
        />
      </AnimatedPage>
    );
  }

  if (selectedJob) {
    return (
      <JobWorkspaceView
          job={selectedJob}
          resumeVersions={resumesQuery.data?.items ?? []}
          favoriting={favoriteMutation.isPending}
          onBack={returnToList}
          onEdit={() => editJob(selectedJob)}
          onToggleFavorite={() => favoriteMutation.mutate({ id: selectedJob.id, isFavorite: !selectedJob.is_favorite })}
          onStatusChange={updatePersistedStatus}
      />
    );
  }

  const jobs = jobsQuery.data?.items ?? [];
  return (
    <AnimatedPage>
      <JobsList
        jobs={jobs}
        loading={jobsQuery.isLoading}
        search={search}
        statusFilter={statusFilter}
        favoriteOnly={favoriteOnly}
        recentlySavedId={recentlySavedId}
        deletingId={deleteMutation.isPending ? deleteMutation.variables : null}
        favoritingId={favoriteMutation.isPending ? favoriteMutation.variables?.id ?? null : null}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onFavoriteOnlyChange={setFavoriteOnly}
        onCreate={createJob}
        onOpen={openJob}
        onDelete={deleteJob}
        onToggleFavorite={(job) => favoriteMutation.mutate({ id: job.id, isFavorite: !job.is_favorite })}
      />
    </AnimatedPage>
  );
}
