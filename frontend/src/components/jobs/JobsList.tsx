import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { applicationStatusOptions } from "../../lib/job-options";
import type { JobOpportunity } from "../../types/api";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { JobOpportunityCard } from "./JobOpportunityCard";

type Props = {
  jobs: JobOpportunity[];
  loading: boolean;
  search: string;
  statusFilter: string;
  favoriteOnly: boolean;
  recentlySavedId: number | null;
  deletingId: number | null;
  favoritingId: number | null;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onFavoriteOnlyChange: (value: boolean) => void;
  onCreate: () => void;
  onOpen: (job: JobOpportunity) => void;
  onDelete: (job: JobOpportunity) => void;
  onToggleFavorite: (job: JobOpportunity) => void;
};

export function JobsList({
  jobs,
  loading,
  search,
  statusFilter,
  favoriteOnly,
  recentlySavedId,
  deletingId,
  favoritingId,
  onSearchChange,
  onStatusFilterChange,
  onFavoriteOnlyChange,
  onCreate,
  onOpen,
  onDelete,
  onToggleFavorite,
}: Props) {
  const { t } = useTranslation();
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t("职位机会")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("集中保存职位描述、比较匹配度并跟踪求职进度")}</p>
        </div>
        <Button className="self-start" onClick={onCreate}><Plus className="h-4 w-4" />{t("添加职位机会")}</Button>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-medium">{t("我的职位机会")}</h3>
          <div className="grid w-full gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_auto] lg:flex lg:w-auto lg:flex-1 lg:justify-end">
            <Input value={search} onChange={(event) => onSearchChange(event.target.value)} className="w-full sm:w-56" placeholder={t("搜索公司或职位")} />
            <Select aria-label={t("按申请状态筛选")} value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)} className="w-full sm:w-36">
              <option value="">{t("全部状态")}</option>
              {applicationStatusOptions.map(({ value, label }) => <option key={value} value={value}>{t(label)}</option>)}
            </Select>
            <div className="flex min-h-10 items-center gap-2 rounded-md border border-control px-3 text-sm sm:w-max">
              <Checkbox
                checked={favoriteOnly}
                onChange={(event) => onFavoriteOnlyChange(event.target.checked)}
                aria-label={t("仅看收藏")}
              />
              <span>{t("仅看收藏")}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {loading ? <div className="h-56 rounded-md bg-muted skeleton-shimmer" /> : null}
          {jobs.map((job) => (
            <JobOpportunityCard
              key={job.id}
              job={job}
              highlighted={recentlySavedId === job.id}
              deleting={deletingId === job.id}
              favoriting={favoritingId === job.id}
              onOpen={() => onOpen(job)}
              onDelete={() => onDelete(job)}
              onToggleFavorite={() => onToggleFavorite(job)}
            />
          ))}
        </div>

        {!loading && !jobs.length ? (
          <div className="py-12 text-center">
            <p className="font-medium">{t("还没有职位机会")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("粘贴一份职位描述，开始匹配简历并管理申请进度。")}</p>
            <Button className="mt-4" onClick={onCreate}>{t("添加第一个职位机会")}</Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
