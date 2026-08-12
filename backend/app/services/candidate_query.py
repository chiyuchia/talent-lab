from typing import Any

from flask import request

from ..models import Candidate


def matches_query(candidate: Candidate, q: str) -> bool:
    terms = parse_query_terms(q)
    if not terms:
        return True

    haystack = "\n".join(get_candidate_search_values(candidate)).lower()
    return all(term in haystack for term in terms)


def parse_query_terms(value: str) -> list[str]:
    normalized = value.replace("，", ",")
    return [item.strip().lower() for item in normalized.replace(",", " ").split() if item.strip()]


def get_candidate_search_values(candidate: Candidate) -> list[str]:
    profile = candidate.profile
    values: list[str] = [
        candidate.original_filename,
        candidate.raw_text or "",
    ]

    if profile:
        values.extend(
            [
                profile.name or "",
                profile.phone or "",
                profile.email or "",
                profile.city or "",
            ]
        )
        values.extend(flatten_search_values(profile.skills))
        values.extend(flatten_search_values(profile.education))
        values.extend(flatten_search_values(profile.work_experience))
        values.extend(flatten_search_values(profile.projects))

    return values


def flatten_search_values(value: Any) -> list[str]:
    if value is None:
        return []

    if isinstance(value, str):
        return [value]

    if isinstance(value, int | float | bool):
        return [str(value)]

    if isinstance(value, dict):
        values: list[str] = []
        for item in value.values():
            values.extend(flatten_search_values(item))
        return values

    if isinstance(value, list | tuple | set):
        values: list[str] = []
        for item in value:
            values.extend(flatten_search_values(item))
        return values

    return [str(value)]


def parse_skill_filters() -> list[str]:
    raw_values = [*request.args.getlist("skill"), *request.args.getlist("skills")]
    filters: list[str] = []
    seen: set[str] = set()

    for raw_value in raw_values:
        for item in str(raw_value).replace("，", ",").split(","):
            normalized = item.strip().lower()
            if not normalized or normalized in seen:
                continue
            filters.append(normalized)
            seen.add(normalized)

    return filters


def has_skills(candidate: Candidate, skill_filters: list[str]) -> bool:
    if not candidate.profile:
        return False

    candidate_skills = [str(item).lower() for item in candidate.profile.skills or []]
    return all(
        any(skill_filter in candidate_skill for candidate_skill in candidate_skills)
        for skill_filter in skill_filters
    )


def sort_candidates(candidates: list[Candidate], sort: str) -> list[Candidate]:
    reverse = sort.startswith("-")
    key = sort[1:] if reverse else sort

    if key == "score":
        return sorted(
            candidates,
            key=lambda candidate: max(
                (score.total_score for score in candidate.scores), default=-1
            ),
            reverse=reverse,
        )
    if key == "name":
        return sorted(
            candidates,
            key=lambda candidate: (candidate.profile.name if candidate.profile else "") or "",
            reverse=reverse,
        )
    return sorted(candidates, key=lambda candidate: candidate.created_at, reverse=reverse)
