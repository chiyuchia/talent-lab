import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PanelRightOpen, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AnimatedPage } from "../components/AnimatedPage";
import { JobScorePanel } from "../components/candidate-detail/JobScorePanel";
import { OriginalResumeSidebar } from "../components/candidate-detail/OriginalResumeSidebar";
import { ProfileEditForm } from "../components/candidate-detail/ProfileEditForm";
import { ProfilePreview } from "../components/candidate-detail/ProfilePreview";
import { ScorePanel } from "../components/candidate-detail/ScorePanel";
import { emptyProfileForm, statusOptions } from "../components/candidate-detail/profile-utils";
import type { ProfileForm } from "../components/candidate-detail/profile-utils";
import { CandidateStatusBadge, ParseStatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
import { API_PREFIX, candidateApi, jobsApi, scoresApi } from "../lib/api";
import { normalizeProfile } from "../lib/candidate-profile";
import { parseJsonArray, stringifyJson } from "../lib/format";
import type { CandidateStatus, ResumeProfile } from "../types/api";
export function CandidateDetailPage() {
  const { t } = useTranslation();
  const { candidateId } = useParams();
  const numericCandidateId = Number(candidateId);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const candidateQuery = useQuery({
    queryKey: ["candidate", numericCandidateId],
    queryFn: () => candidateApi.get(numericCandidateId),
    enabled: Number.isFinite(numericCandidateId),
  });
  const jobsQuery = useQuery({ queryKey: ["jobs"], queryFn: () => jobsApi.list() });
  const candidate = candidateQuery.data;
  const profile = normalizeProfile(candidate?.profile, candidate);
  const candidateScores = useMemo(() => candidate?.scores ?? [], [candidate?.scores]);
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm);
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"education" | "experience" | "projects">("education");
  const [resumeSourceOpen, setResumeSourceOpen] = useState(false);
  useEffect(() => {
    if (!candidate) return;
    const nextProfile = normalizeProfile(candidate.profile, candidate);
    setProfileForm({
      name: nextProfile.name,
      phone: nextProfile.phone,
      email: nextProfile.email,
      city: nextProfile.city,
      education: stringifyJson(nextProfile.education),
      work_experience: stringifyJson(nextProfile.work_experience),
      skills: [...nextProfile.skills],
      projects: stringifyJson(nextProfile.projects),
    });
  }, [candidate]);
  const saveProfileMutation = useMutation({
    mutationFn: (profile: ResumeProfile) => candidateApi.updateProfile(numericCandidateId, profile),
    onSuccess: async () => {
      setEditMode(false);
      await queryClient.invalidateQueries({ queryKey: ["candidate", numericCandidateId] });
      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
  const statusMutation = useMutation({
    mutationFn: (status: CandidateStatus) => candidateApi.updateStatus(numericCandidateId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["candidate", numericCandidateId] });
      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
  const scoreMutation = useMutation({
    mutationFn: () => scoresApi.create(numericCandidateId, selectedJobIds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["candidate", numericCandidateId] });
      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => candidateApi.delete(numericCandidateId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
      navigate("/resumes");
    },
  });

  function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveProfileMutation.mutate({
      name: profileForm.name,
      phone: profileForm.phone,
      email: profileForm.email,
      city: profileForm.city,
      education: parseJsonArray(profileForm.education),
      work_experience: parseJsonArray(profileForm.work_experience),
      skills: profileForm.skills,
      projects: parseJsonArray(profileForm.projects),
    });
  }

  if (candidateQuery.isLoading) {
    return <div className="h-96 animate-pulse rounded-lg bg-muted" />;
  }

  if (!candidate) {
    return <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">{t("简历不存在")}</div>;
  }
  return (
    <>
    <AnimatedPage>
    <section className="space-y-8">
      <Button variant="ghost" className="-ml-3" onClick={() => navigate("/resumes")}>
        <ArrowLeft className="h-4 w-4" />
        {t("返回简历列表")}
      </Button>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{profile.name || candidate.original_filename}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("结构化简历、评分详情与原始 PDF")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" aria-expanded={resumeSourceOpen} aria-haspopup="dialog" onClick={() => setResumeSourceOpen(true)}>
            <PanelRightOpen className="h-4 w-4" />
            {t("原始简历")}
          </Button>
          <ParseStatusBadge status={candidate.parse_status} />
          <CandidateStatusBadge status={candidate.status} />
          <Button
            variant="destructive"
            size="icon"
            onClick={() => {
              if (window.confirm(t("确定要删除简历「{{name}}」吗？", { name: profile.name || candidate.original_filename }))) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            aria-label={t("删除简历")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
        <div className="space-y-4">
          {editMode ? (
            <ProfileEditForm
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              onSubmit={handleProfileSubmit}
              isSavePending={saveProfileMutation.isPending}
              onCancelEdit={() => setEditMode(false)}
            />
          ) : (
            <ProfilePreview
              profile={profile}
              onEdit={() => setEditMode(true)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-medium">{t("状态流转")}</h3>
            <Select
              aria-label={t("简历状态")}
              value={candidate.status}
              onChange={(event) =>
                statusMutation.mutate(event.target.value as CandidateStatus)
              }
              containerClassName="mt-4 block w-full"
            >
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>{t(label)}</option>
              ))}
            </Select>
          </div>
          <JobScorePanel
            jobs={jobsQuery.data?.items ?? []}
            selectedJobIds={selectedJobIds}
            setSelectedJobIds={setSelectedJobIds}
            scoreMutation={scoreMutation}
          />
          <ScorePanel candidateScores={candidateScores} />
        </div>
      </div>
    </section>
    </AnimatedPage>
    <OriginalResumeSidebar
      open={resumeSourceOpen}
      pdfUrl={`${API_PREFIX}${candidate.pdf_url}`}
      resumeFilename={candidate.original_filename}
      onClose={() => setResumeSourceOpen(false)}
    />
    </>
  );
}
