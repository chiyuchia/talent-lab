from datetime import datetime

from ..extensions import db


class JobDescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text, nullable=False, default="")
    company_name = db.Column(db.String(160), nullable=True)
    source_platform = db.Column(db.String(80), nullable=True)
    source_url = db.Column(db.String(1024), nullable=True)
    published_at = db.Column(db.Date, nullable=True)
    application_deadline = db.Column(db.Date, nullable=True)
    locations = db.Column(db.JSON, nullable=True, default=list)
    work_mode = db.Column(db.String(32), nullable=True)
    employment_type = db.Column(db.JSON, nullable=True, default=list)
    seniority = db.Column(db.String(32), nullable=True)
    department = db.Column(db.String(160), nullable=True)
    company_industry = db.Column(db.String(160), nullable=True)
    company_stage = db.Column(db.String(80), nullable=True)
    summary = db.Column(db.Text, nullable=True)
    responsibilities = db.Column(db.JSON, nullable=True, default=list)
    other_information = db.Column(db.Text, nullable=True)
    experience_min_years = db.Column(db.Float, nullable=True)
    experience_max_years = db.Column(db.Float, nullable=True)
    minimum_education = db.Column(db.String(32), nullable=True)
    preferred_majors = db.Column(db.JSON, nullable=True, default=list)
    skill_requirements = db.Column(db.JSON, nullable=True, default=list)
    required_skills = db.Column(db.JSON, nullable=False, default=list)
    bonus_skills = db.Column(db.JSON, nullable=False, default=list)
    language_requirements = db.Column(db.JSON, nullable=True, default=list)
    certification_requirements = db.Column(db.JSON, nullable=True, default=list)
    industry_experience = db.Column(db.JSON, nullable=True, default=list)
    constraints = db.Column(db.JSON, nullable=True, default=dict)
    other_requirements = db.Column(db.JSON, nullable=True, default=list)
    salary_min = db.Column(db.Float, nullable=True)
    salary_max = db.Column(db.Float, nullable=True)
    salary_currency = db.Column(db.String(8), nullable=True)
    salary_period = db.Column(db.String(16), nullable=True)
    bonus_compensation = db.Column(db.Text, nullable=True)
    equity = db.Column(db.Text, nullable=True)
    benefits = db.Column(db.JSON, nullable=True, default=list)
    application_status = db.Column(db.String(32), nullable=True, default="saved")
    is_favorite = db.Column(db.Boolean, nullable=True, default=False)
    priority = db.Column(db.String(16), nullable=True, default="medium")
    applied_at = db.Column(db.DateTime, nullable=True)
    next_action = db.Column(db.Text, nullable=True)
    next_action_at = db.Column(db.DateTime, nullable=True)
    contacts = db.Column(db.JSON, nullable=True, default=list)
    personal_notes = db.Column(db.Text, nullable=True)
    attraction_points = db.Column(db.JSON, nullable=True, default=list)
    concerns = db.Column(db.JSON, nullable=True, default=list)
    submitted_resume_id = db.Column(
        db.Integer, db.ForeignKey("candidate.id"), nullable=True
    )
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    submitted_resume = db.relationship("Candidate", foreign_keys=[submitted_resume_id])
    scores = db.relationship(
        "ScoreResult", back_populates="job", cascade="all, delete-orphan", lazy="selectin"
    )
    events = db.relationship(
        "ApplicationEvent",
        back_populates="job",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class ApplicationEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(
        db.Integer, db.ForeignKey("job_description.id"), nullable=False, index=True
    )
    event_type = db.Column(db.String(32), nullable=False)
    occurred_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(32), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    job = db.relationship("JobDescription", back_populates="events")


class ScoreResult(db.Model):
    __table_args__ = (
        db.UniqueConstraint("candidate_id", "job_id", name="uq_score_candidate_job"),
    )

    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey("candidate.id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("job_description.id"), nullable=False)
    total_score = db.Column(db.Integer, nullable=False)
    skill_score = db.Column(db.Integer, nullable=False)
    experience_score = db.Column(db.Integer, nullable=False)
    education_score = db.Column(db.Integer, nullable=False)
    ai_comment = db.Column(db.Text, nullable=False)
    details = db.Column(db.JSON, nullable=False, default=dict)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    candidate = db.relationship("Candidate", back_populates="scores")
    job = db.relationship("JobDescription", back_populates="scores")
