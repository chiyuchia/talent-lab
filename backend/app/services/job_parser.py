import re
from typing import Any

from ..constants import EMPLOYMENT_TYPES
from .job_normalizers import (
    normalize_named_requirements,
    normalize_skill_requirements,
    normalize_string_dict,
    normalize_string_list,
    parse_optional_number,
)
from .job_parser_rules import (
    BONUS_MARKERS,
    REQUIRED_MARKERS,
    SKILL_PATTERNS,
    extract_education,
    extract_enum,
    extract_experience_range,
    extract_labeled_value,
    extract_responsibilities,
    extract_salary,
    extract_title,
)
from .prompts import JOB_PARSER_SYSTEM_PROMPT


class JobParserMixin:
    def parse_job_description(self, text: str) -> dict[str, Any]:
        raw_jd = text.strip()
        if self.mode == "real":
            parsed = self._call_json_model(
                [
                    {"role": "system", "content": JOB_PARSER_SYSTEM_PROMPT},
                    {"role": "user", "content": raw_jd[:20000]},
                ]
            )
        else:
            parsed = self._parse_job_description_mock(raw_jd)
        return self._normalize_parsed_job(parsed, raw_jd)

    def _parse_job_description_mock(self, text: str) -> dict[str, Any]:
        skills = []
        bonus_section = False
        for line in text.splitlines():
            lowered = line.strip().casefold()
            if any(marker in lowered for marker in BONUS_MARKERS):
                bonus_section = True
            elif any(marker in lowered for marker in REQUIRED_MARKERS):
                bonus_section = False
            for name, pattern in SKILL_PATTERNS:
                if re.search(pattern, line, flags=re.IGNORECASE):
                    years = self._line_years(line)
                    proficiency = self._line_proficiency(line)
                    skills.append(
                        {
                            "name": name,
                            "importance": "preferred" if bonus_section else "required",
                            "min_years": years,
                            "proficiency": proficiency,
                        }
                    )
        experience_min, experience_max = extract_experience_range(text)
        salary_min, salary_max, currency, period = extract_salary(text)
        location = extract_labeled_value(text, r"工作地点|地点|location")
        return {
            "company_name": extract_labeled_value(text, r"公司(?:名称)?|company"),
            "title": extract_title(text),
            "locations": [location] if location else [],
            "work_mode": extract_enum(
                text,
                (
                    ("remote", r"远程|remote"),
                    ("hybrid", r"混合办公|hybrid"),
                    ("on_site", r"现场办公|onsite|on-site"),
                ),
            ),
            "employment_type": [
                value
                for value, pattern in (
                    ("full_time", r"全职|\bfull[\s-]?time\b"),
                    ("part_time", r"兼职|\bpart[\s-]?time\b"),
                    ("contract", r"合同工|\bcontract(?:or)?\b"),
                    ("internship", r"实习|\bintern(?:ship)?\b"),
                )
                if re.search(pattern, text, flags=re.IGNORECASE)
            ],
            "seniority": self._extract_seniority(text),
            "responsibilities": extract_responsibilities(text),
            "experience_min_years": experience_min,
            "experience_max_years": experience_max,
            "minimum_education": extract_education(text),
            "skill_requirements": skills,
            "salary_min": salary_min,
            "salary_max": salary_max,
            "salary_currency": currency,
            "salary_period": period,
        }

    def _normalize_parsed_job(self, parsed: dict[str, Any], raw_jd: str) -> dict[str, Any]:
        skills = parsed.get("skill_requirements")
        if not isinstance(skills, list):
            skills = [
                *self._legacy_skills(parsed.get("required_skills"), "required"),
                *self._legacy_skills(parsed.get("bonus_skills"), "preferred"),
            ]
        skills = normalize_skill_requirements(skills)
        result = {
            "company_name": self._string(parsed.get("company_name"), 160),
            "title": self._string(parsed.get("title") or extract_title(raw_jd), 160),
            "raw_jd": raw_jd,
            "description": raw_jd,
            "summary": self._string(parsed.get("summary"), 2000),
            "locations": normalize_string_list(parsed.get("locations")),
            "work_mode": self._string(parsed.get("work_mode"), 32),
            "employment_type": [
                value
                for value in normalize_string_list(parsed.get("employment_type"))
                if value in EMPLOYMENT_TYPES
            ],
            "seniority": self._string(parsed.get("seniority"), 32),
            "department": self._string(parsed.get("department"), 160),
            "responsibilities": normalize_string_list(parsed.get("responsibilities")),
            "experience_min_years": self._safe_number(parsed.get("experience_min_years")),
            "experience_max_years": self._safe_number(parsed.get("experience_max_years")),
            "minimum_education": self._string(parsed.get("minimum_education"), 32),
            "preferred_majors": normalize_string_list(parsed.get("preferred_majors")),
            "skill_requirements": skills,
            "language_requirements": normalize_named_requirements(
                parsed.get("language_requirements"), "language"
            ),
            "certification_requirements": normalize_named_requirements(
                parsed.get("certification_requirements"), "name"
            ),
            "industry_experience": normalize_string_list(parsed.get("industry_experience")),
            "constraints": normalize_string_dict(parsed.get("constraints")),
            "other_requirements": normalize_string_list(parsed.get("other_requirements")),
            "salary_min": self._safe_number(parsed.get("salary_min")),
            "salary_max": self._safe_number(parsed.get("salary_max")),
            "salary_currency": self._string(parsed.get("salary_currency"), 8),
            "salary_period": self._string(parsed.get("salary_period"), 16),
            "benefits": normalize_string_list(parsed.get("benefits")),
        }
        result["required_skills"] = [
            item["name"] for item in skills if item["importance"] == "required"
        ]
        result["bonus_skills"] = [
            item["name"] for item in skills if item["importance"] == "preferred"
        ]
        return result

    @staticmethod
    def _legacy_skills(value: Any, importance: str) -> list[dict[str, str]]:
        return [{"name": name, "importance": importance} for name in normalize_string_list(value)]

    @staticmethod
    def _safe_number(value: Any) -> float | None:
        try:
            return parse_optional_number(value, "数值")
        except ValueError:
            match = re.search(r"\d+(?:\.\d+)?", str(value or ""))
            return float(match.group()) if match else None

    @staticmethod
    def _string(value: Any, limit: int) -> str:
        return str(value or "").strip()[:limit]

    @staticmethod
    def _line_years(line: str) -> float | None:
        match = re.search(r"(\d+(?:\.\d+)?)\s*年", line)
        return float(match.group(1)) if match else None

    @staticmethod
    def _line_proficiency(line: str) -> str | None:
        levels = (
            ("expert", "精通"),
            ("proficient", "熟练"),
            ("familiar", "熟悉"),
            ("basic", "了解"),
        )
        for value, marker in levels:
            if marker in line:
                return value
        return None

    @staticmethod
    def _extract_seniority(text: str) -> str:
        return extract_enum(
            extract_title(text),
            (
                ("intern", r"实习|intern"),
                ("expert", r"专家|expert|principal"),
                ("manager", r"经理|主管|manager|lead"),
                ("senior", r"高级|资深|senior|staff"),
                ("entry", r"初级|junior"),
            ),
        )
