import type { JobOpportunity } from "../../types/api";

const workModeLabels = {
  on_site: "现场办公",
  hybrid: "混合办公",
  remote: "远程办公",
} as const;

const employmentLabels = {
  full_time: "全职",
  part_time: "兼职",
  contract: "合同",
  internship: "实习",
} as const;

const seniorityLabels = {
  intern: "实习",
  entry: "初级",
  mid: "中级",
  senior: "高级",
  expert: "专家",
  manager: "管理",
} as const;

const educationLabels = {
  high_school: "高中",
  associate: "大专",
  bachelor: "本科",
  master: "硕士",
  doctorate: "博士",
  other: "其他",
} as const;

export function jobSalaryLabel(job: JobOpportunity): string | null {
  if (job.salary_min === null && job.salary_max === null) return null;
  const range = [job.salary_min, job.salary_max]
    .filter((value) => value !== null)
    .map((value) => Number(value).toLocaleString())
    .join(" - ");
  return `${job.salary_currency || ""} ${range}/${job.salary_period || "?"}`.trim();
}

export function dateLabel(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString();
}

export function workModeLabel(value: JobOpportunity["work_mode"]): string | null {
  return value ? workModeLabels[value] : null;
}

export function employmentLabel(job: JobOpportunity): string | null {
  if (!job.employment_type.length) return null;
  return job.employment_type.map((value) => employmentLabels[value]).join(" / ");
}

export function seniorityLabel(value: JobOpportunity["seniority"]): string | null {
  return value ? seniorityLabels[value] : null;
}

export function educationLabel(value: JobOpportunity["minimum_education"]): string | null {
  return value ? educationLabels[value] : null;
}

export function experienceLabel(job: JobOpportunity): string | null {
  if (job.experience_min_years === null && job.experience_max_years === null) return null;
  const min = job.experience_min_years ?? 0;
  return job.experience_max_years === null
    ? `${min}+`
    : `${min} - ${job.experience_max_years}`;
}
