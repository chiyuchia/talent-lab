from io import BytesIO

from flask import Blueprint, request, send_file

from ..constants import CANDIDATE_STATUSES
from ..extensions import db
from ..models import Candidate, JobDescription, ResumeProfile
from ..security import require_auth
from ..services.candidate_query import (
    has_skills,
    matches_query,
    parse_skill_filters,
    sort_candidates,
)
from ..services.resume_storage import make_resume_storage
from ..utils.payloads import ensure_list
from ..utils.responses import error_response, ok_response
from ..utils.serializers import serialize_candidate_detail, serialize_candidate_summary

candidates_bp = Blueprint("candidates", __name__)


@candidates_bp.get("")
@require_auth
def list_candidates():
    q = (request.args.get("q") or "").strip().lower()
    status = (request.args.get("status") or "").strip()
    skill_filters = parse_skill_filters()
    sort = request.args.get("sort") or "-uploaded_at"
    page = max(1, request.args.get("page", default=1, type=int))
    page_size = min(100, max(1, request.args.get("page_size", default=20, type=int)))

    query = Candidate.query
    if status:
        query = query.filter(Candidate.status == status)

    candidates = query.all()

    if q:
        candidates = [candidate for candidate in candidates if matches_query(candidate, q)]
    if skill_filters:
        candidates = [
            candidate for candidate in candidates if has_skills(candidate, skill_filters)
        ]

    candidates = sort_candidates(candidates, sort)
    total = len(candidates)
    start = (page - 1) * page_size
    end = start + page_size

    return ok_response(
        {
            "items": [
                serialize_candidate_summary(candidate) for candidate in candidates[start:end]
            ],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    )


@candidates_bp.get("/<int:candidate_id>")
@require_auth
def get_candidate(candidate_id: int):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return error_response("NOT_FOUND", "候选人不存在。", status=404)
    return ok_response(serialize_candidate_detail(candidate))


@candidates_bp.delete("/<int:candidate_id>")
@require_auth
def delete_candidate(candidate_id: int):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return error_response("NOT_FOUND", "候选人不存在。", status=404)

    submitted_job = JobDescription.query.filter_by(submitted_resume_id=candidate.id).first()
    if submitted_job:
        return error_response(
            "RESUME_IN_USE",
            "该简历版本已用于职位投递，请先解除关联。",
            status=409,
        )

    if candidate.profile:
        db.session.delete(candidate.profile)

    make_resume_storage(candidate.storage_backend).delete(candidate.pdf_path)
    db.session.delete(candidate)
    db.session.commit()
    return ok_response({"id": candidate_id, "deleted": True})


@candidates_bp.patch("/<int:candidate_id>/profile")
@require_auth
def update_candidate_profile(candidate_id: int):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return error_response("NOT_FOUND", "候选人不存在。", status=404)

    payload = request.get_json(silent=True) or {}
    profile = candidate.profile or ResumeProfile(candidate_id=candidate.id)
    profile.name = str(payload.get("name") or "")
    profile.phone = str(payload.get("phone") or "")
    profile.email = str(payload.get("email") or "")
    profile.city = str(payload.get("city") or "")
    profile.education = ensure_list(payload.get("education"))
    profile.work_experience = ensure_list(payload.get("work_experience"))
    profile.skills = [str(skill) for skill in ensure_list(payload.get("skills"))]
    profile.projects = ensure_list(payload.get("projects"))
    db.session.add(profile)
    db.session.commit()

    return ok_response(serialize_candidate_detail(candidate))


@candidates_bp.patch("/<int:candidate_id>/status")
@require_auth
def update_candidate_status(candidate_id: int):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return error_response("NOT_FOUND", "候选人不存在。", status=404)

    payload = request.get_json(silent=True) or {}
    status = str(payload.get("status") or "")
    if status not in CANDIDATE_STATUSES:
        return error_response("INVALID_STATUS", "候选人状态不合法。", status=400)

    candidate.status = status
    db.session.commit()
    return ok_response(serialize_candidate_detail(candidate))


@candidates_bp.post("/compare")
@require_auth
def compare_candidates():
    payload = request.get_json(silent=True) or {}
    ids = payload.get("candidate_ids") or []
    if not isinstance(ids, list) or not 2 <= len(ids) <= 3:
        return error_response("INVALID_COMPARE_SIZE", "请选择 2-3 名候选人进行对比。", status=400)

    candidates = Candidate.query.filter(Candidate.id.in_(ids)).all()
    if len(candidates) != len(set(ids)):
        return error_response("NOT_FOUND", "候选人不存在。", status=404)

    order = {candidate_id: index for index, candidate_id in enumerate(ids)}
    candidates.sort(key=lambda candidate: order.get(candidate.id, 0))
    return ok_response(
        {"candidates": [serialize_candidate_detail(candidate) for candidate in candidates]}
    )


@candidates_bp.get("/<int:candidate_id>/pdf")
@require_auth
def get_candidate_pdf(candidate_id: int):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return error_response("NOT_FOUND", "候选人不存在。", status=404)

    try:
        pdf_content = make_resume_storage(candidate.storage_backend).read(candidate.pdf_path)
    except FileNotFoundError:
        return error_response("PDF_NOT_FOUND", "原始 PDF 文件不存在。", status=404)

    return send_file(
        BytesIO(pdf_content),
        mimetype="application/pdf",
        download_name=candidate.original_filename,
    )
