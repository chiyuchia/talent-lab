from datetime import date, datetime
from typing import Any


class JobValidationError(ValueError):
    pass


def normalize_skill_requirements(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    result = []
    seen = set()
    for raw in value:
        item = raw if isinstance(raw, dict) else {"name": raw}
        name = str(item.get("name") or "").strip()[:80]
        key = name.casefold()
        if not name or key in seen:
            continue
        importance = str(item.get("importance") or "required")
        proficiency = str(item.get("proficiency") or "") or None
        if importance not in {"required", "preferred"}:
            raise JobValidationError("技能必备性不合法。")
        if proficiency not in {None, "basic", "familiar", "proficient", "expert"}:
            raise JobValidationError("技能熟练度不合法。")
        result.append(
            {
                "name": name,
                "importance": importance,
                "min_years": parse_optional_number(item.get("min_years"), "技能最低年限"),
                "proficiency": proficiency,
            }
        )
        seen.add(key)
    return result[:50]


def normalize_named_requirements(value: Any, name_key: str) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []
    result = []
    for raw in value:
        if not isinstance(raw, dict):
            continue
        name = str(raw.get(name_key) or "").strip()[:120]
        if name:
            result.append(
                {
                    name_key: name,
                    "level": str(raw.get("level") or "").strip()[:80],
                    "importance": "preferred"
                    if raw.get("importance") == "preferred"
                    else "required",
                }
            )
    return result[:20]


def normalize_contacts(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []
    fields = ("name", "role", "contact", "notes")
    return [
        {field: str(item.get(field) or "").strip()[:500] for field in fields}
        for item in value[:20]
        if isinstance(item, dict) and any(str(item.get(field) or "").strip() for field in fields)
    ]


def normalize_string_list(value: Any) -> list[str]:
    if isinstance(value, str):
        value = value.replace("，", ",").split(",")
    if not isinstance(value, list):
        return []
    result = []
    seen = set()
    for item in value:
        cleaned = str(item).strip()[:500]
        key = cleaned.casefold()
        if cleaned and key not in seen:
            result.append(cleaned)
            seen.add(key)
    return result[:100]


def normalize_string_dict(value: Any) -> dict[str, str]:
    if not isinstance(value, dict):
        return {}
    return {str(key): str(item or "").strip()[:1000] for key, item in value.items()}


def parse_optional_number(value: Any, field: str) -> float | None:
    if value in (None, ""):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError) as exc:
        raise JobValidationError(f"{field} 必须是数字。") from exc
    if number < 0:
        raise JobValidationError(f"{field} 不能小于 0。")
    return number


def parse_optional_date(value: Any, field: str) -> date | None:
    if value in (None, ""):
        return None
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError as exc:
        raise JobValidationError(f"{field} 日期格式不正确。") from exc


def parse_optional_datetime(value: Any, field: str) -> datetime | None:
    if value in (None, ""):
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00")).replace(tzinfo=None)
    except ValueError as exc:
        raise JobValidationError(f"{field} 时间格式不正确。") from exc
