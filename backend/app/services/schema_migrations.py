import json

from sqlalchemy import inspect, text

from ..constants import EMPLOYMENT_TYPES
from ..extensions import db
from ..models import JobDescription

JOB_COLUMN_DDL = {
    "company_name": "VARCHAR(160)",
    "source_platform": "VARCHAR(80)",
    "source_url": "VARCHAR(1024)",
    "published_at": "DATE",
    "application_deadline": "DATE",
    "locations": "JSON",
    "work_mode": "VARCHAR(32)",
    "employment_type": "JSON",
    "seniority": "VARCHAR(32)",
    "department": "VARCHAR(160)",
    "company_industry": "VARCHAR(160)",
    "company_stage": "VARCHAR(80)",
    "summary": "TEXT",
    "responsibilities": "JSON",
    "other_information": "TEXT",
    "experience_min_years": "FLOAT",
    "experience_max_years": "FLOAT",
    "minimum_education": "VARCHAR(32)",
    "preferred_majors": "JSON",
    "skill_requirements": "JSON",
    "language_requirements": "JSON",
    "certification_requirements": "JSON",
    "industry_experience": "JSON",
    "constraints": "JSON",
    "other_requirements": "JSON",
    "salary_min": "FLOAT",
    "salary_max": "FLOAT",
    "salary_currency": "VARCHAR(8)",
    "salary_period": "VARCHAR(16)",
    "bonus_compensation": "TEXT",
    "equity": "TEXT",
    "benefits": "JSON",
    "application_status": "VARCHAR(32)",
    "is_favorite": "BOOLEAN",
    "priority": "VARCHAR(16)",
    "applied_at": "DATETIME",
    "next_action": "TEXT",
    "next_action_at": "DATETIME",
    "contacts": "JSON",
    "personal_notes": "TEXT",
    "attraction_points": "JSON",
    "concerns": "JSON",
    "submitted_resume_id": "INTEGER",
}


def migrate_schema() -> None:
    inspector = inspect(db.engine)
    if "job_description" not in inspector.get_table_names():
        return

    existing = {column["name"] for column in inspector.get_columns("job_description")}
    for name, ddl in JOB_COLUMN_DDL.items():
        if name not in existing:
            db.session.execute(text(f"ALTER TABLE job_description ADD COLUMN {name} {ddl}"))
    db.session.commit()
    migrate_employment_types()

    migrated = False
    for job in JobDescription.query.all():
        if not job.skill_requirements:
            job.skill_requirements = [
                *[
                    {"name": skill, "importance": "required"}
                    for skill in (job.required_skills or [])
                ],
                *[
                    {"name": skill, "importance": "preferred"}
                    for skill in (job.bonus_skills or [])
                ],
            ]
            migrated = True
        if not job.application_status:
            job.application_status = "saved"
            migrated = True
        if job.is_favorite is None:
            job.is_favorite = False
            migrated = True
        if not job.priority:
            job.priority = "medium"
            migrated = True
    if migrated:
        db.session.commit()


def migrate_employment_types() -> None:
    rows = db.session.execute(
        text("SELECT id, employment_type FROM job_description")
    ).mappings()
    changed = False
    for row in rows:
        raw = row["employment_type"]
        try:
            decoded = json.loads(raw) if raw else []
        except (TypeError, json.JSONDecodeError):
            decoded = raw
        values = decoded if isinstance(decoded, list) else [decoded]
        normalized = [value for value in values if value in EMPLOYMENT_TYPES]
        serialized = json.dumps(normalized, ensure_ascii=False)
        if raw != serialized:
            db.session.execute(
                text(
                    "UPDATE job_description SET employment_type = :value WHERE id = :id"
                ),
                {"value": serialized, "id": row["id"]},
            )
            changed = True
    if changed:
        db.session.commit()
