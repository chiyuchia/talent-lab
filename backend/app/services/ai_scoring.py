import json
import re
from datetime import datetime
from typing import Any

from .prompts import CANDIDATE_EVALUATOR_SYSTEM_PROMPT


class AiScoringMixin:
    def score_candidate(self, profile: dict[str, Any], job: dict[str, Any]) -> dict[str, Any]:
        if self.mode == "real":
            return self._score_candidate_real(profile, job)

        candidate_skills = {str(skill).casefold() for skill in profile.get("skills", [])}
        required_skills, preferred_skills, display_names = self._job_skills(job)
        required_matches = candidate_skills & required_skills
        preferred_matches = candidate_skills & preferred_skills
        required_part = len(required_matches) / len(required_skills) if required_skills else 1
        preferred_part = len(preferred_matches) / len(preferred_skills) if preferred_skills else 1
        skill_score = round(required_part * 80 + preferred_part * 20)
        experience_score, candidate_years = self._experience_score(profile, job)
        education_score, education_risk = self._education_score(profile, job)
        total_score = round(skill_score * 0.5 + experience_score * 0.3 + education_score * 0.2)

        missing_required = sorted(required_skills - candidate_skills)
        risks = [f"缺少必备技能：{display_names.get(skill, skill)}" for skill in missing_required]
        min_years = job.get("experience_min_years")
        if min_years is not None and candidate_years < float(min_years):
            risks.append(f"相关经验约 {candidate_years:g} 年，低于要求的 {float(min_years):g} 年")
        if education_risk:
            risks.append(education_risk)
        matched_names = [display_names.get(skill, skill) for skill in sorted(required_matches)]
        preferred_names = [display_names.get(skill, skill) for skill in sorted(preferred_matches)]
        keywords = [
            item.get("name")
            for item in job.get("skill_requirements", [])
            if isinstance(item, dict) and item.get("name")
        ]
        highlights = []
        if job.get("work_mode") == "remote":
            highlights.append("支持远程办公")
        if job.get("salary_min") is not None or job.get("salary_max") is not None:
            highlights.append("薪资范围明确")
        if job.get("benefits"):
            highlights.append("职位描述提供了明确的福利信息")
        opportunity_risks = [
            f"{key}: {value}"
            for key, value in (job.get("constraints") or {}).items()
            if value
        ]

        return {
            "total_score": total_score,
            "skill_score": skill_score,
            "experience_score": experience_score,
            "education_score": education_score,
            "ai_comment": "本地模拟评分：已按职位的技能、经验和教育要求进行匹配。",
            "details": {
                "matched_required_skills": matched_names,
                "matched_bonus_skills": preferred_names,
                "missing_required_skills": [
                    display_names.get(skill, skill) for skill in missing_required
                ],
                "hard_requirement_risks": risks,
                "keywords": keywords,
                "resume_suggestions": [
                    f"在简历中补充与 {display_names.get(skill, skill)} 相关的真实项目证据"
                    for skill in missing_required[:3]
                ],
                "cover_letter_points": [
                    f"用量化成果说明 {skill} 能力" for skill in matched_names[:3]
                ],
                "interview_questions": [
                    f"准备一个使用 {skill} 解决实际问题的案例" for skill in keywords[:3]
                ],
                "opportunity_highlights": highlights,
                "opportunity_risks": opportunity_risks,
            },
        }

    def _job_skills(self, job: dict[str, Any]):
        structured = job.get("skill_requirements") or []
        if structured:
            required = {
                str(item.get("name") or "").casefold()
                for item in structured
                if isinstance(item, dict) and item.get("importance") != "preferred"
            }
            preferred = {
                str(item.get("name") or "").casefold()
                for item in structured
                if isinstance(item, dict) and item.get("importance") == "preferred"
            }
            names = {
                str(item.get("name") or "").casefold(): str(item.get("name") or "")
                for item in structured
                if isinstance(item, dict) and item.get("name")
            }
            return required - {""}, preferred - {""}, names
        required = {str(skill).casefold() for skill in job.get("required_skills", [])}
        preferred = {str(skill).casefold() for skill in job.get("bonus_skills", [])}
        return required, preferred, {skill: skill for skill in required | preferred}

    def _experience_score(self, profile: dict[str, Any], job: dict[str, Any]):
        work = profile.get("work_experience") or []
        years = sum(
            self._period_years(item.get("period", ""))
            for item in work
            if isinstance(item, dict)
        )
        minimum = job.get("experience_min_years")
        if minimum is None:
            return (75 if work else 50), years
        minimum = float(minimum)
        return (100 if minimum == 0 else min(100, round(years / minimum * 100))), years

    @staticmethod
    def _period_years(period: str) -> float:
        years = [int(value) for value in re.findall(r"(?:19|20)\d{2}", str(period))]
        if not years:
            return 0
        end = years[1] if len(years) > 1 else datetime.utcnow().year
        return max(0, end - years[0])

    @staticmethod
    def _education_score(profile: dict[str, Any], job: dict[str, Any]):
        required = str(job.get("minimum_education") or "")
        education = profile.get("education") or []
        if not required:
            return (75 if education else 50), ""
        ranks = {
            "high_school": 1,
            "associate": 2,
            "bachelor": 3,
            "master": 4,
            "doctorate": 5,
            "高中": 1,
            "大专": 2,
            "专科": 2,
            "本科": 3,
            "学士": 3,
            "硕士": 4,
            "博士": 5,
        }
        candidate_rank = max(
            (
                ranks.get(str(item.get("degree") or "").casefold(), 0)
                for item in education
                if isinstance(item, dict)
            ),
            default=0,
        )
        required_rank = ranks.get(required, 0)
        if candidate_rank >= required_rank:
            return 100, ""
        return max(0, round(candidate_rank / required_rank * 100)), "学历低于职位最低要求"

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
