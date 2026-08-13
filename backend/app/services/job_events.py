from datetime import datetime
from typing import Any

from ..constants import APPLICATION_EVENT_TYPES, APPLICATION_STATUSES
from ..models import ApplicationEvent, JobDescription
from .job_normalizers import JobValidationError, parse_optional_datetime

STATUS_TITLES = {
    "saved": "收藏职位",
    "preparing": "开始准备申请",
    "applied": "已提交申请",
    "assessment": "进入笔试或测评",
    "interview": "进入面试",
    "offer": "收到 Offer",
    "accepted": "已接受 Offer",
    "rejected": "申请未通过",
    "withdrawn": "主动结束申请",
}
EVENT_TITLES = {
    "interview": "面试",
    "assessment": "笔试或测评",
    "offer": "Offer 进展",
    "note": "新增备注",
    "task": "新增待办",
}


def add_status_event(
    job: JobDescription,
    status: str,
    *,
    occurred_at: datetime | None = None,
    notes: str = "",
) -> ApplicationEvent:
    if status not in APPLICATION_STATUSES:
        raise JobValidationError("申请状态不合法。")
    job.application_status = status
    event = ApplicationEvent(
        job=job,
        event_type="status_change",
        status=status,
        occurred_at=occurred_at or datetime.utcnow(),
        title=STATUS_TITLES[status],
        notes=notes.strip()[:5000],
    )
    return event


def build_application_event(
    job: JobDescription, payload: dict[str, Any]
) -> ApplicationEvent:
    event_type = str(payload.get("type") or "").strip()
    if event_type not in APPLICATION_EVENT_TYPES:
        raise JobValidationError("申请事件类型不合法。")
    occurred_at = parse_optional_datetime(payload.get("occurred_at"), "事件时间")
    status = str(payload.get("status") or "").strip() or None
    if event_type == "status_change":
        if not status:
            raise JobValidationError("状态事件必须提供申请状态。")
        return add_status_event(
            job,
            status,
            occurred_at=occurred_at,
            notes=str(payload.get("notes") or ""),
        )
    if status:
        if status not in APPLICATION_STATUSES:
            raise JobValidationError("申请状态不合法。")
        job.application_status = status
    title = str(payload.get("title") or EVENT_TITLES[event_type]).strip()[:200]
    return ApplicationEvent(
        job=job,
        event_type=event_type,
        status=status,
        occurred_at=occurred_at or datetime.utcnow(),
        title=title,
        notes=str(payload.get("notes") or "").strip()[:5000],
    )
