import type {
  JobOpportunity,
  JobOpportunityDraft,
  JobParseResult,
} from "../../types/api";

export const emptyJobForm: JobOpportunityDraft = {
  company_name: "",
  title: "",
  raw_jd: "",
  source_platform: "",
  source_url: "",
  published_at: null,
  application_deadline: null,
  locations: [],
  work_mode: "",
  employment_type: [],
  seniority: "",
  department: "",
  company_industry: "",
  company_stage: "",
  summary: "",
  responsibilities: [],
  other_information: "",
  experience_min_years: null,
  experience_max_years: null,
  minimum_education: "",
  preferred_majors: [],
  skill_requirements: [],
  language_requirements: [],
  certification_requirements: [],
  industry_experience: [],
  constraints: {},
  other_requirements: [],
  salary_min: null,
  salary_max: null,
  salary_currency: "",
  salary_period: "",
  bonus_compensation: "",
  equity: "",
  benefits: [],
  application_status: "saved",
  is_favorite: false,
  priority: "medium",
  applied_at: null,
  next_action: "",
  next_action_at: null,
  contacts: [],
  personal_notes: "",
  attraction_points: [],
  concerns: [],
  submitted_resume_id: null,
};

export function cloneJobForm(form: JobOpportunityDraft): JobOpportunityDraft {
  return JSON.parse(JSON.stringify(form)) as JobOpportunityDraft;
}

export function jobToForm(job: JobOpportunity): JobOpportunityDraft {
  const form = cloneJobForm(emptyJobForm);
  for (const key of Object.keys(form) as Array<keyof JobOpportunityDraft>) {
    (form as Record<string, unknown>)[key] = job[key];
  }
  return cloneJobForm(form);
}

const PARSED_FIELDS: Array<keyof JobOpportunityDraft> = [
  "company_name",
  "title",
  "raw_jd",
  "locations",
  "work_mode",
  "employment_type",
  "seniority",
  "department",
  "summary",
  "responsibilities",
  "experience_min_years",
  "experience_max_years",
  "minimum_education",
  "preferred_majors",
  "skill_requirements",
  "language_requirements",
  "certification_requirements",
  "industry_experience",
  "constraints",
  "other_requirements",
  "salary_min",
  "salary_max",
  "salary_currency",
  "salary_period",
  "benefits",
];

export function mergeParsedJob(
  current: JobOpportunityDraft,
  parsed: JobParseResult,
): JobOpportunityDraft {
  const next = cloneJobForm(current);
  for (const key of PARSED_FIELDS) {
    if (key in parsed) {
      (next as Record<string, unknown>)[key] = parsed[key];
    }
  }
  return next;
}

export function validateJobForm(form: JobOpportunityDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.company_name.trim()) errors.company_name = "公司名称不能为空。";
  if (!form.title.trim()) errors.title = "职位名称不能为空。";
  if (form.source_url) {
    try {
      const url = new URL(form.source_url);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
      errors.source_url = "职位描述链接格式不正确。";
    }
  }
  if (
    form.experience_min_years !== null &&
    form.experience_max_years !== null &&
    form.experience_min_years > form.experience_max_years
  ) {
    errors.experience = "经验年限下限不能高于上限。";
  }
  if (
    form.salary_min !== null &&
    form.salary_max !== null &&
    form.salary_min > form.salary_max
  ) {
    errors.salary = "薪资下限不能高于上限。";
  }
  return errors;
}

export function toDateTimeInput(value: string | null): string {
  return value ? value.slice(0, 16) : "";
}
