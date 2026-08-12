from ..extensions import db
from ..models import Candidate, ResumeProfile
from ..utils.payloads import ensure_list


def upsert_profile(candidate: Candidate, payload: dict) -> ResumeProfile:
    profile = candidate.profile or ResumeProfile(candidate_id=candidate.id)
    profile.name = payload["name"]
    profile.phone = payload["phone"]
    profile.email = payload["email"]
    profile.city = payload["city"]
    profile.education = payload["education"]
    profile.work_experience = payload["work_experience"]
    profile.skills = payload["skills"]
    profile.projects = payload["projects"]
    db.session.add(profile)
    return profile


def normalize_profile(payload: dict) -> dict:
    return {
        "name": str(payload.get("name") or ""),
        "phone": str(payload.get("phone") or ""),
        "email": str(payload.get("email") or ""),
        "city": str(payload.get("city") or ""),
        "education": ensure_list(payload.get("education")),
        "work_experience": ensure_list(payload.get("work_experience")),
        "skills": [str(skill) for skill in ensure_list(payload.get("skills"))],
        "projects": ensure_list(payload.get("projects")),
    }
