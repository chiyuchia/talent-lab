from ..constants import (
    APPLICATION_STATUSES,
    EDUCATION_LEVELS,
    EMPLOYMENT_TYPES,
    JOB_PRIORITIES,
    SALARY_PERIODS,
    SENIORITY_LEVELS,
    WORK_MODES,
)

STRING_FIELDS = {
    "title": 160,
    "company_name": 160,
    "source_platform": 80,
    "source_url": 1024,
    "work_mode": 32,
    "seniority": 32,
    "department": 160,
    "company_industry": 160,
    "company_stage": 80,
    "summary": 2000,
    "other_information": 10000,
    "minimum_education": 32,
    "salary_currency": 8,
    "salary_period": 16,
    "bonus_compensation": 2000,
    "equity": 2000,
    "application_status": 32,
    "priority": 16,
    "next_action": 2000,
    "personal_notes": 10000,
}
LIST_FIELDS = {
    "locations",
    "responsibilities",
    "preferred_majors",
    "industry_experience",
    "other_requirements",
    "benefits",
    "attraction_points",
    "concerns",
    "employment_type",
}
ENUM_FIELDS = {
    "work_mode": WORK_MODES,
    "seniority": SENIORITY_LEVELS,
    "minimum_education": EDUCATION_LEVELS,
    "salary_period": SALARY_PERIODS,
    "application_status": APPLICATION_STATUSES,
    "priority": JOB_PRIORITIES,
}
LIST_ENUM_FIELDS = {"employment_type": EMPLOYMENT_TYPES}
FLOAT_FIELDS = {"experience_min_years", "experience_max_years", "salary_min", "salary_max"}
DATE_FIELDS = {"published_at", "application_deadline"}
DATETIME_FIELDS = {"applied_at", "next_action_at"}
