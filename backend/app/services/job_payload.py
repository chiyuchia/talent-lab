from typing import Any
from urllib.parse import urlparse

from .job_fields import (
    DATE_FIELDS,
    DATETIME_FIELDS,
    ENUM_FIELDS,
    FLOAT_FIELDS,
    LIST_FIELDS,
    LIST_ENUM_FIELDS,
    STRING_FIELDS,
)
from .job_normalizers import (
    JobValidationError,
    normalize_contacts,
    normalize_named_requirements,
    normalize_skill_requirements,
    normalize_string_dict,
    normalize_string_list,
    parse_optional_date,
    parse_optional_datetime,
    parse_optional_number,
)


def build_job_values(payload: dict[str, Any], current=None) -> dict[str, Any]:
    values = current_values(current)
    if "raw_jd" in payload or "description" in payload:
        raw_jd = payload.get("raw_jd", payload.get("description"))
        values["description"] = str(raw_jd or "").strip()[:20_000]
    for field, max_length in STRING_FIELDS.items():
        if field in payload:
            values[field] = str(payload.get(field) or "").strip()[:max_length] or None
    for field in LIST_FIELDS:
        if field in payload:
            values[field] = normalize_string_list(payload.get(field))
    for field in FLOAT_FIELDS:
        if field in payload:
            values[field] = parse_optional_number(payload.get(field), field)
    for field in DATE_FIELDS:
        if field in payload:
            values[field] = parse_optional_date(payload.get(field), field)
    for field in DATETIME_FIELDS:
        if field in payload:
            values[field] = parse_optional_datetime(payload.get(field), field)
    apply_special_fields(values, payload)
    apply_skills(values, payload)
    validate_job_values(values, require_company=uses_new_contract(payload, current))
    return values


def apply_special_fields(values: dict[str, Any], payload: dict[str, Any]) -> None:
    if "is_favorite" in payload:
        values["is_favorite"] = bool(payload.get("is_favorite"))
    if "submitted_resume_id" in payload:
        resume_id = payload.get("submitted_resume_id")
        try:
            values["submitted_resume_id"] = (
                int(resume_id) if resume_id not in (None, "") else None
            )
        except (TypeError, ValueError) as exc:
            raise JobValidationError("关联的简历版本不合法。") from exc
    if "constraints" in payload:
        values["constraints"] = normalize_string_dict(payload.get("constraints"))
    if "language_requirements" in payload:
        values["language_requirements"] = normalize_named_requirements(
            payload.get("language_requirements"), "language"
        )
    if "certification_requirements" in payload:
        values["certification_requirements"] = normalize_named_requirements(
            payload.get("certification_requirements"), "name"
        )
    if "contacts" in payload:
        values["contacts"] = normalize_contacts(payload.get("contacts"))


def validate_job_values(values: dict[str, Any], *, require_company: bool) -> None:
    if not values.get("title"):
        raise JobValidationError("职位名称不能为空。")
    if require_company and not values.get("company_name"):
        raise JobValidationError("公司名称不能为空。")
    for field, allowed in ENUM_FIELDS.items():
        value = values.get(field)
        if value and value not in allowed:
            raise JobValidationError(f"字段 {field} 的值不合法。")
    for field, allowed in LIST_ENUM_FIELDS.items():
        if any(value not in allowed for value in values.get(field, [])):
            raise JobValidationError(f"字段 {field} 的值不合法。")
    source_url = values.get("source_url")
    if source_url:
        parsed = urlparse(source_url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise JobValidationError("职位描述链接格式不正确。")
    validate_range(values, "experience_min_years", "experience_max_years", "经验年限")
    validate_range(values, "salary_min", "salary_max", "薪资")


def current_values(current) -> dict[str, Any]:
    fields = {
        "description",
        *STRING_FIELDS,
        *LIST_FIELDS,
        *FLOAT_FIELDS,
        *DATE_FIELDS,
        *DATETIME_FIELDS,
        "is_favorite",
        "submitted_resume_id",
        "constraints",
        "language_requirements",
        "certification_requirements",
        "contacts",
        "skill_requirements",
        "required_skills",
        "bonus_skills",
    }
    if current:
        return {field: getattr(current, field) for field in fields}
    values = {field: [] for field in LIST_FIELDS}
    values.update(
        {
            "description": "",
            "application_status": "saved",
            "priority": "medium",
            "is_favorite": False,
            "constraints": {},
            "language_requirements": [],
            "certification_requirements": [],
            "contacts": [],
            "skill_requirements": [],
            "required_skills": [],
            "bonus_skills": [],
        }
    )
    return values


def apply_skills(values: dict[str, Any], payload: dict[str, Any]) -> None:
    if "skill_requirements" in payload:
        skills = normalize_skill_requirements(payload.get("skill_requirements"))
    elif "required_skills" in payload or "bonus_skills" in payload:
        required = normalize_string_list(
            payload.get("required_skills", values.get("required_skills"))
        )
        bonus = normalize_string_list(payload.get("bonus_skills", values.get("bonus_skills")))
        skills = normalize_skill_requirements(
            [
                *[{"name": name, "importance": "required"} for name in required],
                *[{"name": name, "importance": "preferred"} for name in bonus],
            ]
        )
    else:
        return
    values["skill_requirements"] = skills
    values["required_skills"] = [
        item["name"] for item in skills if item["importance"] == "required"
    ]
    values["bonus_skills"] = [
        item["name"] for item in skills if item["importance"] == "preferred"
    ]


def validate_range(values: dict[str, Any], low: str, high: str, label: str) -> None:
    if values.get(low) is not None and values.get(high) is not None:
        if values[low] > values[high]:
            raise JobValidationError(f"{label}下限不能高于上限。")


def uses_new_contract(payload: dict[str, Any], current) -> bool:
    return bool(payload.get("company_name")) or "raw_jd" in payload or bool(
        current and current.company_name
    )
