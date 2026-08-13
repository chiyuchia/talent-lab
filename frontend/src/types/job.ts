export type ApplicationStatus =
  | "saved"
  | "preparing"
  | "applied"
  | "assessment"
  | "interview"
  | "offer"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type ApplicationEventType =
  | "status_change"
  | "interview"
  | "assessment"
  | "offer"
  | "note"
  | "task";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship";

export type SkillRequirement = {
  name: string;
  importance: "required" | "preferred";
  min_years: number | null;
  proficiency: "basic" | "familiar" | "proficient" | "expert" | null;
};

export type NamedRequirement = {
  name?: string;
  language?: string;
  level: string;
  importance: "required" | "preferred";
};

export type JobContact = {
  name: string;
  role: string;
  contact: string;
  notes: string;
};

export type JobOpportunityDraft = {
  company_name: string;
  title: string;
  raw_jd: string;
  source_platform: string;
  source_url: string;
  published_at: string | null;
  application_deadline: string | null;
  locations: string[];
  work_mode: "" | "on_site" | "hybrid" | "remote";
  employment_type: EmploymentType[];
  seniority: "" | "intern" | "entry" | "mid" | "senior" | "expert" | "manager";
  department: string;
  company_industry: string;
  company_stage: string;
  summary: string;
  responsibilities: string[];
  other_information: string;
  experience_min_years: number | null;
  experience_max_years: number | null;
  minimum_education: "" | "high_school" | "associate" | "bachelor" | "master" | "doctorate" | "other";
  preferred_majors: string[];
  skill_requirements: SkillRequirement[];
  language_requirements: NamedRequirement[];
  certification_requirements: NamedRequirement[];
  industry_experience: string[];
  constraints: Record<string, string>;
  other_requirements: string[];
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_period: "" | "hour" | "month" | "year";
  bonus_compensation: string;
  equity: string;
  benefits: string[];
  application_status: ApplicationStatus;
  is_favorite: boolean;
  priority: "low" | "medium" | "high";
  applied_at: string | null;
  next_action: string;
  next_action_at: string | null;
  contacts: JobContact[];
  personal_notes: string;
  attraction_points: string[];
  concerns: string[];
  submitted_resume_id: number | null;
};

export type JobOpportunity = JobOpportunityDraft & {
  id: number;
  description: string;
  required_skills: string[];
  bonus_skills: string[];
  created_at: string;
  updated_at: string;
};

export type JobParseResult = Partial<JobOpportunityDraft> & {
  title: string;
  raw_jd: string;
};

export type ApplicationEvent = {
  id: number;
  job_id: number;
  type: ApplicationEventType;
  occurred_at: string;
  status?: ApplicationStatus | null;
  title: string;
  notes: string;
  created_at: string;
};

export type ApplicationEventDraft = Pick<
  ApplicationEvent,
  "type" | "title" | "notes"
> & {
  occurred_at: string;
  status?: ApplicationStatus | null;
};

export type JobListResponse = { items: JobOpportunity[] };
export type ApplicationEventListResponse = { items: ApplicationEvent[] };

// Compatibility aliases while the backend keeps the existing /jobs contract.
export type JobDescription = JobOpportunity;
export type JobDraft = JobOpportunityDraft;
