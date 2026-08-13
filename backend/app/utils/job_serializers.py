from datetime import date, datetime

from ..models import ApplicationEvent, JobDescription


def serialize_job(job: JobDescription) -> dict:
    return {
        "id": job.id,
        "company_name": job.company_name or "",
        "title": job.title,
        "raw_jd": job.description or "",
        "description": job.description or "",
        "source_platform": job.source_platform or "",
        "source_url": job.source_url or "",
        "published_at": format_date(job.published_at),
        "application_deadline": format_date(job.application_deadline),
        "locations": job.locations or [],
        "work_mode": job.work_mode or "",
        "employment_type": list_value(job.employment_type),
        "seniority": job.seniority or "",
        "department": job.department or "",
        "company_industry": job.company_industry or "",
        "company_stage": job.company_stage or "",
        "summary": job.summary or "",
        "responsibilities": job.responsibilities or [],
        "other_information": job.other_information or "",
        "experience_min_years": job.experience_min_years,
        "experience_max_years": job.experience_max_years,
        "minimum_education": job.minimum_education or "",
        "preferred_majors": job.preferred_majors or [],
        "skill_requirements": job.skill_requirements or legacy_skills(job),
        "required_skills": job.required_skills or [],
        "bonus_skills": job.bonus_skills or [],
        "language_requirements": job.language_requirements or [],
        "certification_requirements": job.certification_requirements or [],
        "industry_experience": job.industry_experience or [],
        "constraints": job.constraints or {},
        "other_requirements": job.other_requirements or [],
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "salary_currency": job.salary_currency or "",
        "salary_period": job.salary_period or "",
        "bonus_compensation": job.bonus_compensation or "",
        "equity": job.equity or "",
        "benefits": job.benefits or [],
        "application_status": job.application_status or "saved",
        "is_favorite": bool(job.is_favorite),
        "priority": job.priority or "medium",
        "applied_at": format_datetime(job.applied_at),
        "next_action": job.next_action or "",
        "next_action_at": format_datetime(job.next_action_at),
        "contacts": job.contacts or [],
        "personal_notes": job.personal_notes or "",
        "attraction_points": job.attraction_points or [],
        "concerns": job.concerns or [],
        "submitted_resume_id": job.submitted_resume_id,
        "created_at": format_datetime(job.created_at),
        "updated_at": format_datetime(job.updated_at),
    }


def serialize_application_event(event: ApplicationEvent) -> dict:
    return {
        "id": event.id,
        "job_id": event.job_id,
        "type": event.event_type,
        "occurred_at": format_datetime(event.occurred_at),
        "status": event.status,
        "title": event.title,
        "notes": event.notes or "",
        "created_at": format_datetime(event.created_at),
    }


def list_value(value) -> list:
    if isinstance(value, list):
        return value
    return [value] if value else []


def legacy_skills(job: JobDescription) -> list[dict]:
    return [
        *[
            {"name": skill, "importance": "required", "min_years": None, "proficiency": None}
            for skill in (job.required_skills or [])
        ],
        *[
            {"name": skill, "importance": "preferred", "min_years": None, "proficiency": None}
            for skill in (job.bonus_skills or [])
        ],
    ]


def format_date(value: date | None) -> str | None:
    return value.isoformat() if value else None


def format_datetime(value: datetime | None) -> str | None:
    return value.isoformat() + "Z" if value else None
