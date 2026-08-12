import json
from typing import Any

from .prompts import CANDIDATE_EVALUATOR_SYSTEM_PROMPT


class AiScoringMixin:
    def score_candidate(self, profile: dict[str, Any], job: dict[str, Any]) -> dict[str, Any]:
        if self.mode == "real":
            return self._score_candidate_real(profile, job)

        candidate_skills = {str(skill).lower() for skill in profile.get("skills", [])}
        required_skills = {str(skill).lower() for skill in job.get("required_skills", [])}
        bonus_skills = {str(skill).lower() for skill in job.get("bonus_skills", [])}
        required_hits = len(candidate_skills & required_skills)
        bonus_hits = len(candidate_skills & bonus_skills)
        skill_score = 60
        if required_skills:
            skill_score = min(
                100, round(required_hits / len(required_skills) * 80 + bonus_hits * 5)
            )
        experience_score = 75 if profile.get("work_experience") else 50
        education_score = 75 if profile.get("education") else 50
        total_score = round(skill_score * 0.5 + experience_score * 0.3 + education_score * 0.2)

        return {
            "total_score": total_score,
            "skill_score": skill_score,
            "experience_score": experience_score,
            "education_score": education_score,
            "ai_comment": "本地模拟评分：候选人与该岗位具备基础匹配度。",
            "details": {
                "matched_required_skills": sorted(candidate_skills & required_skills),
                "matched_bonus_skills": sorted(candidate_skills & bonus_skills),
            },
        }

    def _score_candidate_real(self, profile: dict[str, Any], job: dict[str, Any]) -> dict[str, Any]:
        result = self._call_json_model(
            [
                {"role": "system", "content": CANDIDATE_EVALUATOR_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": json.dumps(
                        {"profile": profile, "job": job}, ensure_ascii=False
                    ),
                },
            ]
        )
        return self._normalize_score(result)

    def _normalize_score(self, value: dict[str, Any]) -> dict[str, Any]:
        def score(key: str) -> int:
            return max(0, min(100, int(value.get(key, 0))))

        return {
            "total_score": score("total_score"),
            "skill_score": score("skill_score"),
            "experience_score": score("experience_score"),
            "education_score": score("education_score"),
            "ai_comment": str(value.get("ai_comment", "")),
            "details": value.get("details") if isinstance(value.get("details"), dict) else {},
        }
