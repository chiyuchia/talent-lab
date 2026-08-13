from flask import Blueprint, request
from sqlalchemy import or_

from ..extensions import db
from ..models import ApplicationEvent, Candidate, JobDescription
from ..security import require_auth
from ..services.ai_service import make_ai_service
from ..services.job_events import add_status_event, build_application_event
from ..services.job_normalizers import JobValidationError
from ..services.job_payload import build_job_values
from ..utils.job_serializers import serialize_application_event, serialize_job
from ..utils.responses import error_response, ok_response

jobs_bp = Blueprint("jobs", __name__)
MAX_JOB_TEXT_LENGTH = 20_000


@jobs_bp.get("")
@require_auth
def list_jobs():
    query = JobDescription.query
    status = (request.args.get("status") or "").strip()
    search = (request.args.get("q") or "").strip()
    favorite = (request.args.get("favorite") or "").lower()
    if status:
        query = query.filter(JobDescription.application_status == status)
    if favorite in {"true", "1"}:
        query = query.filter(JobDescription.is_favorite.is_(True))
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                JobDescription.title.ilike(pattern),
                JobDescription.company_name.ilike(pattern),
                JobDescription.summary.ilike(pattern),
            )
        )
    jobs = query.order_by(JobDescription.updated_at.desc()).all()
    return ok_response({"items": [serialize_job(job) for job in jobs]})


@jobs_bp.post("/parse")
@require_auth
def parse_job():
    payload = json_payload()
    text = str(payload.get("text") or "").strip()
    if not text:
        return error_response("VALIDATION_ERROR", "请粘贴需要解析的职位描述。", status=400)
    if len(text) > MAX_JOB_TEXT_LENGTH:
        return error_response(
            "VALIDATION_ERROR",
            f"职位描述不能超过 {MAX_JOB_TEXT_LENGTH} 个字符。",
            status=400,
        )
    return ok_response(make_ai_service().parse_job_description(text))


@jobs_bp.post("")
@require_auth
def create_job():
    try:
        values = build_job_values(json_payload())
        validate_submitted_resume(values.get("submitted_resume_id"))
    except JobValidationError as exc:
        return error_response("VALIDATION_ERROR", str(exc), status=400)

    job = JobDescription()
    assign_values(job, values)
    db.session.add(job)
    db.session.flush()
    db.session.add(add_status_event(job, job.application_status or "saved"))
    db.session.commit()
    return ok_response(serialize_job(job), status=201)


@jobs_bp.patch("/<int:job_id>")
@require_auth
def update_job(job_id: int):
    job = db.session.get(JobDescription, job_id)
    if not job:
        return error_response("NOT_FOUND", "职位机会不存在。", status=404)
    old_status = job.application_status or "saved"
    try:
        values = build_job_values(json_payload(), job)
        validate_submitted_resume(values.get("submitted_resume_id"))
    except JobValidationError as exc:
        return error_response("VALIDATION_ERROR", str(exc), status=400)

    assign_values(job, values)
    if job.application_status != old_status:
        db.session.add(add_status_event(job, job.application_status))
    db.session.commit()
    return ok_response(serialize_job(job))


@jobs_bp.delete("/<int:job_id>")
@require_auth
def delete_job(job_id: int):
    job = db.session.get(JobDescription, job_id)
    if not job:
        return error_response("NOT_FOUND", "职位机会不存在。", status=404)
    db.session.delete(job)
    db.session.commit()
    return ok_response({"id": job_id, "deleted": True})


@jobs_bp.get("/<int:job_id>/events")
@require_auth
def list_application_events(job_id: int):
    job = db.session.get(JobDescription, job_id)
    if not job:
        return error_response("NOT_FOUND", "职位机会不存在。", status=404)
    events = (
        ApplicationEvent.query.filter_by(job_id=job.id)
        .order_by(ApplicationEvent.occurred_at.desc(), ApplicationEvent.id.desc())
        .all()
    )
    return ok_response({"items": [serialize_application_event(event) for event in events]})


@jobs_bp.post("/<int:job_id>/events")
@require_auth
def create_application_event(job_id: int):
    job = db.session.get(JobDescription, job_id)
    if not job:
        return error_response("NOT_FOUND", "职位机会不存在。", status=404)
    try:
        event = build_application_event(job, json_payload())
    except JobValidationError as exc:
        return error_response("VALIDATION_ERROR", str(exc), status=400)
    db.session.add(event)
    db.session.commit()
    return ok_response(serialize_application_event(event), status=201)


def validate_submitted_resume(candidate_id: int | None) -> None:
    if candidate_id and not db.session.get(Candidate, candidate_id):
        raise JobValidationError("关联的简历版本不存在。")


def assign_values(job: JobDescription, values: dict) -> None:
    for field, value in values.items():
        setattr(job, field, value)


def json_payload() -> dict:
    payload = request.get_json(silent=True)
    return payload if isinstance(payload, dict) else {}
