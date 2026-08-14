import uuid

from flask import Blueprint, Response, request, stream_with_context
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

from ..constants import MAX_UPLOAD_FILES
from ..extensions import db
from ..models import Candidate
from ..security import require_auth
from ..services.ai_service import make_ai_service
from ..services.pdf_service import extract_pdf_text
from ..services.profile_service import normalize_profile, upsert_profile
from ..services.resume_storage import make_resume_storage
from ..utils.responses import error_response, ok_response
from ..utils.serializers import serialize_candidate_detail, serialize_candidate_summary
from ..utils.sse import sse_event

uploads_bp = Blueprint("uploads", __name__)


@uploads_bp.post("/resumes")
@require_auth
def upload_resumes():
    files = request.files.getlist("files")
    if not files:
        return error_response("NO_FILES", "请至少上传一个 PDF 文件。", status=400)
    if len(files) > MAX_UPLOAD_FILES:
        return error_response(
            "TOO_MANY_FILES",
            f"单次最多上传 {MAX_UPLOAD_FILES} 个 PDF 文件。",
            status=400,
        )

    batch_id = uuid.uuid4().hex
    validation_errors = [validate_pdf_upload(file) for file in files]
    if any(validation_errors):
        return next(error for error in validation_errors if error)

    candidates: list[Candidate] = []
    storage = make_resume_storage()
    try:
        for file in files:
            original_filename = file.filename or "resume.pdf"
            storage_name = f"{uuid.uuid4().hex}-{secure_filename(original_filename)}"
            pdf_path = storage.save(file, storage_name)

            candidate = Candidate(
                upload_batch_id=batch_id,
                original_filename=original_filename,
                pdf_path=pdf_path,
                storage_backend=storage.backend,
                parse_status="uploaded",
            )
            db.session.add(candidate)
            candidates.append(candidate)
        db.session.commit()
    except Exception:
        db.session.rollback()
        for candidate in candidates:
            storage.delete(candidate.pdf_path)
        raise

    return ok_response(
        {
            "upload_id": batch_id,
            "candidates": [serialize_candidate_summary(candidate) for candidate in candidates],
        },
        status=202,
    )


@uploads_bp.get("/<upload_id>/events")
@require_auth
def upload_events(upload_id: str):
    def event_stream():
        candidates = (
            Candidate.query.filter_by(upload_batch_id=upload_id)
            .order_by(Candidate.id.asc())
            .all()
        )
        if not candidates:
            yield sse_event("error", {"upload_id": upload_id, "message": "上传批次不存在。"})
            return

        for candidate in candidates:
            yield sse_event(
                "uploaded",
                {"upload_id": upload_id, "candidate": serialize_candidate_summary(candidate)},
            )

            if candidate.parse_status == "completed":
                yield sse_event(
                    "completed",
                    {"upload_id": upload_id, "candidate": serialize_candidate_detail(candidate)},
                )
                continue

            try:
                candidate.parse_status = "parsing"
                candidate.error_message = None
                db.session.commit()
                yield sse_event(
                    "parsing",
                    {"upload_id": upload_id, "candidate": serialize_candidate_summary(candidate)},
                )

                storage = make_resume_storage(candidate.storage_backend)
                text = extract_pdf_text(storage.read(candidate.pdf_path))
                if not text:
                    raise ValueError("未能从 PDF 中提取文本，扫描版 PDF 暂不支持 OCR。")

                candidate.raw_text = text
                candidate.parse_status = "extracting"
                db.session.commit()
                yield sse_event(
                    "extracting",
                    {"upload_id": upload_id, "candidate": serialize_candidate_summary(candidate)},
                )

                ai = make_ai_service()
                accumulated_chunks = []
                for chunk in ai.extract_resume_stream(text):
                    accumulated_chunks.append(chunk)
                    yield sse_event(
                        "extract_chunk",
                        {
                            "upload_id": upload_id,
                            "candidate_id": candidate.id,
                            "chunk": chunk,
                        },
                    )

                full_json_str = "".join(accumulated_chunks)
                try:
                    profile_payload = ai._extract_json(full_json_str)
                except Exception:
                    profile_payload = ai.extract_resume(text)

                profile_payload = normalize_profile(profile_payload)
                upsert_profile(candidate, profile_payload)
                candidate.parse_status = "completed"
                db.session.commit()

                yield sse_event(
                    "partial_result",
                    {"upload_id": upload_id, "candidate": serialize_candidate_detail(candidate)},
                )
                yield sse_event(
                    "completed",
                    {"upload_id": upload_id, "candidate": serialize_candidate_detail(candidate)},
                )
            except Exception as exc:  # noqa: BLE001
                candidate.parse_status = "failed"
                candidate.error_message = str(exc)
                db.session.commit()
                yield sse_event(
                    "error",
                    {
                        "upload_id": upload_id,
                        "candidate": serialize_candidate_summary(candidate),
                        "message": str(exc),
                    },
                )

    return Response(stream_with_context(event_stream()), mimetype="text/event-stream")


def validate_pdf_upload(file: FileStorage):
    filename = file.filename or ""
    mimetype = file.mimetype or ""
    if not filename.lower().endswith(".pdf"):
        return error_response("INVALID_FILE_TYPE", "仅支持 PDF 文件。", status=400)
    if mimetype and mimetype not in {"application/pdf", "application/octet-stream"}:
        return error_response("INVALID_FILE_TYPE", "仅支持 PDF 文件。", status=400)
    return None
